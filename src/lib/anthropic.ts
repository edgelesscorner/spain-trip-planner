// ─────────────────────────────────────────────────────────────────────────────
// Tier-3 "Suggest more places" via the Anthropic Messages API + web_search.
//
// The model proposes additional CURRENTLY-OPERATING places as strict JSON. Every
// suggestion is then re-verified against Google Places before it is ever shown
// (see lib/verify). Unverifiable suggestions are discarded silently.
//
// Raw HTTP fetch is used (browser context). Requires VITE_ANTHROPIC_API_KEY; the
// whole feature is hidden when the key is absent (see lib/env).
// ─────────────────────────────────────────────────────────────────────────────

import { ENV } from './env'
import { TRIP_CONFIG } from '../data/seed'
import type { Category } from '../types'

const MESSAGES_URL = 'https://api.anthropic.com/v1/messages'

export interface AISuggestion {
  name: string
  town: string
  address: string
  reason: string
  sourceUrl: string
}

const CATEGORY_NOUN: Record<Category, string> = {
  stay: 'places to stay (small hotels / guesthouses)',
  eat: 'restaurants',
  do: 'things to do / sights / activities',
}

function buildPrompt(category: Category, existingNames: string[]): string {
  return [
    `Suggest up to 5 additional, currently-operating, real ${CATEGORY_NOUN[category]} in or near ${TRIP_CONFIG.region}, suitable for a couple on a relaxed romantic trip based in ${TRIP_CONFIG.homeBaseDefault}.`,
    `Use web search to confirm each place currently exists and is operating.`,
    `Do NOT suggest any of these (already in the list): ${existingNames.join(', ') || '(none)'}.`,
    `Return ONLY a JSON array (no prose, no markdown fences) where each element is:`,
    `{"name": string, "town": string, "address": string, "reason": string (one line), "sourceUrl": string}.`,
    `If you are unsure a place is real and currently operating, omit it. Never invent a place, address, or URL.`,
  ].join('\n')
}

/** Extract the first JSON array found in a string, tolerating prose/fences. */
function extractJsonArray(text: string): unknown {
  const fenced = text.replace(/```json|```/g, '')
  const start = fenced.indexOf('[')
  const end = fenced.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(fenced.slice(start, end + 1))
  } catch {
    return null
  }
}

function coerceSuggestions(parsed: unknown): AISuggestion[] {
  if (!Array.isArray(parsed)) return []
  const out: AISuggestion[] = []
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    if (typeof o.name === 'string' && typeof o.town === 'string') {
      out.push({
        name: o.name,
        town: o.town,
        address: typeof o.address === 'string' ? o.address : '',
        reason: typeof o.reason === 'string' ? o.reason : '',
        sourceUrl: typeof o.sourceUrl === 'string' ? o.sourceUrl : '',
      })
    }
  }
  return out
}

/**
 * Ask Claude (with web_search) for more real places. Returns raw, UNVERIFIED
 * suggestions — callers MUST pass these through the Places verification gate
 * before display. Returns [] on any failure (graceful degradation).
 */
export async function fetchAISuggestions(
  category: Category,
  existingNames: string[],
): Promise<AISuggestion[]> {
  if (!ENV.hasAnthropic) return []
  try {
    const res = await fetch(MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ENV.anthropicKey,
        'anthropic-version': '2023-06-01',
        // Required to call the Messages API directly from a browser.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ENV.anthropicModel || 'claude-sonnet-4-6',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
        messages: [
          { role: 'user', content: buildPrompt(category, existingNames) },
        ],
      }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[]
    }
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('\n')
    return coerceSuggestions(extractJsonArray(text))
  } catch {
    return []
  }
}
