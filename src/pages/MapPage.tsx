import { useMemo, useState } from 'react'
import type { Category } from '../types'
import { SEED_BY_CATEGORY } from '../data/seed'
import { usePlanner } from '../store/planner'
import { useEnrichment } from '../hooks/useEnrichment'
import { mergeEnrichment, toCard, type CardPlace } from '../lib/catalog'
import { CATEGORY_COLOR } from '../lib/maps'
import MapView from '../components/MapView'

const ALL: Category[] = ['stay', 'eat', 'do']
const LEGEND: { c: Category; label: string }[] = [
  { c: 'stay', label: 'Stay' },
  { c: 'eat', label: 'Eat' },
  { c: 'do', label: 'Do' },
]

export default function MapPage() {
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const saved = usePlanner((s) => s.saved)
  const [savedOnly, setSavedOnly] = useState(false)

  useEnrichment([...SEED_BY_CATEGORY.stay, ...SEED_BY_CATEGORY.eat, ...SEED_BY_CATEGORY.do])

  const cards: CardPlace[] = useMemo(() => {
    const seedCards = ALL.flatMap((c) =>
      mergeEnrichment(c, enrichment).map(toCard),
    )
    const discCards = Object.values(discovered).map(toCard)
    const all = [...seedCards, ...discCards]
    return savedOnly ? all.filter((c) => saved[c.id]) : all
  }, [enrichment, discovered, saved, savedOnly])

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl">Map</h1>
        <p className="text-ink-muted">
          Your home base and every place, colored by category.
        </p>
      </header>

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
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            <span className="inline-block h-3 w-3 rounded-full bg-ink" />
            Base
          </span>
        </div>
      </div>

      <MapView cards={cards} height={520} />
    </div>
  )
}
