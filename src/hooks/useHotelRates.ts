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
  const setLiveHotels = usePlanner((s) => s.setLiveHotels)

  useEffect(() => {
    const fresh = Date.now() - hotelsFetchedAt < TTL_MS
    if (fresh && hasHotels) return
    let cancelled = false
    fetchLiveHotels().then((hotels) => {
      if (!cancelled && hotels.length > 0) setLiveHotels(hotels)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
