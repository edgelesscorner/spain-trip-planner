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
  SeedStay,
} from '../types'
import { SEED_BY_CATEGORY, getSeedPlace } from '../data/seed'
import type { DiscoveredPlace } from './verify'
import type { LiveHotel } from './rates'
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
  /** Photos for the swipeable card carousel (may be empty → placeholder). */
  photos: string[]
  /** Best external link: website > Google Maps > AI source URL. */
  externalUrl?: string
  bookingUrgency?: string
  isDiscovered: boolean
  /** Live Google Hotels nightly price (USD) for the trip dates, when known. */
  liveNightlyUSD?: number
}

/** Photos from an enrichment record (multiple → carousel). */
function enrichmentPhotos(e?: Enrichment): string[] {
  if (!e) return []
  if (e.photoUrls?.length) return e.photoUrls
  return e.photoUrl ? [e.photoUrl] : []
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
      photos: enrichmentPhotos(place.enrichment),
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
    priceHint = place.priceHint ? convertPriceHint(place.priceHint) : undefined
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
    photos: enrichmentPhotos(place.enrichment),
    externalUrl: bestExternalUrl(place.enrichment, place.source),
    bookingUrgency,
    isDiscovered: false,
  }
}

// ── Live hotels (real Google listings, AC-confirmed, priced) ─────────────────

function liveWhy(h: LiveHotel): string {
  if (h.kind === 'rental') {
    const rated = h.rating ? `, rated ${h.rating} on Google` : ''
    return `Vacation rental in ${h.town}${rated}. Available for your dates (Airbnb/Vrbo-style listing via Google).`
  }
  const cls = h.hotelClass ? `${h.hotelClass}-star ` : ''
  const rated = h.rating ? `, rated ${h.rating} on Google` : ''
  return `${cls}hotel in ${h.town}${rated}. Available for your dates.`.replace(
    /^./,
    (c) => c.toUpperCase(),
  )
}

/**
 * Build a Stay card from a live Google hotel. When it matches a curated seed
 * hotel, keep the seed's hand-written notes/tags/badges and just attach the live
 * price + Google data; otherwise build a factual card from Google's own data.
 */
export function liveHotelToCard(h: LiveHotel, seed?: SeedStay): CardPlace {
  const photos = h.images?.length
    ? h.images
    : h.thumbnailUrl
      ? [h.thumbnailUrl]
      : []
  const enrichment: Enrichment = {
    rating: h.rating,
    coordinates: h.coordinates,
    photoUrl: photos[0],
    photoUrls: photos.length ? photos : undefined,
    mapsUrl: h.link,
    verified: true,
  }
  if (seed) {
    const card = toCard({ ...seed, enrichment })
    card.liveNightlyUSD = h.nightlyUSD
    card.externalUrl = card.externalUrl ?? h.link
    return card
  }
  const badges: Badge[] = [{ label: 'AC', tone: 'sea' }]
  if (h.kind === 'rental') badges.push({ label: 'rental', tone: 'accent' })
  if (h.hotelClass) badges.push({ label: `${h.hotelClass}★`, tone: 'neutral' })
  return {
    id: h.id,
    category: 'stay',
    name: h.name,
    town: h.town,
    why: liveWhy(h),
    tags: h.kind === 'rental' ? ['vacation rental'] : ['air conditioning'],
    badges,
    enrichment,
    photos,
    externalUrl: h.link,
    isDiscovered: false,
    liveNightlyUSD: h.nightlyUSD,
  }
}

/**
 * Resolve any saved id (curated seed, live hotel, or verified AI place) to a
 * display card. Guarantees we only render places we can vouch for.
 */
export function resolveCardById(
  id: string,
  enrichment: Record<string, Enrichment>,
  discovered: Record<string, DiscoveredPlace>,
  liveHotels: LiveHotel[],
): CardPlace | undefined {
  const seed = getSeedPlace(id)
  const live = liveHotels.find((h) => h.id === id)
  if (seed) {
    if (seed.category === 'stay' && live) return liveHotelToCard(live, seed)
    return toCard({ ...seed, enrichment: enrichment[id] } as Place)
  }
  if (live) return liveHotelToCard(live)
  const disc = discovered[id]
  if (disc) return toCard(disc)
  return undefined
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
