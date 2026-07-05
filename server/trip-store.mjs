// ─────────────────────────────────────────────────────────────────────────────
// Shared-trip store: persists the couple's plan (saved cards, itinerary, budget,
// notes, packing, discovered places) as a single private JSON blob in Vercel
// Blob, so every device + both partners see the same trip. Secrets stay
// server-side. Conflict policy: last-write-wins by the client's updatedAt.
// ─────────────────────────────────────────────────────────────────────────────
import { put, list } from '@vercel/blob'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

function loadEnvFile(name) {
  const out = {}
  try {
    for (const line of readFileSync(join(here, '..', name), 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i > -1) out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^"|"$/g, '')
    }
  } catch {
    /* file absent */
  }
  return out
}

// .env.local (written by `vercel blob create-store`) holds BLOB_READ_WRITE_TOKEN
// for local dev; on Vercel it comes from process.env.
const ENV = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local') }
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ENV.BLOB_READ_WRITE_TOKEN || ''
const PATHNAME = 'trip.json'

export function emptyDoc() {
  return { updatedAt: 0, saved: {}, settings: null, notes: '', packing: [], discovered: {} }
}

function normalize(d) {
  d = d || {}
  return {
    updatedAt: Number(d.updatedAt) || 0,
    saved: d.saved && typeof d.saved === 'object' ? d.saved : {},
    settings: d.settings ?? null,
    notes: typeof d.notes === 'string' ? d.notes : '',
    packing: Array.isArray(d.packing) ? d.packing : [],
    discovered: d.discovered && typeof d.discovered === 'object' ? d.discovered : {},
  }
}

/** Read the shared trip doc, or null if none stored yet. */
export async function readTrip() {
  if (!TOKEN) return null
  const { blobs } = await list({ token: TOKEN, prefix: PATHNAME, limit: 1 })
  const b = blobs.find((x) => x.pathname === PATHNAME) || blobs[0]
  if (!b) return null
  // Private blob → authenticated fetch. Cache-bust to dodge CDN edge caching of
  // this mutable doc (Blob is eventually consistent; this narrows the window).
  const bust = `${b.url}${b.url.includes('?') ? '&' : '?'}_=${Date.now()}`
  const res = await fetch(bust, {
    headers: { authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const raw = await res.json().catch(() => null)
  return raw ? normalize(raw) : null
}

async function writeTrip(doc) {
  if (!TOKEN) throw new Error('missing BLOB_READ_WRITE_TOKEN')
  await put(PATHNAME, JSON.stringify(doc), {
    access: 'private',
    token: TOKEN,
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0, // mutable sync doc — never CDN-cache it
  })
}

/**
 * Save an incoming trip doc. Last-write-wins: only overwrites when the incoming
 * updatedAt is newer-or-equal to what's stored; otherwise returns the stored
 * (newer) doc so the client can adopt it. Returns the canonical doc.
 */
export async function saveTrip(incoming) {
  const inc = normalize(incoming)
  const cur = await readTrip()
  if (!cur || inc.updatedAt >= cur.updatedAt) {
    await writeTrip(inc)
    return inc
  }
  return cur
}

export const hasBlobToken = Boolean(TOKEN)
