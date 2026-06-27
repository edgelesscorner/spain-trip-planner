import { useState } from 'react'
import type { CardPlace } from '../lib/catalog'
import { getSeedPlace } from '../data/seed'

function acValue(c: CardPlace): string {
  const seed = getSeedPlace(c.id)
  if (seed && seed.category === 'stay') return seed.ac ? 'Yes' : 'No'
  return '—'
}

export default function CompareTable({ cards }: { cards: CardPlace[] }) {
  const [selected, setSelected] = useState<string[]>(() =>
    cards.slice(0, 2).map((c) => c.id),
  )

  function toggle(id: string) {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id)
      if (cur.length >= 3) return cur
      return [...cur, id]
    })
  }

  const chosen = selected
    .map((id) => cards.find((c) => c.id === id))
    .filter((c): c is CardPlace => Boolean(c))

  const rows: { label: string; get: (c: CardPlace) => string }[] = [
    { label: 'Town', get: (c) => c.town },
    { label: 'Price', get: (c) => c.priceHint ?? '—' },
    {
      label: 'Drive time',
      get: (c) =>
        c.enrichment?.driveMinutes != null
          ? `${c.enrichment.driveMinutes} min`
          : '—',
    },
    {
      label: 'Rating',
      get: (c) =>
        c.enrichment?.rating != null ? c.enrichment.rating.toFixed(1) : '—',
    },
    { label: 'AC', get: acValue },
    { label: 'Tags', get: (c) => c.tags.join(', ') },
    { label: 'Why it fits', get: (c) => c.why },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label mb-2">Pick 2–3 to compare</p>
        <div className="flex flex-wrap gap-2">
          {cards.map((c) => {
            const active = selected.includes(c.id)
            const disabled = !active && selected.length >= 3
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                disabled={disabled}
                className={`chip border ${
                  active
                    ? 'border-terracotta-300 bg-terracotta-50 text-terracotta-700'
                    : 'border-sand-200 bg-white text-ink-muted hover:bg-sand-100 disabled:opacity-40'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {chosen.length < 2 ? (
        <p className="text-ink-muted">Select at least two places to compare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-28 p-2 text-left align-bottom"></th>
                {chosen.map((c) => (
                  <th
                    key={c.id}
                    className="p-2 text-left align-bottom font-serif text-base"
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-sand-200 align-top">
                  <th className="p-2 text-left label">{r.label}</th>
                  {chosen.map((c) => (
                    <td key={c.id} className="p-2 text-ink-soft">
                      {r.get(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
