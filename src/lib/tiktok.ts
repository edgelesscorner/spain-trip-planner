// Client side of TikTok discovery: fetches UNVERIFIED candidate places from the
// server (proxy / Vercel fn). These MUST still pass the Google Places real-only
// gate (see verify.ts) before they are ever shown. Returns [] on any failure so
// the app degrades gracefully (e.g. GitHub Pages, where /api 404s).

import type { Category } from '../types'

export interface TikTokCandidate {
  name: string
  town: string
  address: string
  reason: string
  sourceUrl: string
  type: string
  /** How many scraped captions mentioned this place (rough popularity). */
  mentions: number
}

const RAW_PROXY = import.meta.env.VITE_PRICE_PROXY_URL
// Same convention as rates.ts: undefined → same-origin '/api'; '' → disabled
// (tests); a URL → that base (local dev points at the proxy on :8787).
const PROXY = (RAW_PROXY ?? '').replace(/\/$/, '')

export async function fetchTikTokCandidates(
  category: Category,
): Promise<TikTokCandidate[]> {
  if (RAW_PROXY === '') return [] // explicitly disabled (e.g. tests)
  if (category === 'stay') return []
  try {
    const res = await fetch(`${PROXY}/api/tiktok-discover?category=${category}`)
    if (!res.ok) return []
    const data = (await res.json()) as { candidates?: TikTokCandidate[] }
    return Array.isArray(data.candidates) ? data.candidates : []
  } catch {
    return []
  }
}
