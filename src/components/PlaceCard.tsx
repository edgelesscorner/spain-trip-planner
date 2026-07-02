import { useState } from 'react'
import type { CardPlace } from '../lib/catalog'
import { usePlanner } from '../store/planner'
import { mapsSearchUrl, augustRatesUrl } from '../lib/links'
import { formatGooglePriceRangeUSD } from '../lib/money'
import PhotoCarousel from './PhotoCarousel'
import PlaceModal from './PlaceModal'
import { BadgeRow } from './Badge'
import SaveButton from './SaveButton'
import { CarIcon, StarIcon, ExternalIcon, TikTokIcon } from './icons'

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

/** Stop a click on an interactive control from also opening the detail popup. */
function stop(e: React.MouseEvent) {
  e.stopPropagation()
}

export default function PlaceCard({ card }: { card: CardPlace }) {
  const [open, setOpen] = useState(false)
  const href = card.externalUrl ?? mapsSearchUrl(card.name, card.town)
  const rating = card.enrichment?.rating
  const googleRange = formatGooglePriceRangeUSD(card.enrichment?.priceRange)
  const livePriced = card.liveNightlyUSD != null
  const fromTikTok = card.tags?.some((t) => /tiktok/i.test(t)) ?? false

  return (
    <>
      <article
        className="card flex cursor-pointer flex-col transition-shadow hover:shadow-lg"
        role="button"
        tabIndex={0}
        aria-label={`More about ${card.name}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <div className="relative aspect-[16/10] w-full bg-sand-100">
          <PhotoCarousel
            photos={card.photos}
            name={card.name}
            category={card.category}
          />
          <div className="absolute right-2 top-2" onClick={stop}>
            <SaveButton id={card.id} category={card.category} />
          </div>
          {fromTikTok && (
            <span
              className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur"
              title="Popular on TikTok"
            >
              <TikTokIcon width={13} height={13} /> TikTok
            </span>
          )}
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
                title="Live Google Hotels nightly price for your trip dates (Aug 3–12), 2 adults"
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
              Live Google price · Aug 3–12, 2 adults
            </p>
          )}

          <p className="text-sm leading-relaxed text-ink-soft">{card.why}</p>

          {googleRange && !livePriced && (
            <p className="text-xs text-ink-muted">
              Google price range:{' '}
              <span className="text-ink-soft">{googleRange}</span>
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
              onClick={stop}
              className="btn-primary mt-1 w-full"
            >
              Check Aug 3–12 rates ↗
            </a>
          )}

          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
            className="btn-outline mt-1 w-full"
          >
            <ExternalIcon />
            {card.externalUrl ? 'Open website / map' : 'Find on Google Maps'}
          </a>
        </div>
      </article>

      {open && <PlaceModal card={card} onClose={() => setOpen(false)} />}
    </>
  )
}
