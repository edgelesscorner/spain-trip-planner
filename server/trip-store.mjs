// ─────────────────────────────────────────────────────────────────────────────
// Shared-trip store: persists the couple's plan (saved cards, itinerary, budget,
// notes, packing, discovered places) in Vercel Blob so every device + both
// partners see the same trip. Secrets stay server-side. Conflict policy:
// last-write-wins by the client's updatedAt.
//
// Each save writes a NEW, uniquely-named object (trip-<updatedAt>.json) rather
// than overwriting one file. Vercel Blob edge-caches content by path and doesn't
// reliably invalidate on overwrite, so a fixed filename serves stale reads;
// unique per-version objects are immutable and therefore always read fresh.
// Reads pick the newest version; old versions are pruned.
// ─────────────────────────────────────────────────────────────────────────────
import { put, list, del } from '@vercel/blob'
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
const PREFIX = 'trip-'
const KEEP = 3 // retain the newest N versions

// zero-padded so lexical sort == chronological sort
function keyFor(updatedAt) {
  return `${PREFIX}${String(Math.max(0, Number(updatedAt) || 0)).padStart(16, '0')}.json`
}

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

/** Newest-first list of stored versions. */
async function listVersions() {
  const { blobs } = await list({ token: TOKEN, prefix: PREFIX, limit: 100 })
  return blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : a.pathname > b.pathname ? -1 : 0))
}

/** Read the newest shared trip doc, or null if none stored yet. */
export async function readTrip() {
  if (!TOKEN) return null
  const versions = await listVersions()
  if (!versions.length) return null
  // Immutable, unique URL → always fresh (no stale overwrite cache).
  const res = await fetch(versions[0].url, {
    headers: { authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const raw = await res.json().catch(() => null)
  return raw ? normalize(raw) : null
}

async function writeTrip(doc) {
  if (!TOKEN) throw new Error('missing BLOB_READ_WRITE_TOKEN')
  await put(keyFor(doc.updatedAt), JSON.stringify(doc), {
    access: 'private',
    token: TOKEN,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  // Prune older versions (keep the newest KEEP).
  try {
    const versions = await listVersions()
    for (const old of versions.slice(KEEP)) await del(old.url, { token: TOKEN })
  } catch {
    /* best-effort */
  }
}

/**
 * Save an incoming trip doc. Last-write-wins: writes a new version only when the
 * incoming updatedAt is newer-or-equal to the stored newest; otherwise returns
 * the stored (newer) doc so the client can adopt it. Returns the canonical doc.
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
