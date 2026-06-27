import type { Category } from '../types'
import { usePlanner } from '../store/planner'
import { HeartIcon } from './icons'

export default function SaveButton({
  id,
  category,
  size = 'md',
}: {
  id: string
  category: Category
  size?: 'sm' | 'md'
}) {
  const saved = usePlanner((s) => Boolean(s.saved[id]))
  const toggleSave = usePlanner((s) => s.toggleSave)
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}
      onClick={() => toggleSave(id, category)}
      className={`${dim} grid place-items-center rounded-full border transition-colors ${
        saved
          ? 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'
          : 'border-sand-200 bg-white text-ink-muted hover:text-terracotta-500'
      }`}
    >
      <HeartIcon filled={saved} />
    </button>
  )
}
