import { describe, it, expect } from 'vitest'
import {
  eurToUsd,
  formatUSD,
  convertPriceHint,
  formatGooglePriceRangeUSD,
  EUR_TO_USD,
} from './money'

describe('money conversion (derived from EUR, never invented)', () => {
  it('converts EUR→USD at the documented rate', () => {
    expect(eurToUsd(100)).toBe(Math.round(100 * EUR_TO_USD))
    expect(eurToUsd(80)).toBe(86)
    expect(eurToUsd(180)).toBe(194)
  })

  it('formats USD with a thousands separator', () => {
    expect(formatUSD(2500)).toBe('$2,500')
  })

  it('converts price ranges', () => {
    expect(convertPriceHint('€80–150')).toBe('$86–$162')
    expect(convertPriceHint('€180–260 (treat)')).toBe('$194–$281 (treat)')
  })

  it('converts single amounts and preserves suffixes', () => {
    expect(convertPriceHint('tasting from ~€79')).toBe('tasting from ~$85')
    expect(convertPriceHint('wine menu ~€74+')).toBe('wine menu ~$80+')
  })

  it('converts symbol-only price tiers', () => {
    expect(convertPriceHint('€€')).toBe('$$')
    expect(convertPriceHint('€€–€€€')).toBe('$$–$$$')
  })

  it('formats Google price ranges in USD', () => {
    expect(
      formatGooglePriceRangeUSD({ start: 100, end: 200, currency: 'EUR' }),
    ).toBe('$108–$216')
    expect(
      formatGooglePriceRangeUSD({ start: 120, end: 240, currency: 'USD' }),
    ).toBe('$120–$240')
    expect(formatGooglePriceRangeUSD(undefined)).toBeNull()
  })
})
