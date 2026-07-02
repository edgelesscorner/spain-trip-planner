// Minimal, consistent line icons (no icon dependency). 24px stroke icons.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)
export const BedIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 7v10M3 12h18v5M21 12v-1a3 3 0 0 0-3-3h-7v4" />
  </svg>
)
export const ForkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 3c-1.5 1-2 3-2 5s.5 3 2 4v9" />
  </svg>
)
export const CompassIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </svg>
)
export const MapIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
)
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </svg>
)
export const TagIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12V4h8l9 9-8 8z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
)
export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)
export const HeartIcon = (p: IconProps & { filled?: boolean }) => {
  const { filled, ...rest } = p
  return (
    <svg {...base(rest)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.5-9.2-9C1.3 7.7 3 4.5 6.2 4.5c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6.5C19 15.5 12 20 12 20Z" />
    </svg>
  )
}
export const ExternalIcon = (p: IconProps) => (
  <svg {...base(p)} width={16} height={16}>
    <path d="M14 4h6v6M20 4l-8 8M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
  </svg>
)
export const CarIcon = (p: IconProps) => (
  <svg {...base(p)} width={16} height={16}>
    <path d="M5 16 6.5 9.5A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3h-2v-1H6v1H4z" />
    <circle cx="7.5" cy="16.5" r="1" />
    <circle cx="16.5" cy="16.5" r="1" />
  </svg>
)
export const StarIcon = (p: IconProps) => (
  <svg {...base(p)} width={16} height={16} fill="currentColor" stroke="none">
    <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
  </svg>
)
// TikTok music-note glyph (filled). Marks places surfaced from TikTok.
export const TikTokIcon = (p: IconProps) => (
  <svg {...base(p)} width={16} height={16} fill="currentColor" stroke="none">
    <path d="M15.2 3c.35 2.2 1.6 3.6 3.8 3.75v2.63c-1.28.13-2.5-.19-3.62-.83v5.9c0 3.02-2.2 5.05-4.94 5.05a5.05 5.05 0 0 1-1.06-9.98v2.77a2.34 2.34 0 1 0 3 2.26V3h2.82Z" />
  </svg>
)
