import { useEffect } from 'react'
import type { SeedPlace } from '../types'
import { usePlanner } from '../store/planner'
import { ENV } from '../lib/env'
import { enrichSeedPlace } from '../lib/enrich'
import { legById } from '../data/seed'

const TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days
const inFlight = new Set<string>()

/**
 * Lazily enrich the given seed places via Google Places/Routes and cache the
 * results in the store. No-op (and never throws) when no Maps key is set, so the
 * app stays fully functional on seed data offline.
 */
export function useEnrichment(places: SeedPlace[]): void {
  const enrichment = usePlanner((s) => s.enrichment)
  const setEnrichment = usePlanner((s) => s.setEnrichment)

  const ids = places.map((p) => p.id).join(',')

  useEffect(() => {
    if (!ENV.hasMaps) return
    const now = new Date().getTime()
    for (const place of places) {
      // Drive time is measured from the base of the place's OWN leg.
      const base = legById(place.leg).homeBaseDefault
      const cached = enrichment[place.id]
      if (cached?.fetchedAt && now - cached.fetchedAt < TTL_MS) continue
      if (inFlight.has(place.id)) continue
      inFlight.add(place.id)
      enrichSeedPlace(place, base)
        .then((e) => {
          if (e) setEnrichment(place.id, e)
        })
        .catch(() => {
          /* graceful: keep seed data */
        })
        .finally(() => inFlight.delete(place.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])
}
