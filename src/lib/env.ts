// Centralised access to optional API keys + capability flags.
// Everything here is designed so the app is fully usable with NO keys.

const mapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim()
const anthropicKey = (import.meta.env.VITE_ANTHROPIC_API_KEY ?? '').trim()
const anthropicModel = (
  import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
).trim()

export const ENV = {
  mapsKey,
  anthropicKey,
  anthropicModel,
  /** Google Maps/Places/Routes available? */
  hasMaps: mapsKey.length > 0,
  /** Anthropic "suggest more" available? */
  hasAnthropic: anthropicKey.length > 0,
}

export type Capability = 'maps' | 'anthropic'

export function isEnabled(cap: Capability): boolean {
  return cap === 'maps' ? ENV.hasMaps : ENV.hasAnthropic
}
