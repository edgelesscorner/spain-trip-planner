import { Link } from 'react-router-dom'
import { TRIP_CONFIG, EAT } from '../data/seed'
import { usePlanner } from '../store/planner'
import { computeBudget } from '../lib/catalog'
import { formatUSD } from '../lib/money'
import { countdownDays, dayLabel } from '../lib/dates'
import { BedIcon, ForkIcon, CompassIcon } from '../components/icons'

export default function HomePage() {
  const saved = usePlanner((s) => s.saved)
  const target = usePlanner((s) => s.settings.budgetTargetEUR)
  const base = usePlanner((s) => s.settings.homeBase)

  const items = Object.values(saved)
  const savedCount = items.length
  const scheduledCount = items.filter(
    (i) => i.status === 'scheduled' || i.day,
  ).length
  const bookedCount = items.filter(
    (i) => i.status === 'booked' || i.booking?.status === 'booked',
  ).length

  const budget = computeBudget(saved, target)
  const days = countdownDays(TRIP_CONFIG.startDate)

  // Urgent bookings: seed dinners with a booking_urgency note.
  const urgent = EAT.filter((e) => e.bookingUrgency).sort((a, b) => {
    const ac = /CRITICAL/i.test(a.bookingUrgency ?? '') ? 0 : 1
    const bc = /CRITICAL/i.test(b.bookingUrgency ?? '') ? 0 : 1
    return ac - bc
  })

  const quick = [
    { to: '/stay', label: 'Where to stay', Icon: BedIcon },
    { to: '/eat', label: 'Where to eat', Icon: ForkIcon },
    { to: '/do', label: 'What to do', Icon: CompassIcon },
  ]

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl bg-gradient-to-br from-terracotta-50 to-sand-100 p-6">
        <p className="label text-terracotta-600">{TRIP_CONFIG.region}</p>
        <h1 className="mt-1 text-3xl">{TRIP_CONFIG.tripName}</h1>
        <p className="mt-2 text-ink-soft">
          {dayLabel(TRIP_CONFIG.startDate)} – {dayLabel(TRIP_CONFIG.endDate)} ·{' '}
          {TRIP_CONFIG.nights} nights · base in <strong>{base}</strong>
        </p>
        {days >= 0 && (
          <p className="mt-3 inline-block rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-terracotta-700">
            {days === 0 ? 'Today!' : `${days} days to go`}
          </p>
        )}
      </header>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Saved', value: savedCount },
          { label: 'Scheduled', value: scheduledCount },
          { label: 'Booked', value: bookedCount },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-3xl font-serif text-terracotta-600">{s.value}</p>
            <p className="label mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Budget</h2>
          <Link to="/bookings" className="text-sm text-terracotta-600 hover:underline">
            Details →
          </Link>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-ink-soft">
            <span>{formatUSD(budget.total)} planned</span>
            <span>target {formatUSD(budget.targetEUR)}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sand-100">
            <div
              className="h-full bg-terracotta-500"
              style={{
                width: `${Math.min(
                  100,
                  budget.targetEUR > 0
                    ? (budget.total / budget.targetEUR) * 100
                    : 0,
                )}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {budget.remaining >= 0
              ? `${formatUSD(budget.remaining)} remaining`
              : `${formatUSD(-budget.remaining)} over target`}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg">Book these first</h2>
        <div className="flex flex-col gap-2">
          {urgent.map((e) => {
            const critical = /CRITICAL/i.test(e.bookingUrgency ?? '')
            return (
              <div
                key={e.id}
                className={`rounded-xl border p-3 text-sm ${
                  critical
                    ? 'border-red-200 bg-red-50'
                    : 'border-sand-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">
                    {e.name}{' '}
                    <span className="font-normal text-ink-muted">· {e.town}</span>
                  </span>
                  {critical && (
                    <span className="chip bg-red-100 text-red-700">
                      waitlist now
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 ${critical ? 'text-red-700' : 'text-ink-soft'}`}
                >
                  {e.bookingUrgency}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg">Plan your days</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quick.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="card flex items-center gap-3 p-4 transition-colors hover:bg-sand-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-50 text-terracotta-600">
                <Icon />
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
