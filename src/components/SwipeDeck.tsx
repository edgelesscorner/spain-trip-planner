import { useEffect, useState } from 'react'
import type { CardPlace } from '../lib/catalog'
import { usePlanner } from '../store/planner'
import PlaceCard from './PlaceCard'
import { HeartIcon } from './icons'

export default function SwipeDeck({ cards }: { cards: CardPlace[] }) {
  const [i, setI] = useState(0)
  const saved = usePlanner((s) => s.saved)
  const toggleSave = usePlanner((s) => s.toggleSave)

  useEffect(() => {
    if (i > cards.length) setI(0)
  }, [cards.length, i])

  if (cards.length === 0) {
    return <p className="text-ink-muted">No places to triage.</p>
  }

  if (i >= cards.length) {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg">You’ve been through them all. 🎉</p>
        <button className="btn-outline mt-4" onClick={() => setI(0)}>
          Start over
        </button>
      </div>
    )
  }

  const card = cards[i]
  const onSkip = () => setI((n) => n + 1)
  const onKeep = () => {
    if (!saved[card.id]) toggleSave(card.id, card.category)
    setI((n) => n + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-ink-muted">
        {i + 1} of {cards.length}
      </p>
      <div className="w-full max-w-md">
        <PlaceCard card={card} />
      </div>
      <div className="flex w-full max-w-md gap-3">
        <button className="btn-outline flex-1" onClick={onSkip}>
          Skip
        </button>
        <button className="btn-primary flex-1" onClick={onKeep}>
          <HeartIcon filled width={16} height={16} /> Keep
        </button>
      </div>
    </div>
  )
}
