import { useMemo, useState } from 'react'
import type { Category, LegId } from '../types'
import { SEED_BY_CATEGORY, getSeedPlace } from '../data/seed'
import { usePlanner } from '../store/planner'
import { useEnrichment } from '../hooks/useEnrichment'
import type { SeedStay } from '../types'
import {
  mergeEnrichment,
  toCard,
  liveHotelToCard,
  type CardPlace,
} from '../lib/catalog'
import { CATEGORY_COLOR, LEG_MAP_CENTERS } from '../lib/maps'
import MapView from '../components/MapView'

const EAT_DO: Category[] = ['eat', 'do']
const LEGEND: { c: Category; label: string }[] = [
  { c: 'stay', label: 'Stay' },
  { c: 'eat', label: 'Eat' },
  { c: 'do', label: 'Do' },
]
const LEG_TABS: { id: LegId; label: string }[] = [
  { id: 'basque', label: 'Basque' },
  { id: 'balearic', label: 'Balearics' },
]

export default function MapPage() {
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const liveHotels = usePlanner((s) => s.liveHotels)
  const saved = usePlanner((s) => s.saved)
  const [savedOnly, setSavedOnly] = useState(false)
  const [leg, setLeg] = useState<LegId>('basque')

  useEnrichment([...SEED_BY_CATEGORY.eat, ...SEED_BY_CATEGORY.do])

  const cards: CardPlace[] = useMemo(() => {
    const seedCards = EAT_DO.flatMap((c) =>
      mergeEnrichment(c, enrichment)
        .filter((p) => p.leg === leg)
        .map(toCard),
    )
    const hotelCards = liveHotels
      .filter((h) => h.leg === leg)
      .map((h) => {
        const seed = getSeedPlace(h.id)
        return liveHotelToCard(
          h,
          seed && seed.category === 'stay' ? (seed as SeedStay) : undefined,
        )
      })
    const discCards = Object.values(discovered).map(toCard)
    const all = [...hotelCards, ...seedCards, ...discCards]
    return savedOnly ? all.filter((c) => saved[c.id]) : all
  }, [enrichment, discovered, liveHotels, saved, savedOnly, leg])

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl">Map</h1>
        <p className="text-ink-muted">
          Places on each leg, colored by category. (The two legs are far apart —
          pick one.)
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Trip leg"
        className="inline-flex self-start rounded-xl border border-sand-200 bg-white p-1"
      >
        {LEG_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={leg === t.id}
            onClick={() => setLeg(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              leg === t.id
                ? 'bg-sea-500 text-white'
                : 'text-ink-muted hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
          />
          Saved only
        </label>
        <div className="flex items-center gap-3">
          {LEGEND.map(({ c, label }) => (
            <span key={c} className="flex items-center gap-1.5 text-sm text-ink-soft">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOR[c] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <MapView cards={cards} center={LEG_MAP_CENTERS[leg]} height={520} />
    </div>
  )
}
