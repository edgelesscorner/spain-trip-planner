// ─────────────────────────────────────────────────────────────────────────────
// Domain types for the two-leg Spain Trip Planner (Basque Country + Balearics).
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'stay' | 'eat' | 'do'

/** A stable leg id. The trip is split into consecutive legs (regions). */
export type LegId = 'basque' | 'balearic'

/** One leg of the trip — its own region, dates, and base(s). */
export interface TripLeg {
  id: LegId
  name: string // "Basque Country"
  region: string // "Basque Country, Spain"
  startDate: string // ISO yyyy-mm-dd (check-in)
  endDate: string // ISO yyyy-mm-dd (check-out)
  nights: number
  bases: string[] // ["San Sebastián", "Bilbao"]
  homeBaseDefault: string
  /** Towns to query for live hotels (also the drive-time context). */
  towns: string[]
  /** How you get to the NEXT leg (e.g. a flight), for the itinerary. */
  travelToNext?: string
}

export interface TripConfig {
  tripName: string
  startDate: string // overall ISO yyyy-mm-dd
  endDate: string // overall ISO yyyy-mm-dd
  nights: number
  party: { adults: number; children: number }
  region: string
  legs: TripLeg[]
  homeBaseOptions: string[]
  homeBaseDefault: string
  hasCar: boolean
  lodgingRequiresAC: boolean
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
  /** Which leg of the trip this place belongs to. */
  leg: LegId
  /** Short human price hint exactly as researched (never invented). */
  priceHint?: string
  tags: string[]
  why: string
  /** Source URL the recommendation was researched/verified from. */
  source?: string
  /**
   * Marks a generic seed prompt that should be resolved to a specific verified
   * venue via Google Places before booking.
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
  /** Urgency note surfaced as a "book now" badge. */
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
