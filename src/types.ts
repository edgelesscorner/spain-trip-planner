// ─────────────────────────────────────────────────────────────────────────────
// Domain types for the Costa Brava Trip Planner.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'stay' | 'eat' | 'do'

export interface TripConfig {
  tripName: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string // ISO yyyy-mm-dd
  nights: number
  party: { adults: number; children: number }
  region: string
  homeBaseOptions: string[]
  homeBaseDefault: string
  hasCar: boolean
  lodgingMaxPerNightEUR: number
  lodgingValueFirst: boolean
  lodgingRequiresAC: boolean
  splurgeDinnersTarget: number
  interests: string[]
  nearestAirports: string[]
}

// ── Seed shapes (the curated, real, offline backbone) ────────────────────────

interface SeedBase {
  /** Stable id derived from name+town; used as the key everywhere. */
  id: string
  category: Category
  name: string
  town: string
  /** Short human price hint exactly as researched (never invented). */
  priceHint?: string
  tags: string[]
  why: string
  /**
   * Marks a generic seed prompt (e.g. "Local seafood, Palamós") that should be
   * resolved to a specific verified venue via Google Places before booking.
   */
  verify?: boolean
}

export interface SeedStay extends SeedBase {
  category: 'stay'
  ac: boolean
  priceHint: string
  /** Parsed nightly EUR bounds from priceHint, for the hard ceiling filter. */
  priceMinEUR: number
  priceMaxEUR: number
  walkToBeach: boolean
  walkToDining: boolean
}

export type EatTier = 'local' | 'splurge' | 'marquee'

export interface SeedEat extends SeedBase {
  category: 'eat'
  tier: EatTier
  michelin?: number
  priceHint: string
  /** Urgency note surfaced as a "book now" badge (esp. El Celler). */
  bookingUrgency?: string
}

export interface SeedDo extends SeedBase {
  category: 'do'
  type: string
  interests: string[]
}

export type SeedPlace = SeedStay | SeedEat | SeedDo

// ── Runtime enrichment (attached from Google Places / Routes, cached) ────────

export interface Enrichment {
  /** Google Places resource id, once resolved. */
  placeId?: string
  coordinates?: { lat: number; lng: number }
  photoUrl?: string
  rating?: number
  userRatingsTotal?: number
  /** Google price level 0–4. */
  priceLevel?: number
  /** Google's actual price range for the place (currency as returned). */
  priceRange?: { start: number; end: number; currency: string }
  website?: string
  mapsUrl?: string
  /** Today's opening hours lines, if available. */
  hours?: string[]
  /** Drive time in minutes from the home base (Routes API). */
  driveMinutes?: number
  /** Whether the entry resolved to a real Google Places record. */
  verified?: boolean
  fetchedAt?: number
}

/** A seed place merged with whatever enrichment we have cached. */
export type Place = SeedPlace & { enrichment?: Enrichment }

// ── User data (persisted) ────────────────────────────────────────────────────

export type ItemStatus = 'saved' | 'scheduled' | 'booked'
export type BookingStatus = 'idea' | 'to-book' | 'booked'

export interface BookingInfo {
  status: BookingStatus
  confirmation?: string
  date?: string
  time?: string
  partySize?: number
  costEUR?: number
  notes?: string
}

export interface SavedItem {
  id: string // place id
  category: Category
  status: ItemStatus
  savedAt: number
  /** ISO yyyy-mm-dd of the assigned day when scheduled. */
  day?: string
  /** Optional "HH:MM" for ordering within a day. */
  timeSlot?: string
  booking?: BookingInfo
  notes?: string
}

export interface PackingItem {
  id: string
  text: string
  packed: boolean
}

export interface Settings {
  homeBase: string
  budgetTargetEUR: number
  dietary: string
  /** Hard ceiling for Stay nightly price filter (€). */
  stayPriceCeilingEUR: number
}
