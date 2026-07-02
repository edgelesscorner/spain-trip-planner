// Baked-in TikTok discoveries: real places surfaced on TikTok and pre-verified
// against Google Places by scripts/bake-tiktok.mjs, then committed as bundled
// data. They render like any verified "discovered" place (with a TikTok badge),
// cost ZERO Apify usage at runtime, are shared across every device, and work
// offline. Re-run the bake script + redeploy to refresh.
//
// Photos are stored as Places resource *names* (no API key in the repo); the
// media URLs are built here at runtime with the app's own Maps key.

import rawData from './discovered-tiktok.json'
import type { DiscoveredPlace } from '../lib/verify'
import type { Enrichment, LegId } from '../types'
import { ENV } from '../lib/env'

export interface BakedTikTokPlace extends DiscoveredPlace {
  leg: LegId
  type: string
  mentions: number
}

interface RawBaked {
  id: string
  category: 'eat' | 'do'
  leg: LegId
  name: string
  town: string
  why: string
  tags: string[]
  type: string
  mentions: number
  sourceUrl: string
  enrichment: {
    placeId?: string
    coordinates?: { lat: number; lng: number }
    rating?: number
    userRatingsTotal?: number
    priceLevel?: number
    priceRange?: { start: number; end: number; currency: string }
    website?: string
    mapsUrl?: string
    hours?: string[]
    photoNames?: string[]
  }
}

function mediaUrl(name: string): string {
  return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=1200&key=${ENV.mapsKey}`
}

const raw = rawData as RawBaked[]

export const BAKED_TIKTOK: BakedTikTokPlace[] = raw.map((r) => {
  const photoUrls = ENV.mapsKey
    ? (r.enrichment.photoNames ?? []).map(mediaUrl)
    : []
  const enrichment: Enrichment = {
    placeId: r.enrichment.placeId,
    coordinates: r.enrichment.coordinates,
    rating: r.enrichment.rating,
    userRatingsTotal: r.enrichment.userRatingsTotal,
    priceLevel: r.enrichment.priceLevel,
    priceRange: r.enrichment.priceRange,
    website: r.enrichment.website,
    mapsUrl: r.enrichment.mapsUrl,
    hours: r.enrichment.hours,
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : undefined,
    verified: true,
  }
  return {
    id: r.id,
    category: r.category,
    leg: r.leg,
    name: r.name,
    town: r.town,
    why: r.why,
    tags: r.tags,
    type: r.type,
    mentions: r.mentions,
    sourceUrl: r.sourceUrl,
    verified: true,
    enrichment,
  }
})
