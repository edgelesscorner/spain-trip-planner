import { useState } from 'react'
import type { CardPlace } from '../lib/catalog'
import { usePlanner } from '../store/planner'
import { mapsSearchUrl, augustRatesUrl } from '../lib/links'
import { formatGooglePriceRangeUSD } from '../lib/money'
import { BadgeRow } from './Badge'
import SaveButton from './SaveButton'
import { CarIcon, StarIcon, ExternalIcon } from './icons'

const CATEGORY_GLYPH: Record<string, string> = {
  stay: '🏨',
  eat: '🍷',
  do: '⛵',
}

// Smoothly graded Mediterranean gradients per category for the photo placeholder.
const CATEGORY_GRADIENT: Record<string, string> = {
  stay: 'linear-gradient(135deg, #f3d8c9 0%, #e9ded0 45%, #cfe1e4 100%)',
  eat: 'linear-gradient(135deg, #f3d8c9 0%, #ead7c4 50%, #d6a07e 100%)',
  do: 'linear-gradient(135deg, #cfe1e4 0%, #bcd6dc 45%, #7fb0b9 100%)',
}

function DriveTime({ card }: { card: CardPlace }) {
  const base = usePlanner((s) => s.settings.homeBase)
  const mins = card.enrichment?.driveMinutes
  if (mins != null) {
    return (
      <span className="inline-flex items-center gap-1 text-ink-soft">
        <CarIcon /> {mins} min from {base}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-ink-muted"
      title="Add a Google Maps key in Settings to compute drive times"
    >
      <CarIcon /> drive time · add Maps key
    </span>
  )
}

function Thumbnail({ card }: { card: CardPlace }) {
  const [failed, setFailed] = useState(false)
  const photo = card.enrichment?.photoUrl
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={`Photo of ${card.name}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    )
  }
  // Fallback only when there is no real photo (e.g. no Maps key yet) or it
  // failed to load — we never show a stock photo of a different place.
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: CATEGORY_GRADIENT[card.category] }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 85% at 28% 18%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="relative flex flex-col items-center gap-2">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/70 text-2xl shadow-sm backdrop-blur-sm">
          <span aria-hidden>{CATEGORY_GLYPH[card.category]}</span>
        </span>
        <span className="text-[0.65rem] font-medium text-ink-soft">
          photo with Maps key
        </span>
      </div>
    </div>
  )
}

export default function PlaceCard({ card }: { card: CardPlace }) {
  const href = card.externalUrl ?? mapsSearchUrl(card.name, card.town)
  const rating = card.enrichment?.rating
  const googleRange = formatGooglePriceRangeUSD(card.enrichment?.priceRange)
  const livePriced = card.liveNightlyUSD != null

  return (
    <article className="card flex flex-col">
      <div className="relative aspect-[16/10] w-full bg-sand-100">
        <Thumbnail card={card} />
        <div className="absolute right-2 top-2">
          <SaveButton id={card.id} category={card.category} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 data-testid="place-name" className="text-lg leading-tight">
              {card.name}
            </h3>
            <p className="text-sm text-ink-muted">{card.town}</p>
          </div>
          {livePriced ? (
            <span
              className="shrink-0 rounded-lg bg-terracotta-50 px-2 py-1 text-sm font-semibold text-terracotta-700"
              title="Live Google Hotels price for Aug 1–7, 2 adults"
            >
              ${card.liveNightlyUSD}/night
            </span>
          ) : (
            card.priceHint && (
              <span className="shrink-0 rounded-lg bg-sand-100 px-2 py-1 text-sm font-medium text-ink-soft">
                {card.priceHint}
              </span>
            )
          )}
        </div>

        <BadgeRow badges={card.badges} />

        {livePriced && (
          <p className="text-xs font-medium text-sea-500">
            Live Google price · Aug 1–7, 2 adults
          </p>
        )}

        <p className="text-sm leading-relaxed text-ink-soft">{card.why}</p>

        {googleRange && !livePriced && (
          <p className="text-xs text-ink-muted">
            Google price range: <span className="text-ink-soft">{googleRange}</span>
          </p>
        )}

        {card.bookingUrgency && (
          <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
            {card.bookingUrgency}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <DriveTime card={card} />
          {rating != null && (
            <span className="inline-flex items-center gap-1 text-ink-soft">
              <span className="text-terracotta-500">
                <StarIcon />
              </span>
              {rating.toFixed(1)}
              {card.enrichment?.userRatingsTotal
                ? ` (${card.enrichment.userRatingsTotal})`
                : ''}
            </span>
          )}
        </div>

        {card.category === 'stay' && (
          <a
            href={augustRatesUrl(card.name, card.town)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-1 w-full"
          >
            Check Aug 1–7 rates ↗
          </a>
        )}

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btn-outline mt-1 w-full"
        >
          <ExternalIcon />
          {card.externalUrl ? 'Open website / map' : 'Find on Google Maps'}
        </a>
      </div>
    </article>
  )
}
