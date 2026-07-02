// Checks whether the Amadeus Hotel APIs actually cover our seed hotels, and
// whether they return nightly prices for the trip dates. Run: npm run check:amadeus
//
// Needs AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET in .env (free self-service signup).
// AMADEUS_ENV=test uses limited cached data; "production" gives a real coverage read.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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

const env = loadEnv()
const ID = env.AMADEUS_CLIENT_ID || ''
const SECRET = env.AMADEUS_CLIENT_SECRET || ''
const HOST =
  (env.AMADEUS_ENV || 'test') === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com'

// The 9 seed hotels we need prices for.
const SEED_HOTELS = [
  'Hotel Mediterrani',
  'Hotel Calella de Palafrugell',
  'Hotel Sant Roc',
  'Hotel Alga',
  'Hotel Llafranch',
  'Hotel Terramar',
  "Isabella's Llafranc",
  'El Far Hotel',
  'La Bionda',
]

// Search points covering the base area (Calella, Llafranc, Begur, Palafrugell).
const POINTS = [
  { name: 'Palafrugell coast', lat: 41.905, lng: 3.18 },
  { name: 'Begur', lat: 41.9543, lng: 3.2076 },
]

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function matches(seed, amadeusName) {
  const a = norm(seed)
  const b = norm(amadeusName)
  if (b.includes(a) || a.includes(b)) return true
  // token overlap: every significant seed token present
  const stop = new Set(['hotel', 'de', 'la', 'el', 's'])
  const tokens = a.split(' ').filter((t) => t.length > 2 && !stop.has(t))
  return tokens.length > 0 && tokens.every((t) => b.includes(t))
}

async function getToken() {
  const res = await fetch(`${HOST}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: ID,
      client_secret: SECRET,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`token ${res.status}: ${data.error_description || data.error || 'failed'}`)
  return data.access_token
}

async function hotelsByGeo(token, pt) {
  const url = `${HOST}/v1/reference-data/locations/hotels/by-geocode?latitude=${pt.lat}&longitude=${pt.lng}&radius=12&radiusUnit=KM`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.log(`  (geo ${pt.name}: HTTP ${res.status} ${data.errors?.[0]?.detail || ''})`)
    return []
  }
  return data.data || []
}

async function priceFor(token, hotelId) {
  const url = `${HOST}/v3/shopping/hotel-offers?hotelIds=${hotelId}&adults=2&checkInDate=2026-08-01&checkOutDate=2026-08-07&roomQuantity=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return null
  const offer = data.data?.[0]?.offers?.[0]
  if (!offer?.price?.total) return null
  return `${offer.price.total} ${offer.price.currency || ''}`.trim()
}

async function main() {
  if (!ID || !SECRET) {
    console.log('No Amadeus credentials in .env (AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET).')
    console.log('Get a free key at https://developers.amadeus.com, paste into .env, then re-run.')
    return
  }
  console.log(`Amadeus coverage check — env: ${HOST.includes('test') ? 'TEST (limited data)' : 'PRODUCTION'}`)

  let token
  try {
    token = await getToken()
  } catch (e) {
    console.log(`❌ auth failed — ${e.message}`)
    return
  }

  const all = new Map() // hotelId -> name
  for (const pt of POINTS) {
    for (const h of await hotelsByGeo(token, pt)) {
      if (h.hotelId && h.name) all.set(h.hotelId, h.name)
    }
  }
  console.log(`\nHotels Amadeus lists in the base area: ${all.size}`)

  let found = 0
  console.log('\nSeed-hotel coverage:')
  for (const seed of SEED_HOTELS) {
    const hit = [...all.entries()].find(([, name]) => matches(seed, name))
    if (hit) {
      found++
      const price = await priceFor(token, hit[0]).catch(() => null)
      console.log(
        `  ✅ ${seed}  →  "${hit[1]}"  ${price ? `· Aug 1–7 price: ${price}` : '· (no offer/price for those dates)'}`,
      )
    } else {
      console.log(`  ❌ ${seed}  →  not found in Amadeus`)
    }
  }

  const pct = Math.round((found / SEED_HOTELS.length) * 100)
  console.log(`\nCoverage: ${found}/${SEED_HOTELS.length} seed hotels (${pct}%).`)
  if (HOST.includes('test')) {
    console.log('NOTE: TEST data is limited — low numbers here are not conclusive.')
    console.log('Set AMADEUS_ENV=production in .env for a real coverage read.')
  }
  console.log(
    pct >= 60
      ? '→ Decent coverage: Amadeus is viable for in-app prices.'
      : '→ Sparse coverage: recommend Google Hotels (SerpApi) instead.',
  )
}

main()
