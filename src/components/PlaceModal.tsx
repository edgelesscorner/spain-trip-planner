import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CardPlace } from '../lib/catalog'
import { usePlanner } from '../store/planner'
import { mapsSearchUrl, augustRatesUrl } from '../lib/links'
import PhotoCarousel from './PhotoCarousel'
import PlaceMap from './PlaceMap'
import { BadgeRow } from './Badge'
import SaveButton from './SaveButton'
import { CarIcon, StarIcon, ExternalIcon, TikTokIcon } from './icons'

/** Detail popup for a place: photos, full info, and a map of its location. */
export default function PlaceModal({
  card,
  onClose,
}: {
  card: CardPlace
  onClose: () => void
}) {
  const base = usePlanner((s) => s.settings.homeBase)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const mapsUrl = card.externalUrl ?? mapsSearchUrl(card.name, card.town)
  const rating = card.enrichment?.rating
  const hours = card.enrichment?.hours
  const coords = card.enrichment?.coordinates
  const fromTikTok = card.tags?.some((t) => /tiktok/i.test(t)) ?? false

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 bg-sand-100">
          <PhotoCarousel
            photos={card.photos}
            name={card.name}
            category={card.category}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg text-ink shadow"
          >
            ✕
          </button>
          {fromTikTok && (
            <span
              className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur"
              title="Popular on TikTok"
            >
              <TikTokIcon width={14} height={14} /> TikTok
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl leading-tight">{card.name}</h2>
              <p className="text-sm text-ink-muted">{card.town}</p>
            </div>
            <SaveButton id={card.id} category={card.category} />
          </div>

          <BadgeRow badges={card.badges} />

          {card.liveNightlyUSD != null ? (
            <p className="rounded-lg bg-terracotta-50 px-2.5 py-1.5 text-sm font-semibold text-terracotta-700">
              Aug dates: ${card.liveNightlyUSD}/night{' '}
              <span className="font-normal text-terracotta-600">· live on Google</span>
            </p>
          ) : (
            card.priceHint && (
              <p className="text-sm font-medium text-ink-soft">{card.priceHint}</p>
            )
          )}

          <p className="text-sm leading-relaxed text-ink-soft">{card.why}</p>

          {card.bookingUrgency && (
            <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
              {card.bookingUrgency}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
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
            {card.enrichment?.driveMinutes != null && (
              <span className="inline-flex items-center gap-1 text-ink-soft">
                <CarIcon /> {card.enrichment.driveMinutes} min from {base}
              </span>
            )}
          </div>

          {hours && hours.length > 0 && (
            <div className="text-xs text-ink-muted">
              <p className="label mb-1">Opening hours</p>
              {hours.map((h, i) => (
                <p key={i}>{h}</p>
              ))}
            </div>
          )}

          {card.tags.length > 0 && (
            <p className="text-xs text-ink-muted">{card.tags.join(' · ')}</p>
          )}

          <PlaceMap
            coords={coords}
            name={card.name}
            category={card.category}
            mapsUrl={mapsUrl}
          />

          <div className="flex flex-col gap-2">
            {card.category === 'stay' && (
              <a
                href={augustRatesUrl(card.name, card.town)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full"
              >
                Check Aug rates ↗
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline w-full"
            >
              <ExternalIcon />
              {card.externalUrl ? 'Open website / map' : 'Find on Google Maps'}
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
