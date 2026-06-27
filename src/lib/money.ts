// ─────────────────────────────────────────────────────────────────────────────
// Currency display. The seed keeps the originally-researched EUR figures as the
// canonical source of truth (we never invent prices). Everything is *displayed*
// in USD via a single, documented conversion rate — change EUR_TO_USD here and
// the whole app updates. Converted amounts are approximate, not live quotes.
// ─────────────────────────────────────────────────────────────────────────────

/** Approximate EUR→USD rate. Update this one constant to re-rate the whole app. */
export const EUR_TO_USD = 1.08

export function eurToUsd(eur: number): number {
  return Math.round(eur * EUR_TO_USD)
}

/** Format a USD amount like "$1,250". */
export function formatUSD(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

/** Format Google Places' price range in USD (converting from EUR when needed). */
export function formatGooglePriceRangeUSD(pr?: {
  start: number
  end: number
  currency: string
}): string | null {
  if (!pr) return null
  if (pr.currency === 'USD' || pr.currency === 'EUR') {
    const conv = (n: number) => (pr.currency === 'EUR' ? eurToUsd(n) : n)
    if (pr.start && pr.end) return `${formatUSD(conv(pr.start))}–${formatUSD(conv(pr.end))}`
    return formatUSD(conv(pr.end || pr.start))
  }
  const a = pr.start ? String(pr.start) : ''
  const b = pr.end ? String(pr.end) : ''
  return `${a}${a && b ? '–' : ''}${b} ${pr.currency}`.trim()
}

const RANGE_RE = /€\s?(\d+)\s?[–-]\s?(\d+)/g
const SINGLE_RE = /€\s?(\d+)/g

/**
 * Convert a researched price hint string (in EUR) to an approximate USD string.
 * Handles ranges ("€80–150"), single amounts ("tasting from ~€79"), trailing
 * "+", and symbol-only tiers ("€€" → "$$"). Numbers are converted at EUR_TO_USD;
 * any remaining € symbols become $.
 */
export function convertPriceHint(hint: string): string {
  if (!hint) return hint
  let out = hint.replace(
    RANGE_RE,
    (_m, a: string, b: string) => `$${eurToUsd(Number(a))}–$${eurToUsd(Number(b))}`,
  )
  out = out.replace(SINGLE_RE, (_m, a: string) => `$${eurToUsd(Number(a))}`)
  out = out.replace(/€/g, '$')
  return out
}
