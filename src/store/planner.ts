// ─────────────────────────────────────────────────────────────────────────────
// Central app state (Zustand) persisted to IndexedDB (via localForage) so the
// couple's plan survives reloads and works offline. The store is created via a
// factory so tests can inject an in-memory storage and prove the persist
// roundtrip without a real browser.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type {
  Category,
  Settings,
  SavedItem,
  Enrichment,
  BookingInfo,
  PackingItem,
} from '../types'
import type { DiscoveredPlace } from '../lib/verify'
import type { LiveHotel } from '../lib/rates'
import { TRIP_CONFIG } from '../data/seed'
import { appKV, kvToStateStorage } from '../lib/storage'

export const STORE_KEY = 'costa-brava-planner-state'

export const DEFAULT_SETTINGS: Settings = {
  homeBase: TRIP_CONFIG.homeBaseDefault,
  budgetTargetEUR: 4000,
  dietary: '',
  stayPriceCeilingEUR: 300,
}

export interface PlannerState {
  settings: Settings
  /** Saved/shortlisted items keyed by place id. */
  saved: Record<string, SavedItem>
  /** Cached Places/Routes enrichment keyed by place id. */
  enrichment: Record<string, Enrichment>
  /** Verified live (AI-suggested) places, kept so they survive reloads. */
  discovered: Record<string, DiscoveredPlace>
  /** Real, AC-confirmed, currently-priced hotels from Google (via the proxy). */
  liveHotels: LiveHotel[]
  hotelsFetchedAt: number
  notes: string
  packing: PackingItem[]
  _hasHydrated: boolean

  // actions
  toggleSave: (id: string, category: Category) => void
  isSaved: (id: string) => boolean
  removeSaved: (id: string) => void
  scheduleItem: (id: string, day: string, timeSlot?: string) => void
  unscheduleItem: (id: string) => void
  setItemTime: (id: string, timeSlot: string) => void
  setBooking: (id: string, booking: BookingInfo) => void
  markBooked: (id: string) => void
  setItemNotes: (id: string, notes: string) => void

  setEnrichment: (id: string, enrichment: Enrichment) => void
  addDiscovered: (places: DiscoveredPlace[]) => void
  setLiveHotels: (hotels: LiveHotel[]) => void

  setNotes: (notes: string) => void
  addPacking: (text: string) => void
  togglePacking: (id: string) => void
  removePacking: (id: string) => void

  updateSettings: (partial: Partial<Settings>) => void
  resetAll: () => void
  exportData: () => string
}

let packingCounter = 0
function packingId(): string {
  packingCounter += 1
  return `pk-${packingCounter}-${packingCounter * 7 + 3}`
}

export function createPlannerStore(storage?: StateStorage) {
  return create<PlannerState>()(
    persist(
      (set, get) => ({
        settings: { ...DEFAULT_SETTINGS },
        saved: {},
        enrichment: {},
        discovered: {},
        liveHotels: [],
        hotelsFetchedAt: 0,
        notes: '',
        packing: [],
        _hasHydrated: false,

        toggleSave: (id, category) =>
          set((state) => {
            const next = { ...state.saved }
            if (next[id]) {
              delete next[id]
            } else {
              next[id] = {
                id,
                category,
                status: 'saved',
                savedAt: nowMs(),
              }
            }
            return { saved: next }
          }),

        isSaved: (id) => Boolean(get().saved[id]),

        removeSaved: (id) =>
          set((state) => {
            const next = { ...state.saved }
            delete next[id]
            return { saved: next }
          }),

        scheduleItem: (id, day, timeSlot) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            return {
              saved: {
                ...state.saved,
                [id]: {
                  ...item,
                  status: item.status === 'booked' ? 'booked' : 'scheduled',
                  day,
                  timeSlot: timeSlot ?? item.timeSlot,
                },
              },
            }
          }),

        unscheduleItem: (id) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            const { day, timeSlot, ...rest } = item
            void day
            void timeSlot
            return {
              saved: {
                ...state.saved,
                [id]: {
                  ...rest,
                  status: item.status === 'booked' ? 'booked' : 'saved',
                },
              },
            }
          }),

        setItemTime: (id, timeSlot) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            return {
              saved: { ...state.saved, [id]: { ...item, timeSlot } },
            }
          }),

        setBooking: (id, booking) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            return {
              saved: {
                ...state.saved,
                [id]: {
                  ...item,
                  booking,
                  status:
                    booking.status === 'booked' ? 'booked' : item.status,
                },
              },
            }
          }),

        markBooked: (id) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            const booking: BookingInfo = {
              ...(item.booking ?? { status: 'idea' }),
              status: 'booked',
            }
            return {
              saved: {
                ...state.saved,
                [id]: { ...item, booking, status: 'booked' },
              },
            }
          }),

        setItemNotes: (id, notes) =>
          set((state) => {
            const item = state.saved[id]
            if (!item) return {}
            return { saved: { ...state.saved, [id]: { ...item, notes } } }
          }),

        setEnrichment: (id, enrichment) =>
          set((state) => ({
            enrichment: { ...state.enrichment, [id]: enrichment },
          })),

        addDiscovered: (places) =>
          set((state) => {
            const next = { ...state.discovered }
            for (const p of places) next[p.id] = p
            return { discovered: next }
          }),

        setLiveHotels: (hotels) =>
          set({ liveHotels: hotels, hotelsFetchedAt: nowMs() }),

        setNotes: (notes) => set({ notes }),

        addPacking: (text) =>
          set((state) => ({
            packing: [
              ...state.packing,
              { id: packingId(), text, packed: false },
            ],
          })),

        togglePacking: (id) =>
          set((state) => ({
            packing: state.packing.map((p) =>
              p.id === id ? { ...p, packed: !p.packed } : p,
            ),
          })),

        removePacking: (id) =>
          set((state) => ({
            packing: state.packing.filter((p) => p.id !== id),
          })),

        updateSettings: (partial) =>
          set((state) => ({ settings: { ...state.settings, ...partial } })),

        resetAll: () =>
          set({
            saved: {},
            notes: '',
            packing: [],
            discovered: {},
            // keep enrichment cache + settings
          }),

        exportData: () => {
          const s = get()
          return JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              tripConfig: TRIP_CONFIG,
              settings: s.settings,
              saved: s.saved,
              notes: s.notes,
              packing: s.packing,
              discovered: s.discovered,
            },
            null,
            2,
          )
        },
      }),
      {
        name: STORE_KEY,
        version: 1,
        storage: createJSONStorage(
          () => storage ?? kvToStateStorage(appKV),
        ),
        partialize: (s) => ({
          settings: s.settings,
          saved: s.saved,
          enrichment: s.enrichment,
          discovered: s.discovered,
          liveHotels: s.liveHotels,
          hotelsFetchedAt: s.hotelsFetchedAt,
          notes: s.notes,
          packing: s.packing,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) state._hasHydrated = true
        },
      },
    ),
  )
}

/** Avoid Date.now() at module top-level; called only inside actions. */
function nowMs(): number {
  return new Date().getTime()
}

/** Singleton store used by the app. */
export const usePlanner = createPlannerStore()
