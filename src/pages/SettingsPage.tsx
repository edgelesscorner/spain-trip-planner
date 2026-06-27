import { TRIP_CONFIG } from '../data/seed'
import { usePlanner } from '../store/planner'
import { ENV } from '../lib/env'
import { resolvePlaceData, toCard } from '../lib/catalog'
import { buildICS, type IcsEvent } from '../lib/ics'

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function KeyStatus({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <span
        className={`chip ${
          ok ? 'bg-sea-500/10 text-sea-500' : 'bg-sand-100 text-ink-muted'
        }`}
      >
        {ok ? 'connected' : 'not set'}
      </span>
    </div>
  )
}

export default function SettingsPage() {
  const settings = usePlanner((s) => s.settings)
  const updateSettings = usePlanner((s) => s.updateSettings)
  const resetAll = usePlanner((s) => s.resetAll)
  const exportData = usePlanner((s) => s.exportData)
  const saved = usePlanner((s) => s.saved)
  const enrichment = usePlanner((s) => s.enrichment)
  const discovered = usePlanner((s) => s.discovered)

  function exportJSON() {
    download(
      'costa-brava-plan.json',
      exportData(),
      'application/json',
    )
  }

  function exportICS() {
    const events: IcsEvent[] = []
    for (const item of Object.values(saved)) {
      const data = resolvePlaceData(item.id, enrichment, discovered)
      if (!data) continue
      const card = toCard(data)
      // Scheduled stop
      if (item.day) {
        events.push({
          uid: `stop-${item.id}@costa-brava`,
          title: card.name,
          date: item.day,
          time: item.timeSlot,
          location: card.town,
          description: card.why,
        })
      }
      // Reservation (if a booking date is set)
      if (item.booking?.date) {
        events.push({
          uid: `booking-${item.id}@costa-brava`,
          title: `Reservation: ${card.name}`,
          date: item.booking.date,
          time: item.booking.time,
          location: card.town,
          description: item.booking.confirmation
            ? `Confirmation ${item.booking.confirmation}`
            : undefined,
        })
      }
    }
    if (events.length === 0) {
      alert('Nothing scheduled or booked yet to export.')
      return
    }
    download('costa-brava-plan.ics', buildICS(events), 'text/calendar')
  }

  function handleReset() {
    const ok = window.confirm(
      'Reset your plan? This clears saved places, the itinerary, bookings, notes and packing. Settings and cached data are kept. This cannot be undone — consider exporting first.',
    )
    if (ok) resetAll()
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl">Settings</h1>
        <p className="text-ink-muted">Tune the trip and manage your data.</p>
      </header>

      {/* Trip */}
      <section className="card p-5">
        <h2 className="text-lg">Trip</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Region: {TRIP_CONFIG.region}. Dates {TRIP_CONFIG.startDate} →{' '}
          {TRIP_CONFIG.endDate}. To relocate the whole trip, edit{' '}
          <code className="rounded bg-sand-100 px-1">TRIP_CONFIG</code> in{' '}
          <code className="rounded bg-sand-100 px-1">src/data/seed.ts</code>.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="label">Home base</span>
            <select
              className="input"
              value={settings.homeBase}
              onChange={(e) => updateSettings({ homeBase: e.target.value })}
            >
              {TRIP_CONFIG.homeBaseOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Budget target ($)</span>
            <input
              type="number"
              min={0}
              className="input"
              value={settings.budgetTargetEUR}
              onChange={(e) =>
                updateSettings({ budgetTargetEUR: Number(e.target.value) || 0 })
              }
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="label">Dietary preferences</span>
            <input
              className="input"
              placeholder="e.g. one vegetarian, no shellfish"
              value={settings.dietary}
              onChange={(e) => updateSettings({ dietary: e.target.value })}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Lodging filter: <strong>AC required</strong> · adjustable max nightly
          price (in USD) on the Stay screen. Prices are shown in approximate USD,
          converted from the researched euro figures.
        </p>
      </section>

      {/* API keys */}
      <section className="card p-5">
        <h2 className="text-lg">API keys</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The app is fully usable on seed data with no keys. Keys add live
          photos, ratings, drive times, the interactive map and live
          suggestions. Set them in <code className="rounded bg-sand-100 px-1">.env</code>{' '}
          (see <code className="rounded bg-sand-100 px-1">.env.example</code>) and rebuild.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <KeyStatus ok={ENV.hasMaps} label="Google Maps Platform (Maps + Places + Routes)" />
          <KeyStatus ok={ENV.hasAnthropic} label="Anthropic API (optional — live suggestions)" />
        </div>
      </section>

      {/* Data */}
      <section className="card p-5">
        <h2 className="text-lg">Your data</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Everything is stored on this device only. Export to back up or move it.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-outline" onClick={exportJSON}>
            Export plan (JSON)
          </button>
          <button className="btn-outline" onClick={exportICS}>
            Export calendar (.ics)
          </button>
          <button className="btn-outline" onClick={() => window.print()}>
            Print plan
          </button>
          <button
            className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            onClick={handleReset}
          >
            Reset plan…
          </button>
        </div>
      </section>
    </div>
  )
}
