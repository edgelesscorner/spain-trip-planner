// ─────────────────────────────────────────────────────────────────────────────
// The REAL-ONLY verification gate (spec §3).
//
// AI suggestions are never trusted on their own. Each is resolved against Google
// Places; only suggestions that map to a real Places record are returned. Anything
// that cannot be verified is dropped silently. This is the single chokepoint that
// guarantees the app never shows an invented place from the live path.
// ─────────────────────────────────────────────────────────────────────────────

import type { Category, Enrichment } from '../types'
import { TRIP_CONFIG, slug } from '../data/seed'
import { ENV } from './env'
import { resolvePlace } from './places'
import { fetchAISuggestions, type AISuggestion } from './anthropic'
import { fetchTikTokCandidates } from './tiktok'

/** A live-discovered place that has PASSED Places verification. Safe to display. */
export interface DiscoveredPlace {
  id: string
  category: Category
  name: string
  town: string
  why: string
  tags: string[]
  sourceUrl: string
  verified: true
  enrichment: Enrichment
}

/**
 * Verify a single AI suggestion against Google Places. Returns a DiscoveredPlace
 * only if it resolves to a real Places record; otherwise null (discard).
 */
export async function verifySuggestion(
  suggestion: AISuggestion,
  category: Category,
  tags: string[] = ['suggested'],
): Promise<DiscoveredPlace | null> {
  if (!ENV.hasMaps) return null // cannot verify → cannot show
  const locationHint = suggestion.address || suggestion.town
  const enrichment = await resolvePlace(
    suggestion.name,
    locationHint,
    TRIP_CONFIG.region,
  )
  if (!enrichment || !enrichment.verified || !enrichment.placeId) return null
  return {
    id: `ai-${slug(suggestion.name)}-${slug(suggestion.town)}`,
    category,
    name: suggestion.name,
    town: suggestion.town,
    why: suggestion.reason,
    tags,
    sourceUrl: suggestion.sourceUrl,
    verified: true,
    enrichment,
  }
}

/**
 * Full Tier-3 flow: ask Claude for more places, then keep only the ones that
 * verify against Google Places. Requires BOTH an Anthropic key (to suggest) and
 * a Maps key (to verify); returns [] otherwise.
 */
export async function suggestAndVerify(
  category: Category,
  existingNames: string[],
): Promise<DiscoveredPlace[]> {
  if (!ENV.hasAnthropic || !ENV.hasMaps) return []
  const suggestions = await fetchAISuggestions(category, existingNames)
  const verified = await Promise.all(
    suggestions.map((s) => verifySuggestion(s, category)),
  )
  return verified.filter((p): p is DiscoveredPlace => p !== null)
}

/**
 * TikTok discovery flow: pull candidate places surfaced on TikTok (server-side,
 * via Apify + an LLM extractor), then keep only the ones that verify against
 * Google Places. Needs a Maps key to verify; returns [] otherwise. Candidates
 * already present (by name) are skipped so we don't re-add or re-pay to verify.
 */
export async function discoverFromTikTok(
  category: Category,
  existingNames: string[],
): Promise<DiscoveredPlace[]> {
  if (!ENV.hasMaps) return []
  const candidates = await fetchTikTokCandidates(category)
  const seen = new Set(existingNames.map((n) => n.trim().toLowerCase()))
  const fresh = candidates.filter((c) => !seen.has(c.name.trim().toLowerCase()))
  const verified = await Promise.all(
    fresh.map((c) =>
      verifySuggestion(
        {
          name: c.name,
          town: c.town,
          address: c.address,
          reason: c.reason,
          sourceUrl: c.sourceUrl,
        },
        category,
        c.type ? ['tiktok', c.type] : ['tiktok'],
      ),
    ),
  )
  return verified.filter((p): p is DiscoveredPlace => p !== null)
}
