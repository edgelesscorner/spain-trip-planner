// ─────────────────────────────────────────────────────────────────────────────
// Cross-device sync for the shared trip. Pulls the shared plan on load + when
// the tab regains focus, and pushes (debounced) whenever the local plan changes.
// Conflict policy: last-write-wins by `syncUpdatedAt` — each device adopts the
// server doc when it's newer, so both partners converge on one shared trip.
//
// Degrades gracefully: disabled in tests and wherever /api/trip isn't reachable
// (e.g. GitHub Pages), leaving the app fully usable as device-local only.
// ─────────────────────────────────────────────────────────────────────────────
import { usePlanner } from '../store/planner'
import type { PlannerState } from '../store/planner'

interface TripDoc {
  updatedAt: number
  saved: PlannerState['saved']
  settings: PlannerState['settings'] | null
  notes: string
  packing: PlannerState['packing']
  discovered: PlannerState['discovered']
}

const RAW_PROXY = import.meta.env.VITE_PRICE_PROXY_URL
// undefined → same-origin '/api' (Vercel); a URL → that base (local proxy);
// '' → disabled (tests).
const PROXY = (RAW_PROXY ?? '').replace(/\/$/, '')
const ENABLED = RAW_PROXY !== ''

let applying = false // suppress push while adopting a server doc
let pushTimer: ReturnType<typeof setTimeout> | null = null
let started = false

function localDoc(): TripDoc {
  const s = usePlanner.getState()
  return {
    updatedAt: s.syncUpdatedAt || 0,
    saved: s.saved,
    settings: s.settings,
    notes: s.notes,
    packing: s.packing,
    discovered: s.discovered,
  }
}

function hasData(d: TripDoc): boolean {
  return (
    Object.keys(d.saved ?? {}).length > 0 ||
    (d.notes ?? '').trim() !== '' ||
    (d.packing ?? []).length > 0 ||
    Object.keys(d.discovered ?? {}).length > 0
  )
}

function adopt(doc: TripDoc): void {
  applying = true
  const cur = usePlanner.getState()
  usePlanner.setState({
    saved: doc.saved ?? {},
    settings: doc.settings ? { ...cur.settings, ...doc.settings } : cur.settings,
    notes: doc.notes ?? '',
    packing: doc.packing ?? [],
    discovered: doc.discovered ?? {},
    syncUpdatedAt: doc.updatedAt || 0,
  })
  applying = false
}

async function push(): Promise<void> {
  const doc = localDoc()
  try {
    const res = await fetch(`${PROXY}/api/trip`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip: doc }),
    })
    if (!res.ok) return
    const { trip } = (await res.json()) as { trip?: TripDoc }
    // Server had a newer doc (another device won) → adopt it.
    if (trip && (trip.updatedAt || 0) > (doc.updatedAt || 0)) adopt(trip)
  } catch {
    /* offline — will retry on next change/focus */
  }
}

async function pull(): Promise<void> {
  try {
    const res = await fetch(`${PROXY}/api/trip`)
    if (!res.ok) return
    const { trip } = (await res.json()) as { trip?: TripDoc }
    if (!trip) return
    const local = localDoc()
    if ((trip.updatedAt || 0) > local.updatedAt) {
      adopt(trip) // server newer → take it
    } else if (local.updatedAt > (trip.updatedAt || 0) || (!hasData(trip) && hasData(local))) {
      await push() // we're newer, or server is empty and we have data → seed it
    }
  } catch {
    /* offline / endpoint absent */
  }
}

function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void push()
  }, 1200)
}

/** Start syncing. Idempotent; returns a cleanup function. */
export function initTripSync(): () => void {
  if (!ENABLED || started) return () => {}
  started = true
  let cleanup = () => {}

  const begin = () => {
    void pull()
    const unsub = usePlanner.subscribe((state, prev) => {
      if (applying) return
      if (
        state.saved !== prev.saved ||
        state.settings !== prev.settings ||
        state.notes !== prev.notes ||
        state.packing !== prev.packing ||
        state.discovered !== prev.discovered
      ) {
        usePlanner.setState({ syncUpdatedAt: Date.now() })
        schedulePush()
      }
    })
    const onFocus = () => void pull()
    window.addEventListener('focus', onFocus)
    cleanup = () => {
      unsub()
      window.removeEventListener('focus', onFocus)
      if (pushTimer) clearTimeout(pushTimer)
    }
  }

  if (usePlanner.persist.hasHydrated()) begin()
  else {
    const unsubHydrate = usePlanner.persist.onFinishHydration(begin)
    cleanup = () => unsubHydrate()
  }
  return () => cleanup()
}
