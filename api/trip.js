// Vercel serverless function: the shared-trip sync endpoint.
//   GET  /api/trip        → { trip }        (the current shared plan)
//   PUT  /api/trip {trip} → { trip }        (save; returns canonical after LWW)
// BLOB_READ_WRITE_TOKEN comes from the Vercel environment (server-side only).
import { readTrip, saveTrip, emptyDoc } from '../server/trip-store.mjs'

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8') || '{}'
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  try {
    if (req.method === 'GET') {
      const trip = (await readTrip()) || emptyDoc()
      res.status(200).json({ trip })
      return
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req)
      const trip = await saveTrip(body?.trip || {})
      res.status(200).json({ trip })
      return
    }
    res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    // Graceful — the app keeps working locally if sync is unavailable.
    res.status(200).json({ trip: emptyDoc(), error: String((e && e.message) || e) })
  }
}
