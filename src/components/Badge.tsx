import type { Badge as BadgeData, BadgeTone } from '../lib/catalog'

const TONE: Record<BadgeTone, string> = {
  accent: 'bg-terracotta-50 text-terracotta-700',
  sea: 'bg-sea-500/10 text-sea-500',
  urgent: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  neutral: 'bg-sand-100 text-ink-soft',
}

export function Badge({ badge }: { badge: BadgeData }) {
  return <span className={`chip ${TONE[badge.tone]}`}>{badge.label}</span>
}

export function BadgeRow({ badges }: { badges: BadgeData[] }) {
  if (!badges.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <Badge key={b.label} badge={b} />
      ))}
    </div>
  )
}
