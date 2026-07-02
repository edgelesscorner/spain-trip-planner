// Vercel serverless function: returns the live, AC-confirmed, priced hotels for
// both legs. Reuses the same logic as the local proxy; SERPAPI_KEY comes from
// the Vercel environment (server-side only — never shipped to the browser).
import { getHotels } from '../server/price-proxy.mjs'

export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const hotels = await getHotels()
    // Cache at the edge for 6h, serve stale for a day while revalidating.
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
    res.status(200).json({ hotels })
  } catch {
    res.status(200).json({ hotels: [] }) // graceful — app falls back to seed
  }
}
