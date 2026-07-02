// ─────────────────────────────────────────────────────────────────────────────
// One-time "bake" of TikTok-discovered places into bundled app data.
//
//   node scripts/bake-tiktok.mjs
//
// Runs the TikTok discovery pipeline ONCE per category (Apify + LLM extract),
// verifies every candidate against Google Places (the real-only gate — same as
// the app), and writes the survivors to src/data/discovered-tiktok.json. The app
// bundles that file, so the places are permanent, shared across devices, work
// offline, and cost ZERO Apify usage at runtime. Re-run this + redeploy to
// refresh with new finds.
//
// Photo *resource names* (not URLs) are stored so the Google Maps key is NEVER
// committed to the repo; the app builds media URLs at runtime with its own key.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getTikTokCandidates } from '../server/tiktok.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')

function loadEnv() {
  const out = {}
  try {
    for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i > -1) out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
    }
  } catch {
    /* none */
  }
  return out
}

const ENV = loadEnv()
const MAPS_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || ENV.VITE_GOOGLE_MAPS_API_KEY || ''
// An allowed HTTP referrer so this server-side call passes the key's referrer
// restriction (the browser sends this automatically; here we set it explicitly).
const REFERER = process.env.PLACES_REFERER || 'https://spain-trip-planner-rho.vercel.app'

if (!MAPS_KEY) {
  console.error('Missing VITE_GOOGLE_MAPS_API_KEY — cannot verify. Aborting.')
  process.exit(1)
}

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.priceRange',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.regularOpeningHours.weekdayDescriptions',
  'places.photos',
].join(',')

const PRICE_LEVEL_MAP = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '')
}

function legForTown(town) {
  const t = String(town || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return /(san sebastian|donostia|bilbao|getaria|basque|gipuzkoa|guipuzcoa|hondarribia)/.test(t)
    ? 'basque'
    : 'balearic'
}

function parsePriceRange(pr) {
  if (!pr || (!pr.startPrice && !pr.endPrice)) return undefined
  const start = Number(pr.startPrice?.units ?? 0)
  const end = Number(pr.endPrice?.units ?? 0)
  if (!start && !end) return undefined
  return {
    start,
    end,
    currency: pr.startPrice?.currencyCode ?? pr.endPrice?.currencyCode ?? 'EUR',
  }
}

async function verify(name, town) {
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': MAPS_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
      Referer: REFERER,
    },
    body: JSON.stringify({ textQuery: `${name}, ${town}, Spain`, maxResultCount: 1 }),
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  const p = data.places?.[0]
  return p && p.id ? p : null
}

function toEnrichment(p) {
  return {
    placeId: p.id,
    coordinates:
      p.location?.latitude != null && p.location?.longitude != null
        ? { lat: p.location.latitude, lng: p.location.longitude }
        : undefined,
    rating: p.rating,
    userRatingsTotal: p.userRatingCount,
    priceLevel: p.priceLevel != null ? PRICE_LEVEL_MAP[p.priceLevel] : undefined,
    priceRange: parsePriceRange(p.priceRange),
    website: p.websiteUri,
    mapsUrl: p.googleMapsUri,
    hours: p.regularOpeningHours?.weekdayDescriptions,
    // Resource names only — the app appends its own key at runtime.
    photoNames: (p.photos || []).slice(0, 6).map((ph) => ph.name).filter(Boolean),
    verified: true,
  }
}

async function bakeCategory(category, seenPlaceIds, out) {
  const candidates = await getTikTokCandidates(category)
  console.log(`\n[${category}] candidates from TikTok: ${candidates.length}`)
  let kept = 0
  for (const c of candidates) {
    const p = await verify(c.name, c.town)
    if (!p) {
      console.log(`  ✗ ${c.name} (${c.town}) — no Places match`)
      continue
    }
    if (seenPlaceIds.has(p.id)) continue // dedupe real venues across candidates
    seenPlaceIds.add(p.id)
    const name = p.displayName?.text || c.name
    out.push({
      id: `ai-${slug(name)}-${slug(c.town)}`,
      category,
      leg: legForTown(c.town),
      name,
      town: c.town,
      why: c.reason || 'Popular on TikTok',
      tags: c.type ? ['tiktok', c.type] : ['tiktok'],
      type: c.type || '',
      mentions: c.mentions || 1,
      sourceUrl: c.sourceUrl || '',
      verified: true,
      enrichment: toEnrichment(p),
    })
    kept++
    console.log(`  ✓ ${name} (${c.town}) → ${p.displayName?.text}`)
  }
  console.log(`[${category}] verified & kept: ${kept}/${candidates.length}`)
}

const out = []
const seen = new Set()
await bakeCategory('eat', seen, out)
await bakeCategory('do', seen, out)

// Stable ordering: leg, then category, then most-mentioned first.
const legRank = { basque: 0, balearic: 1 }
out.sort(
  (a, b) =>
    (legRank[a.leg] ?? 9) - (legRank[b.leg] ?? 9) ||
    a.category.localeCompare(b.category) ||
    b.mentions - a.mentions,
)

const target = join(ROOT, 'src', 'data', 'discovered-tiktok.json')
writeFileSync(target, JSON.stringify(out, null, 2) + '\n')
console.log(`\nWrote ${out.length} baked places → ${target}`)
console.log(`  eat: ${out.filter((x) => x.category === 'eat').length}  do: ${out.filter((x) => x.category === 'do').length}`)
