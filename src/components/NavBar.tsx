import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  BedIcon,
  ForkIcon,
  CompassIcon,
  MapIcon,
  CalendarIcon,
  TagIcon,
  SettingsIcon,
} from './icons'

type NavItem = {
  to: string
  label: string
  Icon: (typeof HomeIcon)
  end?: boolean
}

const LINKS: NavItem[] = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/stay', label: 'Stay', Icon: BedIcon },
  { to: '/eat', label: 'Eat', Icon: ForkIcon },
  { to: '/do', label: 'Do', Icon: CompassIcon },
  { to: '/map', label: 'Map', Icon: MapIcon },
  { to: '/itinerary', label: 'Plan', Icon: CalendarIcon },
  { to: '/bookings', label: 'Book', Icon: TagIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function NavBar() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-sand-200 bg-sand-50/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-2 py-2 md:justify-center md:gap-2">
        {LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'text-ink-muted hover:bg-sand-100 hover:text-ink-soft',
              ].join(' ')
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
