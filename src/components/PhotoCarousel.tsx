import { useRef, useState } from 'react'
import type { Category } from '../types'

const CATEGORY_GLYPH: Record<Category, string> = {
  stay: '🏨',
  eat: '🍷',
  do: '⛵',
}

// Smoothly graded Mediterranean gradients per category for the placeholder.
const CATEGORY_GRADIENT: Record<Category, string> = {
  stay: 'linear-gradient(135deg, #f3d8c9 0%, #e9ded0 45%, #cfe1e4 100%)',
  eat: 'linear-gradient(135deg, #f3d8c9 0%, #ead7c4 50%, #d6a07e 100%)',
  do: 'linear-gradient(135deg, #cfe1e4 0%, #bcd6dc 45%, #7fb0b9 100%)',
}

function Placeholder({ category }: { category: Category }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: CATEGORY_GRADIENT[category] }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 85% at 28% 18%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="relative flex flex-col items-center gap-2">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/70 text-2xl shadow-sm backdrop-blur-sm">
          <span aria-hidden>{CATEGORY_GLYPH[category]}</span>
        </span>
        <span className="text-[0.65rem] font-medium text-ink-soft">
          photo with Maps key
        </span>
      </div>
    </div>
  )
}

/** Swipeable photo carousel with dot indicators; degrades to the placeholder. */
export default function PhotoCarousel({
  photos,
  name,
  category,
}: {
  photos: string[]
  name: string
  category: Category
}) {
  const [failed, setFailed] = useState<Set<number>>(() => new Set())
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  const visible = photos
    .map((src, i) => ({ src, i }))
    .filter((p) => !failed.has(p.i))

  if (visible.length === 0) return <Placeholder category={category} />

  function onScroll() {
    const el = scroller.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {visible.map(({ src, i }) => (
          <img
            key={i}
            src={src}
            alt={`${name} photo ${i + 1}`}
            loading="lazy"
            draggable={false}
            onError={() =>
              setFailed((prev) => {
                const next = new Set(prev)
                next.add(i)
                return next
              })
            }
            className="h-full w-full flex-none snap-center object-cover"
          />
        ))}
      </div>
      {visible.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
          {visible.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full shadow transition-all ${
                i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
