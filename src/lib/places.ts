// ─────────────────────────────────────────────────────────────────────────────
// Google Places API (New) access. All calls are defensive: any failure returns
// null so the UI falls back to seed data and never crashes. The maps key is
// required; callers must check ENV.hasMaps first.
//
// This module is also the REAL-ONLY verification gate: a place is only ever
// treated as real if it resolves to a Google Places record here.
// ─────────────────────────────────────────────────────────────────────────────

import { ENV } from './env'
import type { Enrichment } from '../types'

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.priceRange',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.regularOpeningHours.weekdayDescriptions',
  'places.photos',
].join(',')

interface RawPlace {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  priceRange?: {
    startPrice?: { currencyCode?: string; units?: string | number }
    endPrice?: { currencyCode?: string; units?: string | number }
  }
  websiteUri?: string
  googleMapsUri?: string
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  photos?: { name?: string }[]
}

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

function photoMediaUrl(photoName: string, maxWidthPx = 1200): string {
  // 1200px keeps card thumbnails crisp on high-DPI / wide screens.
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${ENV.mapsKey}`
}

function parsePriceRange(
  pr: RawPlace['priceRange'],
): Enrichment['priceRange'] {
  if (!pr || (!pr.startPrice && !pr.endPrice)) return undefined
  const start = Number(pr.startPrice?.units ?? 0)
  const end = Number(pr.endPrice?.units ?? 0)
  if (!start && !end) return undefined
  return {
    start,
    end,
    currency:
      pr.startPrice?.currencyCode ?? pr.endPrice?.currencyCode ?? 'EUR',
  }
}

/** Raw Places Text Search. Returns up to `limit` candidates, or [] on failure. */
export async function searchText(
  textQuery: string,
  limit = 1,
): Promise<RawPlace[]> {
  if (!ENV.hasMaps) return []
  try {
    const res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ENV.mapsKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({ textQuery, maxResultCount: limit }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { places?: RawPlace[] }
    return data.places ?? []
  } catch {
    return []
  }
}

function toEnrichment(raw: RawPlace): Enrichment {
  const photoUrls = (raw.photos ?? [])
    .slice(0, 6)
    .map((p) => (p.name ? photoMediaUrl(p.name) : ''))
    .filter(Boolean)
  return {
    placeId: raw.id,
    coordinates:
      raw.location?.latitude != null && raw.location?.longitude != null
        ? { lat: raw.location.latitude, lng: raw.location.longitude }
        : undefined,
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : undefined,
    rating: raw.rating,
    userRatingsTotal: raw.userRatingCount,
    priceLevel:
      raw.priceLevel != null ? PRICE_LEVEL_MAP[raw.priceLevel] : undefined,
    priceRange: parsePriceRange(raw.priceRange),
    website: raw.websiteUri,
    mapsUrl: raw.googleMapsUri,
    hours: raw.regularOpeningHours?.weekdayDescriptions,
    verified: Boolean(raw.id),
    fetchedAt: Date.now(),
  }
}

/**
 * Resolve a seed place (or AI suggestion) to a real Google Places record.
 * Returns enrichment with `verified: true`, or null if it cannot be resolved —
 * in which case the caller MUST NOT display it (see spec §3 verification gate).
 */
export async function resolvePlace(
  name: string,
  town: string,
  region: string,
): Promise<Enrichment | null> {
  const query = `${name}, ${town}, ${region}`
  const [first] = await searchText(query, 1)
  if (!first || !first.id) return null
  return toEnrichment(first)
}

/** Geocode-ish resolution of a town/base name to coordinates. */
export async function resolveCoordinates(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const [first] = await searchText(query, 1)
  const loc = first?.location
  if (loc?.latitude == null || loc?.longitude == null) return null
  return { lat: loc.latitude, lng: loc.longitude }
}
