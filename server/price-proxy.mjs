// ─────────────────────────────────────────────────────────────────────────────
// Local price proxy: holds SERPAPI_KEY server-side (never sent to the browser)
// and returns the REAL, currently-available hotels in the base towns for the
// trip dates. Only hotels that (a) are a real hotel listing, (b) have a live
// nightly rate, and (c) confirm air conditioning (the hard requirement) are
// returned. Curated seed hotels are matched by id so the app can attach their
// hand-written notes; everything else is a real Google Hotels listing.
//
//   Start:  npm run proxy   →  GET http://localhost:8787/api/hotel-rates
// ─────────────────────────────────────────────────────────────────────────────
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { getTikTokCandidates } from './tiktok.mjs'

const here = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const out = {}
  try {
    for (const line of readFileSync(join(here, '..', '.env'), 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i > -1) out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
    }
  } catch {
    /* no .env */
  }
  return out
}

const ENV = loadEnv()
// process.env wins (Vercel/hosted); fall back to the local .env file.
const KEY = process.env.SERPAPI_KEY || ENV.SERPAPI_KEY || ''
const PORT = Number(ENV.PRICE_PROXY_PORT || process.env.PORT || 8787)
const ADULTS = '2'

// Two legs, each with its own dates and towns to search for live hotels.
const LEGS = [
  {
    id: 'basque',
    checkIn: '2026-08-03',
    checkOut: '2026-08-07',
    towns: ['San Sebastián', 'Bilbao', 'Getaria'],
  },
  {
    id: 'balearic',
    checkIn: '2026-08-07',
    checkOut: '2026-08-12',
    towns: ['Palma de Mallorca', 'Sóller', 'Ciutadella de Menorca', 'Mahón'],
  },
]

// No curated seed hotels for these regions — stays come entirely from Google.
const SEEDS = []

const STOP = new Set(['hotel', 'de', 'la', 'el', 's', 'del', 'les', 'can', 'spain'])

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function slug(name) {
  return normalize(name).replace(/ /g, '-')
}

export function distinctiveTokens(name) {
  return normalize(name)
    .split(' ')
    .filter((t) => t.length > 2 && !STOP.has(t))
}

/** A dining listing (has "restaurant" but not "hotel") — not a place to sleep. */
export function restaurantOnly(name) {
  const n = normalize(name)
  return /\brestaurant\b/.test(n) && !/\bhotel\b/.test(n)
}

/** Strict: does this Google property confidently correspond to the given seed? */
export function matchesSeed(seed, property) {
  const seedTokens = distinctiveTokens(seed.name)
  const townTokens = distinctiveTokens(seed.town)
  // A hotel named after its town is too ambiguous to match safely.
  if (seedTokens.length === 0 || seedTokens.every((t) => townTokens.includes(t))) {
    return false
  }
  if (property.type && property.type !== 'hotel') return false
  if (restaurantOnly(property.name)) return false
  const pn = normalize(property.name)
  return seedTokens.every((t) => pn.includes(t))
}

export function seedIdForProperty(property) {
  for (const seed of SEEDS) if (matchesSeed(seed, property)) return seed.id
  return null
}

/** True only when air conditioning is explicitly listed (honors the hard AC rule). */
export function hasAC(property) {
  const am = (property.amenities || []).join(' | ').toLowerCase()
  return /air con/.test(am)
}

/**
 * Build the list of real, AC-confirmed, currently-priced hotels. Input is an
 * array of {leg, town, props} entries (one per town query). Deduped by id
 * (curated seed id when matched, else slug of the name); each hotel is tagged
 * with its leg.
 */
export function buildHotelList(entries) {
  const byId = new Map()
  for (const { leg, town, kind = 'hotel', props } of entries) {
    for (const p of props || []) {
      // Hotels must be type 'hotel'; the rentals pass accepts vacation rentals.
      if (kind === 'hotel' && p.type && p.type !== 'hotel') continue
      const name = String(p.name || '')
      if (restaurantOnly(name)) continue // dining listing, not lodging
      const nightlyUSD = p.rate_per_night?.extracted_lowest
      if (typeof nightlyUSD !== 'number') continue // no live rate → not available
      if (!hasAC(p)) continue // hard requirement: air conditioning
      const seedId = kind === 'hotel' ? seedIdForProperty(p) : null
      const id = (seedId || slug(name)) + (kind === 'rental' ? '-rental' : '')
      if (byId.has(id)) continue // keep first occurrence
      byId.set(id, {
        id,
        kind,
        curated: Boolean(seedId),
        leg,
        name,
        town,
        nightlyUSD: Math.round(nightlyUSD),
        rating: typeof p.overall_rating === 'number' ? p.overall_rating : undefined,
        hotelClass:
          typeof p.extracted_hotel_class === 'number' ? p.extracted_hotel_class : undefined,
        coordinates: p.gps_coordinates
          ? { lat: p.gps_coordinates.latitude, lng: p.gps_coordinates.longitude }
          : undefined,
        thumbnailUrl: p.images?.[0]?.thumbnail,
        images: (p.images || [])
          .slice(0, 6)
          .map((im) => im.thumbnail || im.original_image)
          .filter(Boolean),
        link: typeof p.link === 'string' ? p.link : undefined,
      })
    }
  }
  // leg order, hotels before rentals, then by price
  const legRank = { basque: 0, balearic: 1 }
  return [...byId.values()].sort(
    (a, b) =>
      (legRank[a.leg] ?? 9) - (legRank[b.leg] ?? 9) ||
      Number(a.kind === 'rental') - Number(b.kind === 'rental') ||
      a.nightlyUSD - b.nightlyUSD,
  )
}

async function fetchTown(town, checkIn, checkOut, vacationRentals = false) {
  const params = {
    engine: 'google_hotels',
    q: `${vacationRentals ? 'vacation rentals' : 'hotels'} in ${town}, Spain`,
    check_in_date: checkIn,
    check_out_date: checkOut,
    adults: ADULTS,
    currency: 'USD',
    api_key: KEY,
  }
  if (vacationRentals) params.vacation_rentals = 'true'
  const res = await fetch('https://serpapi.com/search.json?' + new URLSearchParams(params))
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)
  return data.properties || []
}

const cache = { at: 0, data: null }
const TTL = 1000 * 60 * 60 * 6 // 6h

export async function getHotels() {
  if (cache.data && Date.now() - cache.at < TTL) return cache.data
  const entries = []
  for (const leg of LEGS) {
    for (const town of leg.towns) {
      // Hotels + vacation rentals (Airbnb/Vrbo-style), each priced per leg.
      entries.push({
        leg: leg.id,
        town,
        kind: 'hotel',
        props: await fetchTown(town, leg.checkIn, leg.checkOut, false),
      })
      entries.push({
        leg: leg.id,
        town,
        kind: 'rental',
        props: (await fetchTown(town, leg.checkIn, leg.checkOut, true)).slice(0, 12),
      })
    }
  }
  const hotels = buildHotelList(entries)
  cache.at = Date.now()
  cache.data = hotels
  return hotels
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.url === '/' || req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(KEY ? 'ok' : 'missing SERPAPI_KEY')
      return
    }
    if (req.url?.startsWith('/api/hotel-rates')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      if (!KEY) return res.end('{"hotels":[]}')
      try {
        const hotels = await getHotels()
        res.end(JSON.stringify({ hotels }))
      } catch (e) {
        console.error('hotel fetch failed:', e.message)
        res.end('{"hotels":[]}') // graceful — app falls back to curated seed
      }
      return
    }
    if (req.url?.startsWith('/api/tiktok-discover')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const category = new URL(req.url, 'http://x').searchParams.get('category') || 'eat'
      try {
        const candidates = await getTikTokCandidates(category)
        res.end(JSON.stringify({ candidates }))
      } catch (e) {
        console.error('tiktok discover failed:', e.message)
        res.end('{"candidates":[]}') // graceful — feature just no-ops
      }
      return
    }
    res.writeHead(404)
    res.end()
  })
  server.listen(PORT, () => {
    console.log(`price proxy on http://localhost:${PORT}  (SERPAPI_KEY ${KEY ? 'set' : 'MISSING'})`)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer()
}
