import { useEffect, useState } from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import type { Category } from '../types'
import { ENV } from '../lib/env'
import { CATEGORY_COLOR, pinDataUri } from '../lib/maps'

/** A single-location mini map for the detail popup. Falls back to a Maps link. */
export default function PlaceMap({
  coords,
  name,
  category,
  mapsUrl,
  height = 220,
}: {
  coords?: { lat: number; lng: number }
  name: string
  category: Category
  mapsUrl: string
  height?: number
}) {
  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void }
    w.gm_authFailure = () => setAuthFailed(true)
  }, [])

  if (!ENV.hasMaps || !coords || authFailed) {
    return (
      <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-outline w-full">
        View location on Google Maps ↗
      </a>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-sand-200"
      style={{ height }}
    >
      <APIProvider apiKey={ENV.mapsKey}>
        <Map
          defaultCenter={coords}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: '100%', height: '100%' }}
        >
          <Marker
            position={coords}
            title={name}
            icon={pinDataUri(CATEGORY_COLOR[category])}
          />
        </Map>
      </APIProvider>
    </div>
  )
}
