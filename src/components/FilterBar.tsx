import type { Category, EatTier, LegId } from '../types'
import type { SortKey } from '../lib/filters'
import { SORT_LABELS, typeLabel } from '../lib/filters'
import { HeartIcon } from './icons'

export type LegFilter = LegId | 'all'

export interface FeedFilters {
  /** Which leg of the trip to show ('all' = both). */
  leg: LegFilter
  savedOnly: boolean
  sort: SortKey
  // stay
  stayKind: 'all' | 'hotel' | 'rental'
  ceilingUSD: number
  walkToBeach: boolean
  walkToDining: boolean
  // eat: tier chips
  tiers: EatTier[]
  // eat + do: venue/activity category chips
  types: string[]
}

export const NO_CEILING = 100000

export const DEFAULT_FEED_FILTERS: FeedFilters = {
  leg: 'all',
  savedOnly: false,
  sort: 'bestFit',
  stayKind: 'all',
  ceilingUSD: NO_CEILING,
  walkToBeach: false,
  walkToDining: false,
  tiers: [],
  types: [],
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`chip border transition-colors ${
        active
          ? 'border-terracotta-300 bg-terracotta-50 text-terracotta-700'
          : 'border-sand-200 bg-white text-ink-muted hover:bg-sand-100'
      }`}
    >
      {children}
    </button>
  )
}

const TIER_LABELS: Record<EatTier, string> = {
  local: 'Local',
  splurge: 'Splurge',
  marquee: 'Michelin / marquee',
}
const TIERS: EatTier[] = ['local', 'splurge', 'marquee']
const LEG_TABS: { id: LegFilter; label: string }[] = [
  { id: 'all', label: 'Both legs' },
  { id: 'basque', label: 'Basque' },
  { id: 'balearic', label: 'Balearics' },
]
const STAY_KINDS: { id: FeedFilters['stayKind']; label: string }[] = [
  { id: 'all', label: 'All stays' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'rental', label: 'Rentals' },
]
const CEILINGS_USD: { value: number; label: string }[] = [
  { value: NO_CEILING, label: 'Any price' },
  { value: 600, label: '≤ $600' },
  { value: 450, label: '≤ $450' },
  { value: 300, label: '≤ $300' },
  { value: 200, label: '≤ $200' },
]

export default function FilterBar({
  category,
  filters,
  patch,
  count,
  typeOptions,
}: {
  category: Category
  filters: FeedFilters
  patch: (p: Partial<FeedFilters>) => void
  count: number
  /** Distinct category `type` values available for this feed. */
  typeOptions: string[]
}) {
  function toggleIn<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Trip leg"
        className="inline-flex self-start rounded-xl border border-sand-200 bg-white p-1"
      >
        {LEG_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={filters.leg === t.id}
            onClick={() => patch({ leg: t.id })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filters.leg === t.id
                ? 'bg-sea-500 text-white'
                : 'text-ink-muted hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {category === 'stay' && (
        <div
          role="tablist"
          aria-label="Lodging type"
          className="inline-flex self-start rounded-xl border border-sand-200 bg-white p-1"
        >
          {STAY_KINDS.map((k) => (
            <button
              key={k.id}
              role="tab"
              aria-selected={filters.stayKind === k.id}
              onClick={() => patch({ stayKind: k.id })}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.stayKind === k.id
                  ? 'bg-terracotta-500 text-white'
                  : 'text-ink-muted hover:text-ink-soft'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Chip
          active={filters.savedOnly}
          onClick={() => patch({ savedOnly: !filters.savedOnly })}
        >
          <HeartIcon filled={filters.savedOnly} width={14} height={14} /> Saved
          only
        </Chip>

        {category === 'stay' && (
          <>
            <span className="chip bg-sea-500/10 text-sea-500" title="Air conditioning is a hard requirement">
              AC required
            </span>
            <Chip
              active={filters.walkToBeach}
              onClick={() => patch({ walkToBeach: !filters.walkToBeach })}
            >
              Walk to beach
            </Chip>
            <Chip
              active={filters.walkToDining}
              onClick={() => patch({ walkToDining: !filters.walkToDining })}
            >
              Walk to dining
            </Chip>
          </>
        )}

        {category === 'eat' &&
          TIERS.map((t) => (
            <Chip
              key={t}
              active={filters.tiers.includes(t)}
              onClick={() => patch({ tiers: toggleIn(filters.tiers, t) })}
            >
              {TIER_LABELS[t]}
            </Chip>
          ))}
      </div>

      {(category === 'eat' || category === 'do') && typeOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {typeOptions.map((t) => (
            <Chip
              key={t}
              active={filters.types.includes(t)}
              onClick={() => patch({ types: toggleIn(filters.types, t) })}
            >
              {typeLabel(t)}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="label" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            className="input w-auto py-1.5"
            value={filters.sort}
            onChange={(e) => patch({ sort: e.target.value as SortKey })}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>

          {category === 'stay' && (
            <>
              <label className="label" htmlFor="ceiling">
                Max $/night
              </label>
              <select
                id="ceiling"
                className="input w-auto py-1.5"
                value={filters.ceilingUSD}
                onChange={(e) =>
                  patch({ ceilingUSD: Number(e.target.value) })
                }
              >
                {CEILINGS_USD.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <span className="text-sm text-ink-muted">{count} places</span>
      </div>
    </div>
  )
}
