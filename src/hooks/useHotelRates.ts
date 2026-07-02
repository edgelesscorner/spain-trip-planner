import { useEffect } from 'react'
import { usePlanner } from '../store/planner'
import { fetchLiveHotels } from '../lib/rates'

const TTL_MS = 1000 * 60 * 60 * 6 // 6h — matches the proxy cache

/**
 * Fetch the live, AC-confirmed, priced hotels from the proxy if our cache is
 * stale. No-op / graceful if the proxy isn't running (the app then falls back
 * to the curated seed hotels).
 */
export function useLiveHotels(): void {
  const hotelsFetchedAt = usePlanner((s) => s.hotelsFetchedAt)
  const hasHotels = usePlanner((s) => s.liveHotels.length > 0)
  // Cache written before LiveHotel gained `kind` can't drive the Hotels/
  // Rentals filters — treat it as stale so we refetch a listing that has it.
  const staleShape = usePlanner((s) =>
    s.liveHotels.some((h) => !('kind' in h)),
  )
  const setLiveHotels = usePlanner((s) => s.setLiveHotels)

  // Deps (not []) so this re-runs once async persist hydration merges the
  // cached hotels in — otherwise a stale/old-shape cache that lands after mount
  // would never be re-checked. Refetching fresh data leaves these deps stable
  // (fresh + has hotels + correct shape), so there's no refetch loop.
  useEffect(() => {
    const fresh = Date.now() - hotelsFetchedAt < TTL_MS
    if (fresh && hasHotels && !staleShape) return
    let cancelled = false
    fetchLiveHotels().then((hotels) => {
      if (!cancelled && hotels.length > 0) setLiveHotels(hotels)
    })
    return () => {
      cancelled = true
    }
  }, [hotelsFetchedAt, hasHotels, staleShape, setLiveHotels])
}
