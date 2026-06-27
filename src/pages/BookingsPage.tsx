import { useMemo, useState } from 'react'
import type { BookingInfo, BookingStatus, Category } from '../types'
import { usePlanner } from '../store/planner'
import { resolvePlaceData, toCard, computeBudget } from '../lib/catalog'
import { formatUSD } from '../lib/money'

const STATUSES: BookingStatus[] = ['idea', 'to-book', 'booked']
const CATS: { c: Category; label: string }[] = [
  { c: 'stay', label: 'Lodging' },
  { c: 'eat', label: 'Dining' },
  { c: 'do', label: 'Experiences' },
]

export default function BookingsPage() {
  const saved = usePlanner((s) => s.saved)
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)
  const setBooking = usePlanner((s) => s.setBooking)
  const settings = usePlanner((s) => s.settings)
  const updateSettings = usePlanner((s) => s.updateSettings)
  const notes = usePlanner((s) => s.notes)
  const setNotes = usePlanner((s) => s.setNotes)
  const packing = usePlanner((s) => s.packing)
  const addPacking = usePlanner((s) => s.addPacking)
  const togglePacking = usePlanner((s) => s.togglePacking)
  const removePacking = usePlanner((s) => s.removePacking)

  const [newPack, setNewPack] = useState('')

  const budget = computeBudget(saved, settings.budgetTargetEUR)

  const rows = useMemo(() => {
    return Object.values(saved)
      .map((item) => {
        const data = resolvePlaceData(item.id, enrichment, discovered)
        if (!data) return null
        return { item, card: toCard(data) }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [saved, enrichment, discovered])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl">Bookings & budget</h1>
        <p className="text-ink-muted">
          Track reservations, costs and what to pack.
        </p>
      </header>

      {/* Budget */}
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg">Running budget</h2>
          <label className="flex items-center gap-2 text-sm">
            <span className="label">Target $</span>
            <input
              type="number"
              className="input w-28 py-1.5"
              value={settings.budgetTargetEUR}
              min={0}
              onChange={(e) =>
                updateSettings({ budgetTargetEUR: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
        <p className="mt-3 text-2xl font-serif text-terracotta-600">
          {formatUSD(budget.total)}{' '}
          <span className="text-base text-ink-muted">
            of {formatUSD(budget.targetEUR)}
          </span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {CATS.map(({ c, label }) => (
            <div key={c} className="rounded-xl bg-sand-50 p-3 text-center">
              <p className="font-medium text-ink">{formatUSD(budget.byCategory[c])}</p>
              <p className="label mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          {budget.remaining >= 0
            ? `${formatUSD(budget.remaining)} remaining`
            : `${formatUSD(-budget.remaining)} over target`}{' '}
          · costs come from the amounts you enter below.
        </p>
      </section>

      {/* Bookings tracker */}
      <section>
        <h2 className="mb-2 text-lg">Reservations</h2>
        {rows.length === 0 ? (
          <p className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-soft">
            Save places first — they’ll appear here to track as you book.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(({ item, card }) => (
              <BookingRow
                key={item.id}
                name={card.name}
                town={card.town}
                urgency={card.bookingUrgency}
                booking={item.booking}
                onChange={(b) => setBooking(item.id, b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="card p-5">
        <h2 className="text-lg">Notes</h2>
        <textarea
          className="input mt-2 min-h-[7rem]"
          placeholder="Dinner reservation ideas, parking tips, anniversary surprises…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      {/* Packing list */}
      <section className="card p-5">
        <h2 className="text-lg">Packing list</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const t = newPack.trim()
            if (t) {
              addPacking(t)
              setNewPack('')
            }
          }}
        >
          <input
            className="input"
            placeholder="Add an item (swimsuit, sunscreen…)"
            value={newPack}
            onChange={(e) => setNewPack(e.target.value)}
          />
          <button type="submit" className="btn-primary shrink-0">
            Add
          </button>
        </form>
        <ul className="mt-3 flex flex-col gap-1">
          {packing.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={p.packed}
                onChange={() => togglePacking(p.id)}
                id={`pack-${p.id}`}
              />
              <label
                htmlFor={`pack-${p.id}`}
                className={`flex-1 text-sm ${
                  p.packed ? 'text-ink-muted line-through' : 'text-ink'
                }`}
              >
                {p.text}
              </label>
              <button
                className="text-xs text-ink-muted hover:text-red-600"
                onClick={() => removePacking(p.id)}
                aria-label={`Remove ${p.text}`}
              >
                Remove
              </button>
            </li>
          ))}
          {packing.length === 0 && (
            <li className="text-sm text-ink-muted">Nothing packed yet.</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function BookingRow({
  name,
  town,
  urgency,
  booking,
  onChange,
}: {
  name: string
  town: string
  urgency?: string
  booking?: BookingInfo
  onChange: (b: BookingInfo) => void
}) {
  const b: BookingInfo = booking ?? { status: 'idea' }
  const patch = (p: Partial<BookingInfo>) => onChange({ ...b, ...p })
  const critical = urgency && /CRITICAL/i.test(urgency)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{name}</p>
          <p className="text-xs text-ink-muted">{town}</p>
        </div>
        {urgency && (
          <span
            className={`chip ${
              critical ? 'bg-red-100 text-red-700' : 'bg-sand-100 text-ink-soft'
            }`}
          >
            {critical ? 'waitlist now' : 'books ahead'}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="label">Status</span>
          <select
            className="input py-1.5"
            value={b.status}
            onChange={(e) => patch({ status: e.target.value as BookingStatus })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Date</span>
          <input
            type="date"
            className="input py-1.5"
            value={b.date ?? ''}
            onChange={(e) => patch({ date: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Time</span>
          <input
            type="time"
            className="input py-1.5"
            value={b.time ?? ''}
            onChange={(e) => patch({ time: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Party</span>
          <input
            type="number"
            min={1}
            className="input py-1.5"
            value={b.partySize ?? ''}
            onChange={(e) =>
              patch({ partySize: Number(e.target.value) || undefined })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Cost $</span>
          <input
            type="number"
            min={0}
            className="input py-1.5"
            value={b.costEUR ?? ''}
            onChange={(e) =>
              patch({ costEUR: Number(e.target.value) || undefined })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Confirmation #</span>
          <input
            className="input py-1.5"
            value={b.confirmation ?? ''}
            onChange={(e) => patch({ confirmation: e.target.value })}
          />
        </label>
      </div>

      <label className="mt-2 flex flex-col gap-1">
        <span className="label">Notes</span>
        <input
          className="input py-1.5"
          value={b.notes ?? ''}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </label>
    </div>
  )
}
