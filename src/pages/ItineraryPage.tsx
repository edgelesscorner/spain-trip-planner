import { useMemo } from 'react'
import { SEED_BY_CATEGORY } from '../data/seed'
import { usePlanner } from '../store/planner'
import { useEnrichment } from '../hooks/useEnrichment'
import {
  resolvePlaceData,
  toCard,
  type CardPlace,
} from '../lib/catalog'
import { tripDays, dayLabelLong } from '../lib/dates'
import MapView from '../components/MapView'
import { CarIcon } from '../components/icons'

const ALL_SEED = [
  ...SEED_BY_CATEGORY.stay,
  ...SEED_BY_CATEGORY.eat,
  ...SEED_BY_CATEGORY.do,
]

interface PlannedCard extends CardPlace {
  day?: string
  timeSlot?: string
}

export default function ItineraryPage() {
  const saved = usePlanner((s) => s.saved)
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const scheduleItem = usePlanner((s) => s.scheduleItem)
  const unscheduleItem = usePlanner((s) => s.unscheduleItem)
  const setItemTime = usePlanner((s) => s.setItemTime)

  useEnrichment(ALL_SEED)

  const days = tripDays()

  const planned: PlannedCard[] = useMemo(() => {
    return Object.values(saved)
      .map((item): PlannedCard | null => {
        const data = resolvePlaceData(item.id, enrichment, discovered)
        if (!data) return null
        return { ...toCard(data), day: item.day, timeSlot: item.timeSlot }
      })
      .filter((c): c is PlannedCard => c !== null)
  }, [saved, enrichment, discovered])

  const unscheduled = planned.filter((p) => !p.day)
  const byDay = (iso: string) =>
    planned
      .filter((p) => p.day === iso)
      .sort((a, b) => (a.timeSlot ?? '').localeCompare(b.timeSlot ?? ''))

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl">Itinerary</h1>
        <p className="text-ink-muted">
          Assign your saved places to a day (Aug 1–7).
        </p>
      </header>

      {planned.length === 0 && (
        <p className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-soft">
          Nothing saved yet — heart a few places in Stay / Eat / Do, then assign
          them to days here.
        </p>
      )}

      {unscheduled.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg">Saved, not yet scheduled</h2>
          <div className="flex flex-col gap-2">
            {unscheduled.map((c) => (
              <ItineraryRow
                key={c.id}
                card={c}
                days={days}
                onAssign={(day) => scheduleItem(c.id, day)}
                onUnassign={() => unscheduleItem(c.id)}
                onTime={(t) => setItemTime(c.id, t)}
              />
            ))}
          </div>
        </section>
      )}

      {days.map((iso) => {
        const dayCards = byDay(iso)
        return (
          <section key={iso} className="card p-4">
            <h2 className="text-lg">{dayLabelLong(iso)}</h2>
            {dayCards.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">No stops yet.</p>
            ) : (
              <>
                <ol className="mt-3 flex flex-col gap-2">
                  {dayCards.map((c, idx) => (
                    <li key={c.id}>
                      {idx > 0 && (
                        <div className="ml-3 flex items-center gap-1 py-1 text-xs text-ink-muted">
                          <CarIcon /> next stop
                        </div>
                      )}
                      <ItineraryRow
                        card={c}
                        days={days}
                        onAssign={(day) => scheduleItem(c.id, day)}
                        onUnassign={() => unscheduleItem(c.id)}
                        onTime={(t) => setItemTime(c.id, t)}
                      />
                    </li>
                  ))}
                </ol>
                <div className="mt-4">
                  <MapView cards={dayCards} height={260} />
                </div>
              </>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ItineraryRow({
  card,
  days,
  onAssign,
  onUnassign,
  onTime,
}: {
  card: PlannedCard
  days: string[]
  onAssign: (day: string) => void
  onUnassign: () => void
  onTime: (t: string) => void
}) {
  const driveMin = card.enrichment?.driveMinutes
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sand-200 bg-white p-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{card.name}</p>
        <p className="truncate text-xs text-ink-muted">
          {card.town}
          {driveMin != null ? ` · ${driveMin} min from base` : ''}
        </p>
      </div>
      <input
        type="time"
        aria-label={`Time for ${card.name}`}
        value={card.timeSlot ?? ''}
        onChange={(e) => onTime(e.target.value)}
        className="input w-28 py-1.5"
      />
      <select
        aria-label={`Assign ${card.name} to a day`}
        value={card.day ?? ''}
        onChange={(e) =>
          e.target.value ? onAssign(e.target.value) : onUnassign()
        }
        className="input w-36 py-1.5"
      >
        <option value="">Unscheduled</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {dayLabelLong(d)}
          </option>
        ))}
      </select>
    </div>
  )
}
