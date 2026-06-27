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
      className="sticky bottom-0 z-20 border-t border-sand-200 bg-sand-50/95 backdrop-blur md:bottom-auto md:top-0 md:border-b md:border-t-0"
    >
      <div className="mx-auto flex max-w-3xl items-stretch gap-1 overflow-x-auto px-2 py-1.5 md:justify-center md:gap-2">
        {LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex min-w-[3.6rem] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[0.7rem] font-medium transition-colors md:flex-row md:gap-2 md:text-sm',
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
