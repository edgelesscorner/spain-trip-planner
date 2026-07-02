// Checks SerpApi (Google Hotels) coverage + live nightly prices for our seed
// hotels on the trip dates, BEFORE we build the full in-app integration.
// Run: npm run check:serpapi   (needs SERPAPI_KEY in .env)
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

const KEY = loadEnv().SERPAPI_KEY || ''

// Seed hotels (name + town) we need prices for.
const SEED = [
  ['Hotel Mediterrani', 'Calella de Palafrugell'],
  ['Hotel Calella de Palafrugell', 'Calella de Palafrugell'],
  ['Hotel Sant Roc', 'Calella de Palafrugell'],
  ['Hotel Alga', 'Calella de Palafrugell'],
  ['Hotel Llafranch', 'Llafranc'],
  ['Hotel Terramar', 'Llafranc'],
  ["Isabella's Llafranc", 'Llafranc'],
  ['El Far Hotel', 'Llafranc'],
  ['La Bionda', 'Begur'],
]

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function bestMatch(seedName, properties) {
  const a = norm(seedName)
  const stop = new Set(['hotel', 'de', 'la', 'el', 's'])
  const tokens = a.split(' ').filter((t) => t.length > 2 && !stop.has(t))
  for (const p of properties) {
    const b = norm(p.name || '')
    if (b.includes(a) || a.includes(b)) return p
    if (tokens.length && tokens.every((t) => b.includes(t))) return p
  }
  return null
}

async function lookup(name, town) {
  const url =
    'https://serpapi.com/search.json?' +
    new URLSearchParams({
      engine: 'google_hotels',
      q: `${name} ${town} Costa Brava`,
      check_in_date: '2026-08-01',
      check_out_date: '2026-08-07',
      adults: '2',
      currency: 'USD',
      api_key: KEY,
    })
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) {
    return { error: data.error || `HTTP ${res.status}` }
  }
  const props = data.properties || []
  const m = bestMatch(name, props)
  if (!m) return { found: false, count: props.length }
  const nightly = m.rate_per_night?.extracted_lowest ?? m.rate_per_night?.lowest
  const total = m.total_rate?.extracted_lowest ?? m.total_rate?.lowest
  return { found: true, matched: m.name, nightly, total }
}

async function main() {
  if (!KEY) {
    console.log('No SERPAPI_KEY in .env.')
    console.log('Get one free at https://serpapi.com/users/sign_up, paste into .env, then re-run.')
    return
  }
  console.log('SerpApi Google Hotels — coverage + Aug 1–7 prices (2 adults, USD)\n')
  let found = 0
  for (const [name, town] of SEED) {
    const r = await lookup(name, town)
    if (r.error) {
      console.log(`  ⚠️  ${name} — ${r.error}`)
      continue
    }
    if (r.found) {
      found++
      const price = r.nightly != null ? `$${r.nightly}/night` : '(listed, no nightly rate)'
      console.log(`  ✅ ${name}  →  "${r.matched}"  · ${price}`)
    } else {
      console.log(`  ❌ ${name}  →  not found (${r.count} nearby properties)`)
    }
  }
  const pct = Math.round((found / SEED.length) * 100)
  console.log(`\nCoverage: ${found}/${SEED.length} (${pct}%).`)
  console.log(
    pct >= 60
      ? '→ Good coverage. I can wire live prices into the cards (via a tiny proxy).'
      : '→ Mixed coverage; cards without a match keep the “Check Aug 1–7 rates” link.',
  )
  console.log(`\n(Used ${SEED.length} SerpApi searches.)`)
}

main()
