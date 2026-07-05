import { useEffect, useRef, useState } from 'react'
import type { CardPlace } from '../lib/catalog'
import { usePlanner } from '../store/planner'
import PlaceCard from './PlaceCard'
import { HeartIcon } from './icons'

// Horizontal distance (px) past which a release commits the swipe.
const THRESHOLD = 90

export default function SwipeDeck({ cards }: { cards: CardPlace[] }) {
  const [i, setI] = useState(0)
  const saved = usePlanner((s) => s.saved)
  const toggleSave = usePlanner((s) => s.toggleSave)

  const [dx, setDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [leaving, setLeaving] = useState<null | 'left' | 'right'>(null)

  const startX = useRef(0)
  const startY = useRef(0)
  const activeRef = useRef(false) // pointer is down, direction undecided/underway
  const movedRef = useRef(false) // a horizontal drag has engaged
  const dxRef = useRef(0)
  const suppressClick = useRef(false) // swallow the click that follows a drag

  useEffect(() => {
    if (i > cards.length) setI(0)
  }, [cards.length, i])

  const card = i < cards.length ? cards[i] : null

  function advance(dir: 'left' | 'right') {
    if (!card) return
    if (dir === 'right' && !saved[card.id]) toggleSave(card.id, card.category)
    setI((n) => n + 1)
  }

  function fling(dir: 'left' | 'right') {
    if (leaving || !card) return
    setIsDragging(false)
    setLeaving(dir)
    window.setTimeout(() => {
      advance(dir)
      dxRef.current = 0
      setDx(0)
      setLeaving(null)
    }, 260)
  }

  // Arrow keys as a desktop convenience: → keep, ← skip.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (leaving || !card) return
      if (e.key === 'ArrowRight') fling('right')
      else if (e.key === 'ArrowLeft') fling('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, card, saved])

  function onPointerDown(e: React.PointerEvent) {
    if (leaving) return
    activeRef.current = true
    movedRef.current = false
    startX.current = e.clientX
    startY.current = e.clientY
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!activeRef.current) return
    const nx = e.clientX - startX.current
    const ny = e.clientY - startY.current
    if (!movedRef.current) {
      // Let vertical gestures scroll the page; only engage on horizontal intent.
      if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > 8) {
        activeRef.current = false
        return
      }
      if (Math.abs(nx) > 6) {
        movedRef.current = true
        setIsDragging(true)
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      } else {
        return
      }
    }
    dxRef.current = nx
    setDx(nx)
  }

  function endDrag() {
    if (!activeRef.current) return
    activeRef.current = false
    if (!movedRef.current) return
    suppressClick.current = true
    setIsDragging(false)
    const nx = dxRef.current
    if (nx > THRESHOLD) fling('right')
    else if (nx < -THRESHOLD) fling('left')
    else {
      dxRef.current = 0
      setDx(0) // snap back
    }
  }

  function onPointerCancel() {
    activeRef.current = false
    movedRef.current = false
    setIsDragging(false)
    dxRef.current = 0
    setDx(0)
  }

  function onClickCapture(e: React.MouseEvent) {
    if (suppressClick.current) {
      e.stopPropagation()
      e.preventDefault()
      suppressClick.current = false
    }
  }

  if (cards.length === 0) {
    return <p className="text-ink-muted">No places to triage.</p>
  }

  if (!card) {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg">You’ve been through them all. 🎉</p>
        <button className="btn-outline mt-4" onClick={() => setI(0)}>
          Start over
        </button>
      </div>
    )
  }

  const x = leaving === 'right' ? 1000 : leaving === 'left' ? -1000 : dx
  const rot = Math.max(-14, Math.min(14, x * 0.05))
  const active = isDragging || leaving !== null || x !== 0
  const keepOpacity = Math.max(0, Math.min(1, dx / THRESHOLD))
  const skipOpacity = Math.max(0, Math.min(1, -dx / THRESHOLD))

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-ink-muted">
        {i + 1} of {cards.length}
      </p>

      <div
        className="relative w-full max-w-md touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        <div
          key={card.id}
          style={{
            // Only apply a transform while moving so a fixed-position ancestor
            // isn't created at rest (the detail modal is portaled regardless).
            transform: active
              ? `translateX(${x}px) rotate(${rot}deg)`
              : undefined,
            transition: isDragging ? 'none' : 'transform 0.26s ease-out',
          }}
        >
          <PlaceCard card={card} />
        </div>

        {/* Drag affordances that fade in with the gesture. */}
        <span
          className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-lg border-[3px] border-sea-500 px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-sea-500"
          style={{ opacity: keepOpacity }}
        >
          Keep ♥
        </span>
        <span
          className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-lg border-[3px] border-ink-muted px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-ink-muted"
          style={{ opacity: skipOpacity }}
        >
          Skip
        </span>
      </div>

      <div className="flex w-full max-w-md gap-3">
        <button className="btn-outline flex-1" onClick={() => fling('left')}>
          Skip
        </button>
        <button className="btn-primary flex-1" onClick={() => fling('right')}>
          <HeartIcon filled width={16} height={16} /> Keep
        </button>
      </div>
      <p className="text-xs text-ink-muted">
        Swipe or drag the card — right to keep, left to skip.
      </p>
    </div>
  )
}
