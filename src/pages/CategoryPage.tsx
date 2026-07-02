import { useMemo, useState } from 'react'
import type { Category, SeedStay } from '../types'
import { SEED_BY_CATEGORY, getSeedPlace } from '../data/seed'
import { BAKED_TIKTOK } from '../data/bakedTikTok'
import { usePlanner } from '../store/planner'
import { useEnrichment } from '../hooks/useEnrichment'
import { useLiveHotels } from '../hooks/useHotelRates'
import {
  mergeEnrichment,
  toCard,
  liveHotelToCard,
  type CardPlace,
} from '../lib/catalog'
import { filterEats, filterDos, sortPlaces, typeLabel } from '../lib/filters'
import { suggestAndVerify, discoverFromTikTok } from '../lib/verify'
import { ENV } from '../lib/env'
import FilterBar, {
  DEFAULT_FEED_FILTERS,
  type FeedFilters,
} from '../components/FilterBar'
import ViewModeToggle, { type ViewMode } from '../components/ViewModeToggle'
import PlaceCard from '../components/PlaceCard'
import SwipeDeck from '../components/SwipeDeck'
import CompareTable from '../components/CompareTable'
import MapView from '../components/MapView'

const META: Record<Category, { title: string; subtitle: string }> = {
  stay: {
    title: 'Where to stay',
    subtitle: 'AC-confirmed hotels with live Google prices for your dates.',
  },
  eat: {
    title: 'Where to eat',
    subtitle: 'Pintxos, Michelin tables and island seafood — researched, real spots.',
  },
  do: {
    title: 'What to do',
    subtitle: 'Beaches, coves, coastal walks, wine and culture across both legs.',
  },
}

export default function CategoryPage({ category }: { category: Category }) {
  const meta = META[category]
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const saved = usePlanner((s) => s.saved)
  const addDiscovered = usePlanner((s) => s.addDiscovered)
  const liveHotels = usePlanner((s) => s.liveHotels)

  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FEED_FILTERS)
  const [mode, setMode] = useState<ViewMode>('cards')
  const [loadingMore, setLoadingMore] = useState(false)
  const [suggestNote, setSuggestNote] = useState<string | null>(null)
  const [loadingTikTok, setLoadingTikTok] = useState(false)
  const [tiktokNote, setTiktokNote] = useState<string | null>(null)

  // Lazily enrich the seed places (no-op without a Maps key).
  useEnrichment(SEED_BY_CATEGORY[category])
  // Live Google Hotels list (no-op if the price proxy isn't running).
  useLiveHotels()

  const patch = (p: Partial<FeedFilters>) =>
    setFilters((f) => ({ ...f, ...p }))

  // Distinct category types present in this feed, for the filter chips.
  const typeOptions = useMemo(() => {
    const set = new Set<string>()
    for (const p of SEED_BY_CATEGORY[category]) {
      if (p.category === 'eat' || p.category === 'do') set.add(p.type)
    }
    return Array.from(set).sort((a, b) =>
      typeLabel(a).localeCompare(typeLabel(b)),
    )
  }, [category])

  const cards: CardPlace[] = useMemo(() => {
    if (category === 'stay') {
      // Real, AC-confirmed, currently-priced hotels (curated + live Google).
      let entries = liveHotels
        .filter((h) => filters.leg === 'all' || h.leg === filters.leg)
        .filter((h) => filters.stayKind === 'all' || h.kind === filters.stayKind)
        .map((h) => {
          const seed = getSeedPlace(h.id)
          const seedStay =
            seed && seed.category === 'stay' ? (seed as SeedStay) : undefined
          return { h, seedStay }
        })
      // walk filters only apply to curated hotels (only they carry the flags)
      if (filters.walkToBeach)
        entries = entries.filter((e) => e.seedStay?.walkToBeach)
      if (filters.walkToDining)
        entries = entries.filter((e) => e.seedStay?.walkToDining)
      entries = entries.filter((e) => e.h.nightlyUSD <= filters.ceilingUSD)
      entries.sort((a, b) => {
        if (filters.sort === 'price') return a.h.nightlyUSD - b.h.nightlyUSD
        if (filters.sort === 'rating') return (b.h.rating ?? 0) - (a.h.rating ?? 0)
        return (
          (b.h.rating ?? 0) - (a.h.rating ?? 0) || a.h.nightlyUSD - b.h.nightlyUSD
        )
      })
      let stayCards = entries.map((e) => liveHotelToCard(e.h, e.seedStay))
      if (filters.savedOnly) stayCards = stayCards.filter((c) => saved[c.id])
      return stayCards
    }

    const seedPlaces = mergeEnrichment(category, enrichment).filter(
      (p) => filters.leg === 'all' || p.leg === filters.leg,
    )
    const filtered =
      category === 'eat'
        ? sortPlaces(
            filterEats(seedPlaces, { tiers: filters.tiers, types: filters.types }),
            filters.sort,
          )
        : sortPlaces(
            filterDos(seedPlaces, { types: filters.types }),
            filters.sort,
          )
    const seedCards = filtered.map(toCard)
    // Baked-in TikTok finds (pre-verified, bundled) — real, permanent, free.
    const seedNames = new Set(
      SEED_BY_CATEGORY[category].map((p) => p.name.toLowerCase()),
    )
    const bakedCards = BAKED_TIKTOK.filter((b) => b.category === category)
      .filter((b) => filters.leg === 'all' || b.leg === filters.leg)
      .filter((b) => !seedNames.has(b.name.toLowerCase())) // don't duplicate seed
      .map(toCard)
    const discCards = Object.values(discovered)
      .filter((d) => d.category === category)
      .map(toCard)
    // Dedupe by id (a live "Discover" click can re-find a baked place).
    const byId = new Map<string, CardPlace>()
    for (const c of [...seedCards, ...bakedCards, ...discCards])
      if (!byId.has(c.id)) byId.set(c.id, c)
    let all = [...byId.values()]
    if (filters.savedOnly) all = all.filter((c) => saved[c.id])
    return all
  }, [category, enrichment, discovered, saved, liveHotels, filters])

  async function handleDiscoverTikTok() {
    setLoadingTikTok(true)
    setTiktokNote(null)
    const existing = [
      ...SEED_BY_CATEGORY[category].map((p) => p.name),
      ...Object.values(discovered)
        .filter((d) => d.category === category)
        .map((d) => d.name),
    ]
    const found = await discoverFromTikTok(category, existing)
    addDiscovered(found)
    setLoadingTikTok(false)
    setTiktokNote(
      found.length
        ? `Added ${found.length} TikTok-popular place${found.length > 1 ? 's' : ''}, verified on Google.`
        : 'No new verifiable TikTok places found right now.',
    )
  }

  async function handleSuggestMore() {
    setLoadingMore(true)
    setSuggestNote(null)
    const existing = [
      ...SEED_BY_CATEGORY[category].map((p) => p.name),
      ...Object.values(discovered)
        .filter((d) => d.category === category)
        .map((d) => d.name),
    ]
    const found = await suggestAndVerify(category, existing)
    addDiscovered(found)
    setLoadingMore(false)
    setSuggestNote(
      found.length
        ? `Added ${found.length} verified place${found.length > 1 ? 's' : ''}.`
        : 'No new verifiable places found right now.',
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl">{meta.title}</h1>
        <p className="text-ink-muted">{meta.subtitle}</p>
      </header>

      {!ENV.hasMaps && (
        <p className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-soft">
          Showing curated seed places. Add a Google Maps key in{' '}
          <strong>Settings</strong> for live photos, ratings & drive times.
        </p>
      )}

      {category === 'stay' && (
        <p className="text-xs text-ink-muted">
          Every real, air-conditioned hotel with a live Google price for Aug 3–12
          (2 adults), in USD — curated picks first, then more from Google. Run{' '}
          <code className="rounded bg-sand-100 px-1">npm run proxy</code> to
          refresh.
        </p>
      )}
      {category === 'eat' && (
        <p className="text-xs text-ink-muted">
          Prices shown in approximate USD, converted from researched euro figures.
        </p>
      )}

      <div className="flex flex-col gap-4">
        <FilterBar
          category={category}
          filters={filters}
          patch={patch}
          count={cards.length}
          typeOptions={typeOptions}
        />
        <ViewModeToggle mode={mode} onChange={setMode} />
      </div>

      {category !== 'stay' && ENV.hasMaps && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={handleDiscoverTikTok}
            disabled={loadingTikTok}
          >
            {loadingTikTok ? 'Searching TikTok…' : '✨ Discover more from TikTok'}
          </button>
          {loadingTikTok && (
            <span className="text-xs text-ink-muted">
              Pulling trending posts &amp; verifying on Google — up to a minute.
            </span>
          )}
          {tiktokNote && !loadingTikTok && (
            <span className="text-xs text-ink-soft">{tiktokNote}</span>
          )}
        </div>
      )}

      {mode === 'cards' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <PlaceCard key={c.id} card={c} />
          ))}
          {cards.length === 0 && (
            <p className="text-ink-muted">
              {category === 'stay'
                ? liveHotels.length === 0
                  ? 'Fetching live hotels… make sure the price proxy is running (npm run proxy), then refresh.'
                  : 'No hotels match these filters for Aug 3–12.'
                : 'No places match these filters.'}
            </p>
          )}
        </div>
      )}
      {mode === 'swipe' && <SwipeDeck cards={cards} />}
      {mode === 'compare' && <CompareTable cards={cards} />}
      {mode === 'map' && <MapView cards={cards} />}

      {/* Tier 3: live "suggest more" — only when both keys are present. */}
      {ENV.hasAnthropic && ENV.hasMaps && (
        <div className="rounded-xl border border-dashed border-sand-200 p-4">
          <button
            className="btn-outline"
            onClick={handleSuggestMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Searching…' : 'Suggest more places'}
          </button>
          <p className="mt-2 text-xs text-ink-muted">
            Uses Claude + web search, then verifies each result against Google
            Places. Unverifiable suggestions are dropped.
          </p>
          {suggestNote && (
            <p className="mt-1 text-xs text-ink-soft">{suggestNote}</p>
          )}
        </div>
      )}
    </div>
  )
}
