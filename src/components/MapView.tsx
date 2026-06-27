import { useState } from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import type { CardPlace } from '../lib/catalog'
import { ENV } from '../lib/env'
import {
  DEFAULT_MAP_CENTER,
  CATEGORY_COLOR,
  BASE_COLOR,
  pinDataUri,
} from '../lib/maps'
import { mapsSearchUrl } from '../lib/links'
import PlaceCard from './PlaceCard'

interface Props {
  cards: CardPlace[]
  center?: { lat: number; lng: number }
  height?: number
}

/** Friendly fallback used when there is no Maps key (graceful degradation). */
function MapFallback({ cards }: { cards: CardPlace[] }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-ink-soft">
        Add a Google Maps key in <strong>Settings</strong> to see the interactive
        map with pins and drive times. Until then, here are your places with map
        links:
      </p>
      <ul className="mt-3 divide-y divide-sand-200">
        {cards.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              <span className="font-medium text-ink">{c.name}</span>
              <span className="text-ink-muted"> · {c.town}</span>
            </span>
            <a
              className="text-sm text-terracotta-600 hover:underline"
              href={c.externalUrl ?? mapsSearchUrl(c.name, c.town)}
              target="_blank"
              rel="noreferrer"
            >
              Map ↗
            </a>
          </li>
        ))}
        {cards.length === 0 && (
          <li className="py-2 text-sm text-ink-muted">No places yet.</li>
        )}
      </ul>
    </div>
  )
}

export default function MapView({ cards, center, height = 420 }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!ENV.hasMaps) return <MapFallback cards={cards} />

  const withCoords = cards.filter((c) => c.enrichment?.coordinates)
  const selected = cards.find((c) => c.id === selectedId)
  const mapCenter = center ?? DEFAULT_MAP_CENTER

  return (
    <div className="flex flex-col gap-3">
      <div
        className="overflow-hidden rounded-2xl border border-sand-200"
        style={{ height }}
      >
        <APIProvider apiKey={ENV.mapsKey}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={11}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          >
            <Marker
              position={mapCenter}
              title="Home base"
              icon={pinDataUri(BASE_COLOR)}
            />
            {withCoords.map((c) => (
              <Marker
                key={c.id}
                position={c.enrichment!.coordinates!}
                title={c.name}
                icon={pinDataUri(CATEGORY_COLOR[c.category])}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
          </Map>
        </APIProvider>
      </div>
      {selected && (
        <div className="max-w-md">
          <PlaceCard card={selected} />
        </div>
      )}
    </div>
  )
}
