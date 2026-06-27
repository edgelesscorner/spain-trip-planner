import { describe, it, expect } from 'vitest'
import type { Place, SeedStay } from '../types'
import { STAY, EAT, DO } from '../data/seed'
import { eurToUsd } from './money'
import {
  filterStays,
  filterEats,
  filterDos,
  sortPlaces,
} from './filters'

describe('Stay filters — AC hard requirement', () => {
  it('drops any non-AC stay even if everything else matches', () => {
    const fakeNoAC: SeedStay = {
      id: 'fake-no-ac',
      category: 'stay',
      name: 'No-AC Test Inn',
      town: 'Llafranc',
      ac: false,
      priceHint: '€90',
      priceMinEUR: 90,
      priceMaxEUR: 90,
      walkToBeach: true,
      walkToDining: true,
      tags: [],
      why: 'test only',
    }
    const input: Place[] = [...STAY, fakeNoAC]
    const out = filterStays(input, {
      requireAC: true,
      ceilingUSD: 400,
      walkToBeach: false,
      walkToDining: false,
      tags: [],
    })
    expect(out.every((p) => p.category === 'stay' && p.ac)).toBe(true)
    expect(out.find((p) => p.id === 'fake-no-ac')).toBeUndefined()
  })
})

describe('Stay filters — USD price ceiling', () => {
  it('enforces the nightly price ceiling ($150 drops Isabella’s ~$194+)', () => {
    const out = filterStays(STAY, {
      requireAC: true,
      ceilingUSD: 150,
      walkToBeach: false,
      walkToDining: false,
      tags: [],
    })
    const names = out.map((p) => p.name)
    expect(names).toContain('Hotel Mediterrani') // ~$86–162
    expect(names).not.toContain("Isabella's Llafranc") // ~$194–281
    expect(
      out.every((p) => p.category === 'stay' && eurToUsd(p.priceMinEUR) <= 150),
    ).toBe(true)
  })

  it('at the default $300 ceiling keeps every AC seed stay', () => {
    const out = filterStays(STAY, {
      requireAC: true,
      ceilingUSD: 300,
      walkToBeach: false,
      walkToDining: false,
      tags: [],
    })
    expect(out.length).toBe(STAY.length)
  })
})

describe('Eat / Do filters', () => {
  it('filters eat by tier', () => {
    const out = filterEats(EAT, { tiers: ['marquee'], tags: [] })
    expect(out.map((p) => p.name)).toEqual(['El Celler de Can Roca'])
  })

  it('filters do by interest', () => {
    const out = filterDos(DO, { interests: ['wine'], types: [] })
    const names = out.map((p) => p.name)
    expect(names).toContain('DO Empordà winery visit')
    expect(names).not.toContain('Girona old town')
  })
})

describe('Sorting', () => {
  it('sorts stays by price ascending', () => {
    const sorted = sortPlaces(STAY, 'price') as SeedStay[]
    const prices = sorted.map((p) => p.priceMinEUR)
    const ascending = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(ascending)
    expect(sorted[0].name).toBe('Hotel Mediterrani') // cheapest entry (€80)
  })
})
