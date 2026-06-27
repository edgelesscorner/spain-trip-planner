// Orchestrates enrichment: resolve a seed place to a real Google Places record,
// then attach drive time from the home base. Base coordinates are resolved once
// and memoized per base string. All failures degrade to null/undefined.

import type { SeedPlace, Enrichment } from '../types'
import { TRIP_CONFIG } from '../data/seed'
import { ENV } from './env'
import { resolvePlace, resolveCoordinates } from './places'
import { computeDriveMinutes } from './routes'

const baseCoordCache = new Map<string, Promise<{ lat: number; lng: number } | null>>()

function baseQuery(base: string): string {
  return `${base}, ${TRIP_CONFIG.region}`
}

export function getBaseCoordinates(
  base: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!ENV.hasMaps) return Promise.resolve(null)
  const key = base
  if (!baseCoordCache.has(key)) {
    baseCoordCache.set(key, resolveCoordinates(baseQuery(base)))
  }
  return baseCoordCache.get(key) as Promise<{ lat: number; lng: number } | null>
}

/**
 * Resolve + enrich one seed place. Returns null if it cannot be verified as a
 * real Google Places record (caller drops it). Drive time is best-effort.
 */
export async function enrichSeedPlace(
  place: SeedPlace,
  base: string,
): Promise<Enrichment | null> {
  if (!ENV.hasMaps) return null
  const enrichment = await resolvePlace(place.name, place.town, TRIP_CONFIG.region)
  if (!enrichment) return null
  try {
    const baseCoords = await getBaseCoordinates(base)
    if (baseCoords && enrichment.coordinates) {
      const mins = await computeDriveMinutes(baseCoords, enrichment.coordinates)
      if (mins != null) enrichment.driveMinutes = mins
    }
  } catch {
    // drive time is optional; ignore
  }
  return enrichment
}
