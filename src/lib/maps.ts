import type { Category, LegId } from '../types'

// Approximate viewport centers per leg — only the map's camera, never a place.
export const LEG_MAP_CENTERS: Record<LegId, { lat: number; lng: number }> = {
  basque: { lat: 43.318, lng: -1.981 }, // San Sebastián
  balearic: { lat: 39.62, lng: 2.9 }, // between Mallorca & Menorca
}
export const DEFAULT_MAP_CENTER = LEG_MAP_CENTERS.basque

export const CATEGORY_COLOR: Record<Category, string> = {
  stay: '#c4633a', // terracotta
  eat: '#2f7689', // sea
  do: '#a64f2c', // deep terracotta
}

export const BASE_COLOR = '#1f1b17'

/** A colored circular pin as an inline data-URI (no Google symbol types needed). */
export function pinDataUri(color: string, ring = '#ffffff'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><circle cx="13" cy="13" r="9" fill="${color}" stroke="${ring}" stroke-width="3"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
