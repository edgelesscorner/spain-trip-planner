import { describe, it, expect } from 'vitest'
import { verifySuggestion, suggestAndVerify } from './verify'
import { fetchAISuggestions } from './anthropic'
import { resolvePlaceData } from './catalog'

// In the test environment no API keys are set, so the live path must degrade to
// "nothing shown" — which also proves the real-only guarantee: an unverifiable
// suggestion is dropped, never rendered.

describe('Real-only verification gate', () => {
  it('drops AI suggestions that cannot be verified (no Maps key → null)', async () => {
    const result = await verifySuggestion(
      {
        name: 'Totally Made Up Restaurant',
        town: 'Nowhere',
        address: '123 Fake St',
        reason: 'invented',
        sourceUrl: 'https://example.com',
      },
      'eat',
    )
    expect(result).toBeNull()
  })

  it('suggestAndVerify returns nothing without keys', async () => {
    const out = await suggestAndVerify('eat', [])
    expect(out).toEqual([])
  })

  it('fetchAISuggestions returns nothing without an Anthropic key', async () => {
    const out = await fetchAISuggestions('do', [])
    expect(out).toEqual([])
  })
})

describe('Only seed or verified ids resolve', () => {
  it('resolves a known seed id', () => {
    const p = resolvePlaceData('casamar', {}, {})
    expect(p?.name).toBe('Casamar')
  })

  it('returns undefined for an unknown / invented id', () => {
    const p = resolvePlaceData('hotel-that-does-not-exist', {}, {})
    expect(p).toBeUndefined()
  })
})
