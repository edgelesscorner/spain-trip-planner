// Minimal RFC-5545 calendar export for scheduled stops + reservations.

export interface IcsEvent {
  uid: string
  title: string
  /** yyyy-mm-dd */
  date: string
  /** HH:MM (optional → all-day event) */
  time?: string
  durationMins?: number
  location?: string
  description?: string
}

function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function compactDate(iso: string): string {
  return iso.replace(/-/g, '')
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const hh = String(Math.floor((total % 1440) / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}${mm}00`
}

export function buildICS(events: IcsEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Costa Brava Trip Planner//EN',
    'CALSCALE:GREGORIAN',
  ]
  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.uid}`)
    if (e.time) {
      const start = `${compactDate(e.date)}T${e.time.replace(':', '')}00`
      const end = `${compactDate(e.date)}T${addMinutes(e.time, e.durationMins ?? 90)}`
      lines.push(`DTSTART:${start}`)
      lines.push(`DTEND:${end}`)
    } else {
      lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`)
    }
    lines.push(`SUMMARY:${esc(e.title)}`)
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
