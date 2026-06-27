// ─────────────────────────────────────────────────────────────────────────────
// Bridges the typed seed data + cached enrichment + verified live places into a
// single normalized shape the UI renders. Also derives flag badges and the
// running budget. Everything here is pure and unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Category,
  Place,
  Enrichment,
  SavedItem,
} from '../types'
import { SEED_BY_CATEGORY, getSeedPlace } from '../data/seed'
import type { DiscoveredPlace } from './verify'
import { convertPriceHint } from './money'

export type BadgeTone = 'accent' | 'sea' | 'urgent' | 'neutral'

export interface Badge {
  label: string
  tone: BadgeTone
}

export interface CardPlace {
  id: string
  category: Category
  name: string
  town: string
  why: string
  tags: string[]
  priceHint?: string
  badges: Badge[]
  enrichment?: Enrichment
  /** Best external link: website > Google Maps > AI source URL. */
  externalUrl?: string
  bookingUrgency?: string
  isDiscovered: boolean
}

export function isDiscovered(
  x: Place | DiscoveredPlace,
): x is DiscoveredPlace {
  return (x as DiscoveredPlace).verified === true && x.id.startsWith('ai-')
}

/** Seed places of a category, merged with any cached enrichment. */
export function mergeEnrichment(
  category: Category,
  enrichment: Record<string, Enrichment>,
): Place[] {
  return SEED_BY_CATEGORY[category].map((p) => ({
    ...p,
    enrichment: enrichment[p.id],
  })) as Place[]
}

/**
 * Resolve a place id to its data. ONLY seed places or verified discovered
 * places resolve — this is what guarantees we never render an unknown id.
 */
export function resolvePlaceData(
  id: string,
  enrichment: Record<string, Enrichment>,
  discovered: Record<string, DiscoveredPlace>,
): Place | DiscoveredPlace | undefined {
  const seed = getSeedPlace(id)
  if (seed) return { ...seed, enrichment: enrichment[id] } as Place
  return discovered[id]
}

function bestExternalUrl(
  e: Enrichment | undefined,
  fallbackSourceUrl?: string,
): string | undefined {
  return e?.website || e?.mapsUrl || fallbackSourceUrl || undefined
}

/** Build the display card (with flag badges) for a seed or discovered place. */
export function toCard(place: Place | DiscoveredPlace): CardPlace {
  if (isDiscovered(place)) {
    return {
      id: place.id,
      category: place.category,
      name: place.name,
      town: place.town,
      why: place.why,
      tags: place.tags,
      badges: [
        { label: 'verified', tone: 'sea' },
        { label: 'suggested', tone: 'neutral' },
      ],
      enrichment: place.enrichment,
      externalUrl: bestExternalUrl(place.enrichment, place.sourceUrl),
      isDiscovered: true,
    }
  }

  const badges: Badge[] = []
  let priceHint: string | undefined
  let bookingUrgency: string | undefined

  if (place.category === 'stay') {
    priceHint = convertPriceHint(place.priceHint)
    if (place.ac) badges.push({ label: 'AC', tone: 'sea' })
    if (place.walkToBeach)
      badges.push({ label: 'walk-to-beach', tone: 'accent' })
    if (place.walkToDining)
      badges.push({ label: 'walk-to-dining', tone: 'neutral' })
    if (place.priceMinEUR > 0 && place.priceMinEUR < 120)
      badges.push({ label: 'value', tone: 'accent' })
  } else if (place.category === 'eat') {
    priceHint = convertPriceHint(place.priceHint)
    if (place.michelin && place.michelin > 0)
      badges.push({
        label: `Michelin ${'★'.repeat(place.michelin)}`,
        tone: 'accent',
      })
    if (place.tier === 'splurge')
      badges.push({ label: 'splurge', tone: 'neutral' })
    if (place.tier === 'marquee')
      badges.push({ label: 'marquee', tone: 'accent' })
    if (place.tier === 'local')
      badges.push({ label: 'local', tone: 'neutral' })
    if (place.tags.some((t) => /wine|empordà|emporda/i.test(t)))
      badges.push({ label: 'wine', tone: 'sea' })
    if (place.bookingUrgency) {
      bookingUrgency = place.bookingUrgency
      const critical = /CRITICAL/i.test(place.bookingUrgency)
      badges.push({
        label: critical ? 'waitlist now' : 'books ahead',
        tone: 'urgent',
      })
    }
  } else {
    // do
    for (const i of place.interests) {
      if (/wine|vineyard/i.test(i)) badges.push({ label: 'wine', tone: 'sea' })
      if (/cove/i.test(i)) badges.push({ label: 'cove', tone: 'accent' })
      if (/swim/i.test(i)) badges.push({ label: 'swim', tone: 'sea' })
      if (/historic|culture/i.test(i))
        badges.push({ label: 'culture', tone: 'neutral' })
    }
  }

  // de-dupe badges by label
  const seen = new Set<string>()
  const uniqueBadges = badges.filter((b) =>
    seen.has(b.label) ? false : (seen.add(b.label), true),
  )

  return {
    id: place.id,
    category: place.category,
    name: place.name,
    town: place.town,
    why: place.why,
    tags: place.tags,
    priceHint,
    badges: uniqueBadges,
    enrichment: place.enrichment,
    externalUrl: bestExternalUrl(place.enrichment),
    bookingUrgency,
    isDiscovered: false,
  }
}

// ── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetBreakdown {
  total: number
  byCategory: Record<Category, number>
  targetEUR: number
  remaining: number
}

const CATS: Category[] = ['stay', 'eat', 'do']

/** Sum booked/estimated costs entered by the user, against the target. */
export function computeBudget(
  saved: Record<string, SavedItem>,
  targetEUR: number,
): BudgetBreakdown {
  const byCategory: Record<Category, number> = { stay: 0, eat: 0, do: 0 }
  let total = 0
  for (const item of Object.values(saved)) {
    const cost = item.booking?.costEUR
    if (typeof cost === 'number' && Number.isFinite(cost)) {
      byCategory[item.category] += cost
      total += cost
    }
  }
  void CATS
  return { total, byCategory, targetEUR, remaining: targetEUR - total }
}
