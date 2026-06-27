export type ViewMode = 'cards' | 'swipe' | 'compare' | 'map'

const MODES: { id: ViewMode; label: string }[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'swipe', label: 'Swipe' },
  { id: 'compare', label: 'Compare' },
  { id: 'map', label: 'Map' },
]

export default function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (m: ViewMode) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex rounded-xl border border-sand-200 bg-white p-1"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={mode === m.id}
          onClick={() => onChange(m.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === m.id
              ? 'bg-terracotta-500 text-white'
              : 'text-ink-muted hover:text-ink-soft'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
