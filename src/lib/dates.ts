// Small date helpers for the fixed Aug 3–12 itinerary. Dates are handled in UTC
// from the ISO yyyy-mm-dd strings to avoid timezone drift in day labels.

import { TRIP_CONFIG } from '../data/seed'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function toISO(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Inclusive list of ISO dates for the trip (Aug 3 … Aug 12). */
export function tripDays(
  start = TRIP_CONFIG.startDate,
  end = TRIP_CONFIG.endDate,
): string[] {
  const out: string[] = []
  const startD = parseISO(start)
  const endD = parseISO(end)
  for (let t = startD.getTime(); t <= endD.getTime(); t += 86400000) {
    out.push(toISO(new Date(t)))
  }
  return out
}

/** "Sat Aug 1" */
export function dayLabel(iso: string): string {
  const d = parseISO(iso)
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** "Saturday, Aug 1" */
export function dayLabelLong(iso: string): string {
  const d = parseISO(iso)
  return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** Whole days from `from` (default: today) until the target ISO date. */
export function countdownDays(targetIso: string, from: Date = new Date()): number {
  const today = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  )
  const target = parseISO(targetIso).getTime()
  return Math.round((target - today) / 86400000)
}
