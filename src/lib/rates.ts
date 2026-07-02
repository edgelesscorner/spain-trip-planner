// Client side of the live-hotels feature: fetches the real, AC-confirmed,
// currently-priced hotels from the local price proxy (which holds the SerpApi
// key server-side). Defensive — returns [] on any failure so the app falls back
// to the curated seed.

import type { LegId } from '../types'

export interface LiveHotel {
  id: string
  /** true when this matches a curated seed hotel (so we attach its notes). */
  curated: boolean
  /** Which leg this hotel belongs to. */
  leg: LegId
  name: string
  town: string
  nightlyUSD: number
  rating?: number
  hotelClass?: number
  coordinates?: { lat: number; lng: number }
  thumbnailUrl?: string
  link?: string
}

const RAW_PROXY = import.meta.env.VITE_PRICE_PROXY_URL
// `undefined` → default to the local proxy; explicit empty string → disabled.
const PROXY = (RAW_PROXY ?? 'http://localhost:8787').replace(/\/$/, '')

export async function fetchLiveHotels(): Promise<LiveHotel[]> {
  if (RAW_PROXY === '') return [] // explicitly disabled (e.g. tests)
  try {
    const res = await fetch(`${PROXY}/api/hotel-rates`)
    if (!res.ok) return []
    const data = (await res.json()) as { hotels?: LiveHotel[] }
    return Array.isArray(data.hotels) ? data.hotels : []
  } catch {
    return []
  }
}
