// ─────────────────────────────────────────────────────────────────────────────
// TikTok discovery (server-side): pulls trending travel posts for the trip's
// towns via the Apify TikTok Scraper, then uses an LLM to extract candidate
// venue names (restaurants / things to do) out of the free-form captions.
//
// IMPORTANT: this only produces UNVERIFIED candidates. They are still passed
// through the app's Google Places real-only gate (client-side) before anything
// is ever shown — TikTok is a *discovery* source, never a source of truth.
//
// Secrets (APIFY_TOKEN, Anthropic key) stay server-side, exactly like the price
// proxy — never shipped to the browser.
// ─────────────────────────────────────────────────────────────────────────────
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

const ENV = loadEnv()
// process.env wins (Vercel/hosted); fall back to the local .env file.
const APIFY_TOKEN = process.env.APIFY_TOKEN || ENV.APIFY_TOKEN || ''
const ANTHROPIC_KEY =
  process.env.ANTHROPIC_API_KEY || ENV.ANTHROPIC_API_KEY || ENV.VITE_ANTHROPIC_API_KEY || ''
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || ENV.ANTHROPIC_MODEL || 'claude-sonnet-5'

// Search topics per category, keyed to the trip's towns. Kept deliberately small
// to bound Apify cost + stay within serverless time limits (~5 queries/category).
const QUERIES = {
  eat: [
    'San Sebastian pintxos',
    'San Sebastian best restaurants',
    'Bilbao where to eat',
    'Mallorca best restaurants',
    'Menorca best food',
  ],
  do: [
    'San Sebastian things to do',
    'Bilbao things to do',
    'Mallorca things to do',
    'Menorca best beaches',
    'Menorca things to do',
  ],
}

const TOWNS =
  'San Sebastián, Bilbao, Getaria, Palma de Mallorca, Sóller, Mallorca, Ciutadella de Menorca, Mahón, Menorca'

export function buildQueries(category) {
  return QUERIES[category] || []
}

/** Compact numbered caption list for the extractor (index → post). */
export function postsToText(posts) {
  return posts
    .slice(0, 40)
    .map((p, i) => {
      const tags = (p.hashtags || [])
        .map((h) => '#' + (typeof h === 'string' ? h : h.name || ''))
        .join(' ')
      const caption = String(p.text || '').replace(/\s+/g, ' ').trim()
      return `${i + 1}. ${caption} ${tags}`.trim()
    })
    .filter((l) => l.length > 3)
    .join('\n')
}

function buildPrompt(category, captionsText) {
  const noun =
    category === 'eat'
      ? 'restaurants, bars, cafés or food spots'
      : 'attractions, beaches, coves, landmarks, museums or activities'
  return [
    `Below are numbered TikTok captions about travel in the Basque Country and Balearic Islands (Spain).`,
    `Extract every SPECIFIC, NAMED ${noun} that a caption actually recommends or highlights.`,
    `Rules:`,
    `- Only real, specific venue/place names — NOT generic phrases, cities, regions, hashtags, or creator handles.`,
    `- Guess the town for each from this list when possible: ${TOWNS}.`,
    `- "type" is a short category (e.g. "pintxos bar", "seafood", "beach", "viewpoint", "museum", "boat tour").`,
    `- "sourceIndex" is the number of the caption it came from.`,
    `Return ONLY a JSON array (no prose, no markdown fences), each element:`,
    `{"name": string, "town": string, "type": string, "reason": string (one short line, in English), "sourceIndex": number}.`,
    `If nothing qualifies, return [].`,
    ``,
    `Captions:`,
    captionsText,
  ].join('\n')
}

/** Tolerant JSON-array extraction from an LLM response (recovers if truncated). */
export function extractJsonArray(text) {
  const fenced = String(text || '').replace(/```json|```/g, '')
  const start = fenced.indexOf('[')
  if (start === -1) return null
  const end = fenced.lastIndexOf(']')
  if (end > start) {
    try {
      return JSON.parse(fenced.slice(start, end + 1))
    } catch {
      /* fall through to truncation recovery */
    }
  }
  // Response cut off mid-array (token limit): keep up to the last complete
  // object and close the array ourselves.
  const lastObj = fenced.lastIndexOf('}')
  if (lastObj > start) {
    try {
      return JSON.parse(fenced.slice(start, lastObj + 1) + ']')
    } catch {
      return null
    }
  }
  return null
}

/**
 * Turn the LLM's raw array into clean candidates: validate fields, attach the
 * source TikTok URL from sourceIndex, dedupe by name+town, and tally how many of
 * the scraped captions mention each name (a rough popularity signal).
 */
export function parseCandidates(parsed, posts) {
  if (!Array.isArray(parsed)) return []
  const captions = posts.map((p) => String(p.text || '').toLowerCase())
  const byKey = new Map()
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const name = typeof item.name === 'string' ? item.name.trim() : ''
    const town = typeof item.town === 'string' ? item.town.trim() : ''
    if (name.length < 2 || !town) continue
    const key = `${name.toLowerCase()}|${town.toLowerCase()}`
    if (byKey.has(key)) continue
    const idx = Number(item.sourceIndex)
    const post = Number.isInteger(idx) && idx >= 1 ? posts[idx - 1] : undefined
    const sourceUrl =
      (post && (post.webVideoUrl || post.videoUrl)) ||
      (posts[0] && posts[0].webVideoUrl) ||
      ''
    const lname = name.toLowerCase()
    const mentions = captions.filter((c) => c.includes(lname)).length || 1
    byKey.set(key, {
      name,
      town,
      address: town,
      type: typeof item.type === 'string' ? item.type : '',
      reason:
        typeof item.reason === 'string' && item.reason.trim()
          ? item.reason.trim()
          : `Recommended on TikTok`,
      sourceUrl: typeof sourceUrl === 'string' ? sourceUrl : '',
      mentions,
    })
  }
  return [...byKey.values()].sort((a, b) => b.mentions - a.mentions)
}

async function fetchTikTok(queries, perPage = 8) {
  if (!APIFY_TOKEN) throw new Error('missing APIFY_TOKEN')
  const input = {
    searchQueries: queries,
    resultsPerPage: perPage,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
  }
  const url = `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}`)
  const items = await res.json()
  return Array.isArray(items) ? items : []
}

async function extractCandidates(category, posts) {
  if (!ANTHROPIC_KEY) throw new Error('missing Anthropic key')
  const captionsText = postsToText(posts)
  if (!captionsText) return []
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: buildPrompt(category, captionsText) }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`)
  const data = await res.json()
  const text = (data.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n')
  return parseCandidates(extractJsonArray(text), posts)
}

const cache = new Map() // category → { at, data }
const TTL = 1000 * 60 * 60 * 12 // 12h — TikTok trends move slowly enough

/** Scrape + extract for a specific query set (no cache). Used by the baker. */
export async function runDiscovery(category, queries) {
  const q = queries && queries.length ? queries : buildQueries(category)
  const posts = await fetchTikTok(q)
  if (process.env.TIKTOK_DEBUG) console.error(`[tiktok] posts=${posts.length}`)
  const candidates = await extractCandidates(category, posts)
  if (process.env.TIKTOK_DEBUG)
    console.error(`[tiktok] candidates=${candidates.length}`)
  return candidates
}

export async function getTikTokCandidates(category) {
  if (category !== 'eat' && category !== 'do') return []
  const hit = cache.get(category)
  if (hit && Date.now() - hit.at < TTL) return hit.data
  const candidates = await runDiscovery(category)
  cache.set(category, { at: Date.now(), data: candidates })
  return candidates
}

export const _config = { hasApify: Boolean(APIFY_TOKEN), hasAnthropic: Boolean(ANTHROPIC_KEY) }
