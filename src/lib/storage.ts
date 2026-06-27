// ─────────────────────────────────────────────────────────────────────────────
// Persistence layer. Uses IndexedDB via localForage, with an in-memory fallback
// (also used by tests) so nothing ever crashes if storage is unavailable.
//
// We expose a small async key/value `StateStorage` compatible with zustand's
// `persist` middleware, plus a separate cache for Places/Routes enrichment so we
// never re-bill for data we already have.
// ─────────────────────────────────────────────────────────────────────────────

import localforage from 'localforage'
import type { StateStorage } from 'zustand/middleware'

/** Minimal async KV interface we depend on. */
export interface AsyncKV {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

/** In-memory KV — fallback when IndexedDB/localStorage are unavailable. */
export function createMemoryKV(): AsyncKV {
  const map = new Map<string, string>()
  return {
    async getItem(key) {
      return map.has(key) ? (map.get(key) as string) : null
    },
    async setItem(key, value) {
      map.set(key, value)
    },
    async removeItem(key) {
      map.delete(key)
    },
  }
}

function createLocalForageKV(): AsyncKV {
  let store: LocalForage | null = null
  try {
    store = localforage.createInstance({
      name: 'costa-brava-planner',
      storeName: 'kv',
      description: 'Trip planner persisted state + enrichment cache',
    })
  } catch {
    store = null
  }
  const mem = createMemoryKV()
  return {
    async getItem(key) {
      if (!store) return mem.getItem(key)
      try {
        return (await store.getItem<string>(key)) ?? null
      } catch {
        return mem.getItem(key)
      }
    },
    async setItem(key, value) {
      if (!store) return mem.setItem(key, value)
      try {
        await store.setItem(key, value)
      } catch {
        await mem.setItem(key, value)
      }
    },
    async removeItem(key) {
      if (!store) return mem.removeItem(key)
      try {
        await store.removeItem(key)
      } catch {
        await mem.removeItem(key)
      }
    },
  }
}

/** Singleton KV used by the live app. */
export const appKV: AsyncKV =
  typeof indexedDB !== 'undefined' || typeof window !== 'undefined'
    ? createLocalForageKV()
    : createMemoryKV()

/** Adapt an AsyncKV to zustand's StateStorage shape. */
export function kvToStateStorage(kv: AsyncKV): StateStorage {
  return {
    getItem: (name) => kv.getItem(name),
    setItem: (name, value) => kv.setItem(name, value),
    removeItem: (name) => kv.removeItem(name),
  }
}
