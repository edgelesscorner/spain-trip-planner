import { useMemo, useState } from 'react'
import type { Category, Place } from '../types'
import { SEED_BY_CATEGORY } from '../data/seed'
import { usePlanner } from '../store/planner'
import { useEnrichment } from '../hooks/useEnrichment'
import {
  mergeEnrichment,
  toCard,
  type CardPlace,
} from '../lib/catalog'
import {
  filterStays,
  filterEats,
  filterDos,
  sortPlaces,
} from '../lib/filters'
import { suggestAndVerify } from '../lib/verify'
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
    subtitle: 'AC-only, value-first hotels walkable to the beach & dinner.',
  },
  eat: {
    title: 'Where to eat',
    subtitle: 'One or two tasting-menu splurges plus excellent local spots.',
  },
  do: {
    title: 'What to do',
    subtitle: 'Coves, wine, historic towns and boats between meals.',
  },
}

export default function CategoryPage({ category }: { category: Category }) {
  const meta = META[category]
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const saved = usePlanner((s) => s.saved)
  const addDiscovered = usePlanner((s) => s.addDiscovered)

  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FEED_FILTERS)
  const [mode, setMode] = useState<ViewMode>('cards')
  const [loadingMore, setLoadingMore] = useState(false)
  const [suggestNote, setSuggestNote] = useState<string | null>(null)

  // Lazily enrich the seed places (no-op without a Maps key).
  useEnrichment(SEED_BY_CATEGORY[category])

  const patch = (p: Partial<FeedFilters>) =>
    setFilters((f) => ({ ...f, ...p }))

  const cards: CardPlace[] = useMemo(() => {
    const seedPlaces = mergeEnrichment(category, enrichment)
    let filtered: Place[]
    if (category === 'stay') {
      filtered = filterStays(seedPlaces, {
        requireAC: true,
        ceilingUSD: filters.ceilingUSD,
        walkToBeach: filters.walkToBeach,
        walkToDining: filters.walkToDining,
        tags: [],
      })
    } else if (category === 'eat') {
      filtered = filterEats(seedPlaces, { tiers: filters.tiers, tags: [] })
    } else {
      filtered = filterDos(seedPlaces, {
        interests: filters.interests,
        types: [],
      })
    }
    filtered = sortPlaces(filtered, filters.sort)

    const seedCards = filtered.map(toCard)
    const discCards = Object.values(discovered)
      .filter((d) => d.category === category)
      .map(toCard)

    let all = [...seedCards, ...discCards]
    if (filters.savedOnly) all = all.filter((c) => saved[c.id])
    return all
  }, [category, enrichment, discovered, saved, filters])

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

      {(category === 'stay' || category === 'eat') && (
        <p className="text-xs text-ink-muted">
          Prices shown in approximate USD, converted from researched euro figures
          {category === 'stay'
            ? ' — typical nightly rates, not August-specific. Tap “Check Aug 1–7 rates” on a hotel for live prices.'
            : '.'}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <FilterBar
          category={category}
          filters={filters}
          patch={patch}
          count={cards.length}
        />
        <ViewModeToggle mode={mode} onChange={setMode} />
      </div>

      {mode === 'cards' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <PlaceCard key={c.id} card={c} />
          ))}
          {cards.length === 0 && (
            <p className="text-ink-muted">No places match these filters.</p>
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
