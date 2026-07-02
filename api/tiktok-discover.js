// Vercel serverless function: returns UNVERIFIED candidate places discovered
// from TikTok for a category (eat|do). The browser then verifies each against
// Google Places (real-only gate) before anything is shown. APIFY_TOKEN + the
// Anthropic key come from the Vercel environment (server-side only).
import { getTikTokCandidates } from '../server/tiktok.mjs'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const category = String(req.query?.category || 'eat')
  try {
    const candidates = await getTikTokCandidates(category)
    // Cache at the edge for 12h; serve stale for a day while revalidating.
    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400')
    res.status(200).json({ candidates })
  } catch {
    res.status(200).json({ candidates: [] }) // graceful — feature just no-ops
  }
}
