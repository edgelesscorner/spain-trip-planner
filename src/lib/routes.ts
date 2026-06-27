// Google Routes API — drive time from the home base to a place.
// Defensive: returns null on any failure (the UI then shows a friendly note).

import { ENV } from './env'

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'

interface LatLng {
  lat: number
  lng: number
}

/** Returns drive time in whole minutes, or null if unavailable. */
export async function computeDriveMinutes(
  origin: LatLng,
  destination: LatLng,
): Promise<number | null> {
  if (!ENV.hasMaps) return null
  try {
    const res = await fetch(ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ENV.mapsKey,
        'X-Goog-FieldMask': 'routes.duration',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: origin.lat, longitude: origin.lng },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      routes?: { duration?: string }[]
    }
    const duration = data.routes?.[0]?.duration // e.g. "1234s"
    if (!duration) return null
    const seconds = parseInt(duration.replace(/[^0-9]/g, ''), 10)
    if (!Number.isFinite(seconds)) return null
    return Math.round(seconds / 60)
  } catch {
    return null
  }
}
