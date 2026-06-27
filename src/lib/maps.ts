import type { Category } from '../types'

// Approximate viewport center for the default base (Calella de Palafrugell).
// This is only the map's initial camera position — never shown as a place.
export const DEFAULT_MAP_CENTER = { lat: 41.8857, lng: 3.1816 }

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
