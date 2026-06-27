# Costa Brava Trip Planner

A polished, installable web app that helps **one couple** plan a 6-night trip to
Spain's **Costa Brava (Empordà coast)** — choosing where to **stay**, where to
**eat**, and **what to do**, and assembling those into a day-by-day plan they can
follow on their phones during the trip.

> **The single most important promise:** the app only ever shows **real,
> verifiable places — never invented ones.** It ships with a curated, verified
> seed dataset and enriches/expands it only through Google Places verification.

---

## What it does

- **Stay / Eat / Do** feeds of real place cards (photo, price, drive time, tags,
  flag badges, external link).
- **Four views over the same list:** cards, swipe (triage), compare (2–3
  side-by-side), and map.
- **Hard + soft filters:** Stay always enforces **air conditioning** and a
  **nightly price ceiling**; everything sorts by best-fit / price / drive / rating.
- **Day-by-day itinerary** for **Aug 1–7** with a per-day timeline, per-day map,
  and drive times.
- **Bookings tracker**, **running budget**, **notes**, and a **packing list**.
- **Urgency badges** that tell you what to book first (e.g. *El Celler de Can
  Roca = waitlist now*).
- **Installable PWA** — works offline on a phone with the seed data and your plan.
- **Optional live "suggest more"** via Claude + web search, with every
  suggestion re-verified against Google Places before it is ever shown.

Everything works **with no API keys at all** on the curated seed data. Keys only
add live photos, ratings, drive times, the interactive map, and live suggestions.

---

## Tech stack

Vite + React + TypeScript · Tailwind CSS · Zustand (persisted to IndexedDB via
localForage) · `@vis.gl/react-google-maps` · `vite-plugin-pwa`. No backend
required.

---

## Prerequisites

- **Node 18+** (built/tested on Node 24).
- Optional: a Google Maps Platform key and/or an Anthropic API key (see below).

---

## Quick start

```bash
npm install
cp .env.example .env      # optional — fill in keys to enable live features
npm run dev               # http://localhost:5173
```

Build and preview the production bundle (this is also what gets deployed):

```bash
npm run build             # type-checks, then builds to dist/ (+ service worker)
npm run preview           # serves the production build locally
```

Other scripts: `npm run typecheck`, `npm test`, `npm run gen:icons`.

---

## API keys (optional, but recommended)

All keys live in **`.env`** (already gitignored). Copy `.env.example` to `.env`
and fill in what you have. **Missing keys degrade gracefully** — the app shows
seed data with a friendly inline note and never blank-screens.

### 1. Google Maps Platform — `VITE_GOOGLE_MAPS_API_KEY`

One key powers three APIs. In the [Google Cloud Console](https://console.cloud.google.com/):

1. Create / select a project, open **APIs & Services → Library**, and **enable**:
   - **Maps JavaScript API** — the interactive map.
   - **Places API (New)** — photos, ratings, opening hours, website,
     and the *verification* of every place.
   - **Routes API** — drive time from your home base to each place.
2. **APIs & Services → Credentials → Create credentials → API key.**
3. **Restrict the key** (important to control cost/abuse):
   - *Application restrictions* → **HTTP referrers**, and add your deploy domain
     (e.g. `https://your-app.vercel.app/*`) plus `http://localhost:5173/*` for
     local dev.
   - *API restrictions* → restrict to the three APIs above.
4. Paste it into `.env` as `VITE_GOOGLE_MAPS_API_KEY=...` and rebuild.

**Rough cost:** Google Maps Platform includes a generous monthly free tier. This
app caches every Places/Routes response in your browser (IndexedDB) so each place
is fetched at most once per ~2 weeks — a single couple's planning use comfortably
stays within the free tier in practice. Always set a budget/quota cap in the
console to be safe.

### 2. Anthropic API — `VITE_ANTHROPIC_API_KEY` (optional)

Powers only the Tier-3 **"Suggest more places"** feature (Claude + web search).
Get a key at [console.anthropic.com](https://console.anthropic.com/). The model
defaults to `claude-sonnet-4-6` (override with `VITE_ANTHROPIC_MODEL`).

Every AI suggestion is re-verified against Google Places before display, so this
feature needs **both** a Maps key and an Anthropic key to do anything; without
them the button is hidden.

> **Security note:** a `VITE_`-prefixed key is bundled into the client and is
> visible to anyone using the app. For a shared private device that's acceptable.
> To hide the Anthropic key, deploy a thin serverless proxy (Vercel/Netlify
> function) that injects the key server-side and point the app at it — the core
> app stays backendless.

---

## Deploy to a URL

The build is fully static (`dist/`). Any static host works:

**Vercel**

```bash
npm i -g vercel
vercel            # follow prompts; build command "npm run build", output "dist"
```

**Netlify**

```bash
npm i -g netlify-cli
netlify deploy --build --prod   # build "npm run build", publish "dist"
```

**Cloudflare Pages** — connect the repo, build command `npm run build`, output
directory `dist`.

Add your API keys as **environment variables** in the host's dashboard (same
names as in `.env`) so the production build picks them up, and add the deploy
domain to your Google key's HTTP-referrer restriction.

---

## Relocating the trip — one switch

Everything (dates, base, region, map center, suggestions, distances) keys off a
single object: **`TRIP_CONFIG`** in
[`src/data/seed.ts`](src/data/seed.ts). Change the base, region, or dates there
and the whole app follows. The curated seed places live in the same file.

---

## Currency & live hotel rates

Prices are **displayed in USD**. The seed keeps the originally-researched **euro**
figures as the canonical source of truth (we never invent prices); the app
converts them to approximate USD at display time using a single constant,
`EUR_TO_USD` in [`src/lib/money.ts`](src/lib/money.ts) — change that one value to
re-rate everything.

The euro figures on Stay cards are **typical** nightly rates, **not** an
August-specific quote. Google Places does not return date-specific nightly hotel
prices, so each Stay card has a **"Check Aug 1–7 rates ↗"** button that opens a
booking search prefilled with the trip's exact dates and party size — that's
where you get the genuine live price. When a Maps key is set, the card also shows
Google's own price range when available. Converted amounts are approximate; always
confirm by booking directly.

## Photos

Card thumbnails are the **real photos of the actual place**, fetched from the
**Google Places** photo endpoint and cached for offline use. They require the
`VITE_GOOGLE_MAPS_API_KEY` (see below) — until a key is set, a tasteful
placeholder is shown rather than a misleading stock image of some other place. A
photo that fails to load also falls back to the placeholder.

## How "real places only" is guaranteed

1. **Seed dataset** — every place ships pre-verified and real (see `TRIP_CONFIG`
   + `STAY` / `EAT` / `DO` in `src/data/seed.ts`).
2. **Enrichment** — seed places are resolved against Google Places at runtime for
   coordinates, photo, rating, hours, website, map URL, and drive time. Failures
   degrade to the seed data; nothing is fabricated.
3. **Verification gate** — AI "suggest more" results are passed through
   `src/lib/verify.ts`, which resolves each against Google Places. **Anything
   that can't be resolved to a real Places record is dropped silently.** The UI
   only ever renders a place that exists in the seed module or has passed this
   gate.

---

## Project layout

```
src/
  data/seed.ts        TRIP_CONFIG + curated, real seed places (the one-stop switch)
  types.ts            domain types
  lib/                env, storage, places, routes, enrich, anthropic, verify,
                      filters, catalog (badges + budget), dates, ics, maps
  store/planner.ts    Zustand store, persisted to IndexedDB (offline-friendly)
  hooks/              lazy enrichment hook
  components/         cards, badges, filters, view modes, map, nav, icons
  pages/              Home, Category (Stay/Eat/Do), Map, Itinerary, Bookings, Settings
scripts/gen-icons.mjs generates the PWA PNG icons
```

---

## Tests

```bash
npm test
```

Covers the AC + price-ceiling enforcement and sorting, the save → schedule →
book lifecycle and its **persistence across reloads**, the real-only
verification gate, and that the Stay/Eat/Do feeds render the real seed places
with their badges.

---

*This is a planning aid, not professional advice — prices and availability aren't
guaranteed; always confirm by booking directly via each place's link.*
