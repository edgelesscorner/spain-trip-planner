// ─────────────────────────────────────────────────────────────────────────────
// Curated, REAL, verified Costa Brava seed dataset (spec §9).
//
// This is the trustworthy offline backbone. Every entry is a real place. At
// runtime each is resolved/enriched against Google Places (coordinates, photo,
// rating, hours, website, drive time). Entries that FAIL Places verification are
// dropped at render time rather than shown as stale/guessed data (see lib/verify).
//
// TRIP_CONFIG is the single place to relocate the trip: change base/region/dates
// here and the whole app (map center, distances, suggestions) keys off it.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TripConfig,
  SeedStay,
  SeedEat,
  SeedDo,
  SeedPlace,
} from '../types'

export const TRIP_CONFIG: TripConfig = {
  tripName: 'Costa Brava — Aug 1–7',
  startDate: '2026-08-01',
  endDate: '2026-08-07',
  nights: 6,
  party: { adults: 2, children: 0 },
  region: 'Costa Brava (Empordà), Catalonia, Spain',
  homeBaseOptions: ['Calella de Palafrugell', 'Llafranc', 'Begur', 'Tamariu'],
  homeBaseDefault: 'Calella de Palafrugell',
  hasCar: true,
  lodgingMaxPerNightEUR: 200,
  lodgingValueFirst: true,
  lodgingRequiresAC: true,
  splurgeDinnersTarget: 2,
  interests: [
    'wine',
    'vineyards',
    'historic towns',
    'culture',
    'boats',
    'coves',
    'swimming',
  ],
  nearestAirports: [
    'Girona–Costa Brava (GRO, ~50 min)',
    'Barcelona–El Prat (BCN, ~1.5 h)',
  ],
}

/** Map a name to a stable, URL-safe id. */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse a price hint like "€80–150" / "€120–190" / "€180–260 (treat)" into
 * numeric EUR bounds. Returns the same number for both bounds when a single
 * value is given. Returns [0,0] when no number is present (e.g. tasting hints).
 */
export function parsePriceRangeEUR(hint: string): [number, number] {
  const nums = (hint.match(/\d+/g) ?? []).map(Number)
  if (nums.length === 0) return [0, 0]
  if (nums.length === 1) return [nums[0], nums[0]]
  return [Math.min(...nums), Math.max(...nums)]
}

// ── Stay ─────────────────────────────────────────────────────────────────────

type RawStay = Omit<SeedStay, 'id' | 'category' | 'priceMinEUR' | 'priceMaxEUR'>

const RAW_STAY: RawStay[] = [
  {
    name: 'Hotel Mediterrani',
    town: 'Calella de Palafrugell',
    ac: true,
    priceHint: '€80–150',
    walkToBeach: true,
    walkToDining: true,
    tags: ['sea-view', 'rooftop terrace', 'value', 'couples'],
    why: 'Refurbished, sea-view rooms, AC + fans; walkable to beach and restaurants; strong value.',
  },
  {
    name: 'Hotel Calella de Palafrugell',
    town: 'Calella de Palafrugell',
    ac: true,
    priceHint: '€100–160',
    walkToBeach: true,
    walkToDining: true,
    tags: ['highly-rated', 'central', 'value'],
    why: 'Very highly rated, central, AC, walkable to everything.',
  },
  {
    name: 'Hotel Sant Roc',
    town: 'Calella de Palafrugell',
    ac: true,
    priceHint: '€120–190',
    walkToBeach: true,
    walkToDining: true,
    tags: ['sea-view', 'terrace restaurant', 'clifftop'],
    why: 'Clifftop bay views, sea-view balconies, direct path to the beach.',
  },
  {
    name: 'Hotel Alga',
    town: 'Calella de Palafrugell',
    ac: true,
    priceHint: '€120–190',
    walkToBeach: false,
    walkToDining: true,
    tags: ['gardens', 'pools', 'quiet'],
    why: 'Set in large gardens minutes from the centre; pools; calm.',
  },
  {
    name: 'Hotel Llafranch',
    town: 'Llafranc',
    ac: true,
    priceHint: '€110–190',
    walkToBeach: true,
    walkToDining: true,
    tags: ['seafront', 'small', 'good restaurant'],
    why: 'Small seafront hotel on the promenade with a well-regarded restaurant.',
  },
  {
    name: 'Hotel Terramar',
    town: 'Llafranc',
    ac: true,
    priceHint: '€120–190',
    walkToBeach: true,
    walkToDining: true,
    tags: ['seafront', 'sea-view'],
    why: 'Seafront, modern sea-view rooms overlooking Llafranc beach.',
  },
  {
    name: "Isabella's Llafranc",
    town: 'Llafranc',
    ac: true,
    priceHint: '€180–260 (treat)',
    walkToBeach: true,
    walkToDining: true,
    tags: ['boutique', 'design', 'seafront', 'restaurant'],
    why: 'Design-forward boutique on the seafront; splurge-night option with its own restaurant.',
  },
  {
    name: 'El Far Hotel',
    town: 'Llafranc (Sant Sebastià)',
    ac: true,
    priceHint: '€150–230',
    walkToBeach: false,
    walkToDining: false,
    tags: ['clifftop', 'views', 'restaurant'],
    why: 'Romantic clifftop hideaway with panoramic views and a restaurant (needs a short drive down).',
  },
  {
    name: 'La Bionda',
    town: 'Begur',
    ac: true,
    priceHint: '€160–240',
    walkToBeach: false,
    walkToDining: true,
    tags: ['adults-only', 'boutique', 'garden'],
    why: 'Adults-only boutique in charming hilltop Begur; coves a short drive away.',
  },
]

export const STAY: SeedStay[] = RAW_STAY.map((s) => {
  const [priceMinEUR, priceMaxEUR] = parsePriceRangeEUR(s.priceHint)
  return { ...s, id: slug(s.name), category: 'stay', priceMinEUR, priceMaxEUR }
})

// ── Eat ──────────────────────────────────────────────────────────────────────

type RawEat = Omit<SeedEat, 'id' | 'category'>

const RAW_EAT: RawEat[] = [
  {
    name: 'Casamar',
    town: 'Llafranc',
    tier: 'splurge',
    michelin: 1,
    priceHint: 'tasting from ~€79',
    tags: ['sea-view', 'modern Catalan', 'DO Empordà wines'],
    why: 'Michelin 1-star with sea views and local wines — the walkable splurge if you base in Llafranc.',
    bookingUrgency: 'Reserve weeks ahead for peak August.',
  },
  {
    name: 'Bo.TiC',
    town: 'Corçà',
    tier: 'splurge',
    michelin: 2,
    priceHint: '~€150–190',
    tags: ['creative Empordà', 'intimate'],
    why: '2-star in an old carriage workshop; inventive takes on Empordà classics; ~30 min drive and far more attainable than El Celler.',
    bookingUrgency: 'Book 1–2 months ahead.',
  },
  {
    name: 'Castell Peralada',
    town: 'Peralada',
    tier: 'splurge',
    michelin: 1,
    priceHint: 'wine menu ~€74+',
    tags: ['castle setting', 'wine estate', 'pairings'],
    why: '1-star in a 14th-c castle with its own vineyards — combine the splurge with wine.',
    bookingUrgency: 'Book several weeks ahead.',
  },
  {
    name: 'El Celler de Can Roca',
    town: 'Girona',
    tier: 'marquee',
    michelin: 3,
    priceHint: '~€195–215',
    tags: ['world-famous', 'tasting', 'bucket-list'],
    why: "One of the world's best. ~40 minutes' drive.",
    bookingUrgency:
      'CRITICAL: bookings open 11 months ahead at midnight on the 1st and sell out within hours — for these dates, join the waitlist now and don’t count on it.',
  },
  {
    name: 'Miramar',
    town: 'Llançà',
    tier: 'splurge',
    michelin: 2,
    priceHint: '~€180',
    tags: ['seafront', 'avant-garde seafood'],
    why: '2-star seafront avant-garde cooking (~1 h north) if you want a coastal-drive splurge.',
    bookingUrgency: 'Book 1–2 months ahead.',
  },
  {
    name: 'Esperit Roca',
    town: 'Sant Julià de Ramis',
    tier: 'splurge',
    michelin: 1,
    priceHint: 'tasting menus + à la carte',
    tags: ['Roca brothers', 'fortress setting'],
    why: "The Roca brothers' newer, more attainable concept in a hilltop fortress near Girona.",
    bookingUrgency: 'Easier than El Celler but still book ahead.',
  },
  {
    name: 'Local seafood, Palamós',
    town: 'Palamós',
    tier: 'local',
    priceHint: '€€',
    tags: ['gambes de Palamós', 'fishing port', 'seafood'],
    why: 'Palamós is famous for its prawns; verify a specific harbour-front seafood spot via Places.',
    verify: true,
  },
  {
    name: 'Hostal Restaurant Sa Tuna',
    town: 'Sa Tuna (Begur)',
    tier: 'local',
    priceHint: '€€–€€€',
    tags: ['on-the-water', 'cove', 'seafood'],
    why: 'Dine right on a tiny cove — quintessential casual Costa Brava.',
  },
]

export const EAT: SeedEat[] = RAW_EAT.map((e) => ({
  ...e,
  id: slug(e.name),
  category: 'eat',
}))

export const EAT_NOTE =
  'Seed a handful more local spots in Calella de Palafrugell and Llafranc by querying Google Places for top-rated seafood/Catalan within walking distance of the base; show only verified results.'

// ── Do ───────────────────────────────────────────────────────────────────────

type RawDo = Omit<SeedDo, 'id' | 'category'>

const RAW_DO: RawDo[] = [
  {
    name: 'Camí de Ronda (Calella ↔ Llafranc ↔ Tamariu)',
    town: 'Palafrugell coast',
    type: 'walk',
    interests: ['coves', 'scenery'],
    tags: ['coves', 'scenery', 'walkable'],
    why: 'Cliffside coastal path linking the coves — walkable straight from base.',
  },
  {
    name: 'Cove-hopping: Sa Tuna, Aiguablava, Sa Riera, Platja Fonda',
    town: 'Begur coast',
    type: 'beach',
    interests: ['swimming', 'coves'],
    tags: ['coves', 'swimming', 'beach'],
    why: "The Costa Brava's signature small turquoise coves; short drives apart.",
  },
  {
    name: 'Cap Roig Botanical Gardens',
    town: 'Calella de Palafrugell',
    type: 'sight',
    interests: ['culture', 'scenery'],
    tags: ['culture', 'scenery', 'gardens'],
    why: 'Clifftop gardens with sea views; walkable/short drive from Calella.',
  },
  {
    name: 'License-free boat rental / boat tour',
    town: 'Palamós or Roses',
    type: 'boat',
    interests: ['boats', 'coves'],
    tags: ['boats', 'coves'],
    why: 'Rent a small boat (no license) or take a tour to reach hidden coves by sea.',
    verify: true,
  },
  {
    name: 'Medes Islands snorkeling / diving',
    town: "L'Estartit",
    type: 'watersport',
    interests: ['swimming', 'coves'],
    tags: ['swimming', 'coves', 'snorkeling'],
    why: "Protected marine reserve — the area's best snorkeling/diving.",
    verify: true,
  },
  {
    name: 'DO Empordà winery visit',
    town: 'Peralada / Garriguella area',
    type: 'wine',
    interests: ['wine', 'vineyards'],
    tags: ['wine', 'vineyards'],
    why: 'Tastings/tours in the Empordà wine region; pair with Castell Peralada.',
    verify: true,
  },
  {
    name: 'Girona old town',
    town: 'Girona',
    type: 'town',
    interests: ['historic towns', 'culture'],
    tags: ['historic towns', 'culture'],
    why: 'Cathedral, colorful riverfront, Jewish quarter, filming locations; ~40 min.',
  },
  {
    name: 'Medieval villages: Pals, Peratallada, Monells',
    town: 'Baix Empordà',
    type: 'town',
    interests: ['historic towns'],
    tags: ['historic towns'],
    why: 'Tiny stone-built medieval villages, a short drive inland.',
  },
  {
    name: 'Cadaqués + Cap de Creus + Dalí House (Portlligat)',
    town: 'Cadaqués',
    type: 'town',
    interests: ['historic towns', 'scenery'],
    tags: ['historic towns', 'scenery'],
    why: "Whitewashed artists' village in a wild headland; the Dalí house is nearby (~1.5 h).",
  },
  {
    name: 'Museu del Suro (Cork Museum)',
    town: 'Palafrugell',
    type: 'sight',
    interests: ['culture'],
    tags: ['culture', 'museum'],
    why: 'Local cork-industry museum in town — easy rainy-hour or evening stop.',
  },
]

export const DO: SeedDo[] = RAW_DO.map((d) => ({
  ...d,
  id: slug(d.name),
  category: 'do',
}))

// ── Combined access ──────────────────────────────────────────────────────────

export const SEED_PLACES: SeedPlace[] = [...STAY, ...EAT, ...DO]

export const SEED_BY_CATEGORY: Record<'stay' | 'eat' | 'do', SeedPlace[]> = {
  stay: STAY,
  eat: EAT,
  do: DO,
}

const SEED_INDEX: Record<string, SeedPlace> = Object.fromEntries(
  SEED_PLACES.map((p) => [p.id, p]),
)

/** Look up a seed place by id. Used to guarantee we only ever render real places. */
export function getSeedPlace(id: string): SeedPlace | undefined {
  return SEED_INDEX[id]
}

export function isSeedId(id: string): boolean {
  return id in SEED_INDEX
}
