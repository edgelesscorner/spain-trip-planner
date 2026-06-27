// Verifies the keys in .env actually work against each API. Run: npm run check:keys
// Node 18+ (uses global fetch). Reads .env directly (no dependency).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = join(here, '..', '.env')

function loadEnv() {
  const out = {}
  let text = ''
  try {
    text = readFileSync(ENV_PATH, 'utf8')
  } catch {
    return out
  }
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

const env = loadEnv()
const mapsKey = env.VITE_GOOGLE_MAPS_API_KEY || ''
const anthropicKey = env.VITE_ANTHROPIC_API_KEY || ''
const model = env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-6'

const ok = (m) => console.log(`  ✅ ${m}`)
const bad = (m) => console.log(`  ❌ ${m}`)
const info = (m) => console.log(`     ${m}`)

async function checkPlaces() {
  console.log('\nGoogle Places API (New) — searchText')
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({ textQuery: 'Casamar, Llafranc, Costa Brava, Spain' }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.places?.length) {
      ok(`resolved "${data.places[0].displayName?.text}" — Places works`)
    } else {
      bad(`HTTP ${res.status}: ${data.error?.message || 'no result'}`)
      hintGoogle(res.status, data)
    }
  } catch (e) {
    bad(`request failed: ${e.message}`)
  }
}

async function checkRoutes() {
  console.log('\nGoogle Routes API — computeRoutes')
  try {
    const res = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsKey,
          'X-Goog-FieldMask': 'routes.duration',
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: 41.8857, longitude: 3.1816 } } },
          destination: { location: { latLng: { latitude: 41.9794, longitude: 2.8214 } } },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_UNAWARE',
        }),
      },
    )
    const data = await res.json().catch(() => ({}))
    const dur = data.routes?.[0]?.duration
    if (res.ok && dur) {
      ok(`base → Girona ≈ ${Math.round(parseInt(dur) / 60)} min — Routes works`)
    } else {
      bad(`HTTP ${res.status}: ${data.error?.message || 'no route'}`)
      hintGoogle(res.status, data)
    }
  } catch (e) {
    bad(`request failed: ${e.message}`)
  }
}

function hintGoogle(status, data) {
  const msg = (data.error?.message || '').toLowerCase()
  if (status === 403 && /referer|referrer|api_key_http_referrer/.test(msg)) {
    info('→ The key has an HTTP-referrer restriction (correct for the browser),')
    info('  so this server-side check is blocked. Verify in the running app:')
    info('  add http://localhost:5173/* to the key, run `npm run dev`, open a Stay card.')
  } else if (status === 403 && /not been used|disabled|enable/.test(msg)) {
    info('→ Enable this API for your project in Google Cloud Console (APIs & Services → Library).')
  } else if (status === 400 && /api key not valid/.test(msg)) {
    info('→ The key string looks invalid. Re-copy it from Credentials.')
  } else if (status === 403) {
    info('→ Likely an API restriction on the key. Allow this API under the key’s “API restrictions”.')
  }
}

async function checkAnthropic() {
  console.log('\nAnthropic Messages API')
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Reply with just: ok' }],
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      ok(`model "${data.model || model}" responded — Anthropic works`)
    } else {
      bad(`HTTP ${res.status}: ${data.error?.message || 'error'}`)
      if (res.status === 401) info('→ Invalid API key. Re-copy from console.anthropic.com.')
      if (res.status === 404) info(`→ Model "${model}" not found for your account. Try claude-sonnet-4-6.`)
    }
  } catch (e) {
    bad(`request failed: ${e.message}`)
  }
}

console.log('Checking keys in .env …')

if (!mapsKey) {
  console.log('\nGoogle Maps: (no VITE_GOOGLE_MAPS_API_KEY set — skipping)')
} else {
  await checkPlaces()
  await checkRoutes()
}

if (!anthropicKey) {
  console.log('\nAnthropic: (no VITE_ANTHROPIC_API_KEY set — optional, skipping)')
} else {
  await checkAnthropic()
}

console.log('\nDone. The app works on seed data even if these are not set.')
