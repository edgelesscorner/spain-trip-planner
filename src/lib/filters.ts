// ─────────────────────────────────────────────────────────────────────────────
// Pure filtering + sorting logic, kept separate from React so it can be unit
// tested directly. Stay ALWAYS enforces the AC hard requirement and the nightly
// price ceiling (spec §1, §5, §12).
// ─────────────────────────────────────────────────────────────────────────────

import type { Place, EatTier } from '../types'
import { eurToUsd } from './money'

export type SortKey = 'bestFit' | 'price' | 'drive' | 'rating'

export const SORT_LABELS: Record<SortKey, string> = {
  bestFit: 'Best fit',
  price: 'Price',
  drive: 'Drive time',
  rating: 'Rating',
}

// ── Stay ─────────────────────────────────────────────────────────────────────

export interface StayFilterState {
  /** Hard AC requirement (non-negotiable in the UI). */
  requireAC: boolean
  /** Hard nightly price ceiling in USD (compared against the converted EUR price). */
  ceilingUSD: number
  walkToBeach: boolean
  walkToDining: boolean
  tags: string[]
}

export const DEFAULT_STAY_FILTERS: StayFilterState = {
  requireAC: true,
  ceilingUSD: 300,
  walkToBeach: false,
  walkToDining: false,
  tags: [],
}

/**
 * Apply Stay filters. AC is enforced whenever `requireAC` is true (the UI keeps
 * it true). The ceiling drops any stay whose entry (minimum) nightly price —
 * converted to USD — exceeds the ceiling, i.e. you can't get a room under budget.
 */
export function filterStays(stays: Place[], f: StayFilterState): Place[] {
  return stays.filter((p) => {
    if (p.category !== 'stay') return false
    if (f.requireAC && !p.ac) return false // hard AC filter
    if (eurToUsd(p.priceMinEUR) > f.ceilingUSD) return false // hard price ceiling
    if (f.walkToBeach && !p.walkToBeach) return false
    if (f.walkToDining && !p.walkToDining) return false
    if (f.tags.length && !f.tags.every((t) => p.tags.includes(t))) return false
    return true
  })
}

// ── Eat ──────────────────────────────────────────────────────────────────────

export interface EatFilterState {
  tiers: EatTier[]
  tags: string[]
}

export const DEFAULT_EAT_FILTERS: EatFilterState = { tiers: [], tags: [] }

export function filterEats(eats: Place[], f: EatFilterState): Place[] {
  return eats.filter((p) => {
    if (p.category !== 'eat') return false
    if (f.tiers.length && !f.tiers.includes(p.tier)) return false
    if (f.tags.length && !f.tags.every((t) => p.tags.includes(t))) return false
    return true
  })
}

// ── Do ───────────────────────────────────────────────────────────────────────

export interface DoFilterState {
  interests: string[]
  types: string[]
}

export const DEFAULT_DO_FILTERS: DoFilterState = { interests: [], types: [] }

export function filterDos(dos: Place[], f: DoFilterState): Place[] {
  return dos.filter((p) => {
    if (p.category !== 'do') return false
    if (f.interests.length && !f.interests.some((i) => p.interests.includes(i)))
      return false
    if (f.types.length && !f.types.includes(p.type)) return false
    return true
  })
}

// ── Sorting ──────────────────────────────────────────────────────────────────

function priceMin(p: Place): number {
  return p.category === 'stay' ? p.priceMinEUR : (p.enrichment?.priceLevel ?? 0)
}

function driveMin(p: Place): number {
  return p.enrichment?.driveMinutes ?? Number.POSITIVE_INFINITY
}

function rating(p: Place): number {
  return p.enrichment?.rating ?? -1
}

/** Heuristic "best fit": rewards higher rating, shorter drive, value, walkability. */
export function bestFitScore(p: Place): number {
  let score = ((p.enrichment?.rating ?? 3.6) / 5) * 2
  const dm = p.enrichment?.driveMinutes
  score += dm == null ? 0.4 : 1 - Math.min(dm, 60) / 60
  if (p.category === 'stay') {
    score += 1 - Math.min(p.priceMinEUR, 250) / 250
    if (p.walkToBeach) score += 0.5
    if (p.walkToDining) score += 0.3
  }
  return score
}

export function sortPlaces(places: Place[], key: SortKey): Place[] {
  const copy = [...places]
  switch (key) {
    case 'price':
      return copy.sort((a, b) => priceMin(a) - priceMin(b))
    case 'drive':
      return copy.sort((a, b) => driveMin(a) - driveMin(b))
    case 'rating':
      return copy.sort((a, b) => rating(b) - rating(a))
    case 'bestFit':
    default:
      return copy.sort((a, b) => bestFitScore(b) - bestFitScore(a))
  }
}
