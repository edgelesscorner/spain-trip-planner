import { describe, it, expect } from 'vitest'
import type { Place, SeedStay } from '../types'
import { EAT, DO } from '../data/seed'
import { eurToUsd } from './money'
import { filterStays, filterEats, filterDos, sortPlaces } from './filters'

function stay(partial: Partial<SeedStay> & { id: string; ac: boolean; priceMinEUR: number }): SeedStay {
  return {
    category: 'stay',
    name: partial.id,
    town: 'San Sebastián',
    leg: 'basque',
    priceHint: '€100',
    priceMaxEUR: partial.priceMinEUR,
    walkToBeach: false,
    walkToDining: false,
    tags: [],
    why: 'test',
    ...partial,
  }
}

describe('Stay filters — AC hard requirement', () => {
  it('drops any non-AC stay even if everything else matches', () => {
    const input: Place[] = [
      stay({ id: 'has-ac', ac: true, priceMinEUR: 120 }),
      stay({ id: 'no-ac', ac: false, priceMinEUR: 90 }),
    ]
    const out = filterStays(input, {
      requireAC: true,
      ceilingUSD: 1000,
      walkToBeach: false,
      walkToDining: false,
      tags: [],
    })
    expect(out.map((p) => p.id)).toEqual(['has-ac'])
  })
})

describe('Stay filters — USD price ceiling', () => {
  it('drops stays whose entry price (converted) exceeds the ceiling', () => {
    const input: Place[] = [
      stay({ id: 'cheap', ac: true, priceMinEUR: 100 }), // ~$108
      stay({ id: 'pricey', ac: true, priceMinEUR: 400 }), // ~$432
    ]
    const out = filterStays(input, {
      requireAC: true,
      ceilingUSD: 200,
      walkToBeach: false,
      walkToDining: false,
      tags: [],
    })
    expect(out.map((p) => p.id)).toEqual(['cheap'])
    expect(out.every((p) => p.category === 'stay' && eurToUsd(p.priceMinEUR) <= 200)).toBe(true)
  })
})

describe('Eat / Do filters over the new two-leg seed', () => {
  it('filters eat by tier', () => {
    const out = filterEats(EAT, { tiers: ['marquee'], types: [] })
    const names = out.map((p) => p.name)
    expect(names).toContain('Arzak')
    expect(out.every((p) => p.category === 'eat' && p.tier === 'marquee')).toBe(true)
    expect(names).not.toContain('Bar Néstor') // a 'local' pintxos bar
  })

  it('filters eat by type (category)', () => {
    const out = filterEats(EAT, { tiers: [], types: ['pintxos'] })
    const names = out.map((p) => p.name)
    expect(names).toContain('Bar Néstor')
    expect(out.every((p) => p.category === 'eat' && p.type === 'pintxos')).toBe(true)
    expect(names).not.toContain('Arzak') // fine-dining
  })

  it('filters do by type (category)', () => {
    const out = filterDos(DO, { types: ['winery'] })
    const names = out.map((p) => p.name)
    expect(names).toContain('Bodegas Binifadet')
    expect(out.every((p) => p.category === 'do' && p.type === 'winery')).toBe(true)
    expect(names).not.toContain('La Concha Beach') // a beach
  })
})

describe('Sorting', () => {
  it('preserves the set when sorting', () => {
    expect(sortPlaces(EAT, 'bestFit')).toHaveLength(EAT.length)
  })
})
