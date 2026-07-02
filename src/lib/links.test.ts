import { describe, it, expect } from 'vitest'
import { augustRatesUrl, mapsSearchUrl } from './links'

describe('outbound links (real searches, not fabricated)', () => {
  it('augustRatesUrl prefills the trip dates + party size for live rates', () => {
    const url = augustRatesUrl('Hotel Mediterrani', 'Calella de Palafrugell')
    expect(url).toContain('booking.com')
    expect(url).toContain('checkin=2026-08-03')
    expect(url).toContain('checkout=2026-08-12')
    expect(url).toContain('group_adults=2')
    expect(url).toContain('Hotel+Mediterrani')
  })

  it('mapsSearchUrl builds a real Google Maps search', () => {
    const url = mapsSearchUrl('Casamar', 'Llafranc')
    expect(url).toContain('google.com/maps/search')
    expect(url).toContain('Casamar')
  })
})
