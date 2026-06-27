// Outbound deep links. These are real searches/lookups — never fabricated place
// pages or prices. The "August rates" link opens a booking search prefilled with
// the trip's exact dates + party size, so the couple sees genuine live nightly
// prices for their stay (the one thing Google Places cannot provide).

import { TRIP_CONFIG } from '../data/seed'

/** Google Maps search for a place (works offline-friendly, no key needed). */
export function mapsSearchUrl(name: string, town: string): string {
  const q = encodeURIComponent(`${name}, ${town}, ${TRIP_CONFIG.region}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

/**
 * Booking search for live nightly rates on the trip's exact dates + party size.
 * Returns the real, date-specific price from the booking site — not a guess.
 */
export function augustRatesUrl(name: string, town: string): string {
  const params = new URLSearchParams({
    ss: `${name} ${town}`,
    checkin: TRIP_CONFIG.startDate,
    checkout: TRIP_CONFIG.endDate,
    group_adults: String(TRIP_CONFIG.party.adults),
    group_children: String(TRIP_CONFIG.party.children),
    no_rooms: '1',
  })
  return `https://www.booking.com/searchresults.html?${params.toString()}`
}
