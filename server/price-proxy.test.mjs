import { describe, it, expect } from 'vitest'
import {
  buildHotelList,
  seedIdForProperty,
  restaurantOnly,
  hasAC,
  slug,
} from './price-proxy.mjs'

const AC = ['Air conditioning', 'Pool']
const NO_AC = ['Pool', 'Free Wi-Fi']

const ENTRIES = [
  {
    leg: 'basque',
    town: 'San Sebastián',
    props: [
      { name: 'Hotel María Cristina', type: 'hotel', rate_per_night: { extracted_lowest: 520 }, amenities: AC, overall_rating: 4.6, extracted_hotel_class: 5 },
      { name: 'Pensión No AC', type: 'hotel', rate_per_night: { extracted_lowest: 90 }, amenities: NO_AC },
      { name: 'Restaurant Kokotxa', type: 'hotel', rate_per_night: { extracted_lowest: 200 }, amenities: AC },
      { name: 'Apartamento Gros', type: 'vacation rental', rate_per_night: { extracted_lowest: 150 }, amenities: AC },
      { name: 'Hotel Sin Precio', type: 'hotel', rate_per_night: {}, amenities: AC },
    ],
  },
  {
    leg: 'balearic',
    town: 'Palma de Mallorca',
    kind: 'hotel',
    props: [
      { name: 'Hotel Cort', type: 'hotel', rate_per_night: { extracted_lowest: 310 }, amenities: AC },
      { name: 'Hotel Restaurant Bon Sol', type: 'hotel', rate_per_night: { extracted_lowest: 280 }, amenities: AC },
    ],
  },
  {
    leg: 'balearic',
    town: 'Palma de Mallorca',
    kind: 'rental',
    props: [
      { name: 'Spot Apartment - Entire Place', type: 'vacation rental', rate_per_night: { extracted_lowest: 200 }, amenities: AC },
      { name: 'No-AC Apartment', type: 'vacation rental', rate_per_night: { extracted_lowest: 120 }, amenities: NO_AC },
    ],
  },
]

describe('buildHotelList — real, AC-confirmed, priced hotels, tagged by leg', () => {
  const hotels = buildHotelList(ENTRIES)
  const ids = hotels.map((h) => h.id)

  it('keeps only real AC hotels with a rate and tags them by leg', () => {
    expect(ids).toContain(slug('Hotel María Cristina'))
    expect(ids).toContain(slug('Hotel Cort'))
    expect(ids).toContain(slug('Hotel Restaurant Bon Sol')) // "Hotel Restaurant …" is a hotel → kept
    expect(hotels.find((h) => h.id === slug('Hotel María Cristina'))?.leg).toBe('basque')
    expect(hotels.find((h) => h.id === slug('Hotel Cort'))?.leg).toBe('balearic')
    expect(hotels.every((h) => h.curated === false)).toBe(true) // no curated seed hotels now
    // vacation rental included, tagged kind:'rental' with a distinct id
    const rental = hotels.find((h) => h.id === slug('Spot Apartment - Entire Place') + '-rental')
    expect(rental?.kind).toBe('rental')
    expect(hotels.filter((h) => h.kind === 'hotel').every((h) => h.kind === 'hotel')).toBe(true)
    expect(hotels).toHaveLength(4)
  })

  it('excludes no-AC, restaurant-only, vacation-rental, and rate-less listings', () => {
    expect(ids).not.toContain(slug('Pensión No AC'))
    expect(ids).not.toContain(slug('Restaurant Kokotxa'))
    expect(ids).not.toContain(slug('Apartamento Gros'))
    expect(ids).not.toContain(slug('Hotel Sin Precio'))
  })

  it('helpers behave', () => {
    expect(restaurantOnly('Restaurant Kokotxa')).toBe(true)
    expect(restaurantOnly('Hotel Restaurant Bon Sol')).toBe(false)
    expect(hasAC({ amenities: AC })).toBe(true)
    expect(hasAC({ amenities: NO_AC })).toBe(false)
    expect(seedIdForProperty({ name: 'Anything', type: 'hotel' })).toBeNull()
  })
})
