# Coding-Agent Prompt — "Costa Brava Trip Planner" Webapp

> **How to use this file:** Paste everything below the line into your Claude coding agent (Claude Code, etc.) as the build brief. It is written *to the agent*. Everything is already decided; where you (the human) might want to change something later, it's called out as a single config value. The working title is "Costa Brava Trip Planner" — rename freely.

---

## 0. Role & mission

You are an expert full-stack engineer with strong product and visual-design taste. Build a polished, responsive, installable web app that helps **one couple** plan a **6-night trip to Spain's Costa Brava (Aug 1–7)**: choosing **where to stay, where to eat, and what to do**, and assembling those choices into a **day-by-day plan** they can follow on their phones during the trip.

The app's single most important promise: **it only ever shows real, verifiable places — never invented ones.** Treat any fabricated restaurant, hotel, or address as a critical bug.

Build in the priority order in §5. Ship Tier 1 fully working before starting Tier 2. Do not half-finish many features.

---

## 1. Who it's for (the profile the whole app is built around)

- **Travelers:** a couple, 2 adults. No kids. Romantic / relaxed pace. They use the app **together on one shared device** (no logins, no multi-user sync needed).
- **When:** **August 1–7** (6 nights), peak season.
- **Where:** **Costa Brava (Empordà coast), Catalonia.** Recommended home base: **Calella de Palafrugell** (or its quieter twin **Llafranc**). Alternative bases: **Begur**, **Tamariu**.
  - Expose the base/region as config (see §9 `TRIP_CONFIG`). Everything (distances, suggestions, map center) keys off this so the trip can be relocated by editing one object.
- **Getting around:** they have a **rental car**. Score and sort every place by **drive time from the home base**.
- **Lodging:** budget **under €200/night, value-first** ("cheaper the better"). **Air conditioning is a hard requirement** — a non-negotiable filter, not a tag.
- **Dining (the heart of the trip):** **1–2 splurge / tasting-menu dinners** plus **lots of excellent local spots**.
- **Interests between meals:** wine & vineyards (DO Empordà), historic towns & culture, boats / coves / swimming.
- **Vibe:** a lively, **walkable** seaside town with real local life where **beach and restaurants are both on foot** — *not* a mass-tourism resort strip.
- **Usage pattern:** plan at home (laptop) **and** use live during the trip (phone, possibly poor signal). Must be responsive and offline-friendly.

When the app needs preferences it doesn't have (e.g., dietary restrictions), collect them in **Settings**, not as blocking prompts.

---

## 2. Core concept / mental model

Three categories — **Stay / Eat / Do** — each a feed of **real place cards**. The user moves a place through states:

`suggested → saved (shortlist) → scheduled (on a day) → booked`

The **same saved list** is viewable four ways (these are *view modes over one dataset*, not four apps): **cards**, **swipe**, **compare**, **map**. The end state is a **day-by-day itinerary (Aug 1–7)** plus a **bookings tracker** and a **running budget**.

---

## 3. How places are sourced — REAL ONLY (read carefully)

1. **Ship a curated seed dataset** (provided in §9) of real, verified Costa Brava places so the app is excellent and trustworthy on first load, fully offline. This is the backbone — do not depend on live calls to be useful.
2. **Enrich each seed place via Google Places** at runtime: fetch coordinates, a photo, rating, price level, opening hours, website, and a Google Maps URL. Cache results in local storage to avoid repeat billing.
3. **Optional live expansion** ("Find more like this" / "Suggest more"): call the Anthropic Messages API **with the `web_search` tool** to propose additional *currently-operating* places. The model must return **strict JSON** with `name + town + address + one-line reason + source URL` and nothing else.
   - **Verification gate:** before displaying any AI-suggested place, resolve it against Google Places (name + address). **If it cannot be resolved to a real Places entry, discard it silently.** Never render an unverified place.
4. **Absolute rule:** the app must never invent or guess a restaurant, hotel, address, phone number, or price. Verified-real or not shown.

---

## 4. APIs & keys (the human will provide keys; document everything)

The human has agreed to set up API keys. For each, document in the README exactly which API to enable, where to paste the key, and how to restrict it.

- **Google Maps Platform** (one key, via env var e.g. `VITE_GOOGLE_MAPS_API_KEY`):
  - *Maps JavaScript API* — the interactive map.
  - *Places API* — details, photos, ratings, hours, search/verification.
  - *Routes API* (or Distance Matrix) — **drive time from base** to each place.
- **Anthropic API** (env var e.g. `ANTHROPIC_API_KEY`) — optional, powers live suggestions only. Use the current Claude Sonnet model string. **The app must be fully functional on seed data with no Anthropic key.**

**Graceful degradation is mandatory.** If a key is missing or a call fails: hide/disable that feature with a friendly inline note (e.g., "Add a Google Maps key in Settings to see drive times"), show seed data, and **never blank-screen or crash.** Cache aggressively to control cost; note rough cost expectations in the README. Keep all keys in `.env` (provide `.env.example`) and `.gitignore` them. If hiding the Anthropic key server-side is desired, you may add a single thin serverless proxy function (Vercel/Netlify) — but keep the core app backendless.

---

## 5. Features by build priority

### Tier 1 — MVP (build first; must be rock-solid)
- **Three browse feeds (Stay / Eat / Do)** rendered as cards from the seed dataset.
- **Card content:** name, photo, 1–2 line blurb, price tier, town, **drive time from base**, tags, an external link (website / booking / Google Maps), and **flag badges** (e.g., `AC`, `walk-to-beach`, `Michelin ★`, `wine`, `cove`, `books months ahead`).
- **Save / shortlist** (heart) per category, with a saved-items view.
- **Hard + soft filtering and sort:** Stay enforces **AC required**; sort by price, drive time, rating, or "best fit." Eat filters by splurge/local, tags. Do filters by interest (wine / culture / coves).
- **Day-by-day itinerary builder** for **Aug 1–7**: assign saved items to days; per-day timeline (optionally time-ordered) with a small per-day map; show drive times between consecutive stops.
- **Local persistence** (IndexedDB via `idb`/`localForage`, fallback localStorage). Single device, no auth. Warn before any destructive reset.
- **Responsive + installable PWA + offline-friendly:** cache the app shell, the seed data, enriched results, and the user's plan so it all works on a phone with no signal.

### Tier 2 — layer on after MVP is solid
- **Global map view:** base marker + all candidates and saved places, colored by category; tap a pin → card; drive-time label from base.
- **Side-by-side compare:** select 2–3 cards → comparison table (price, drive time, rating, tags, AC, why-it-fits).
- **Swipe mode:** Tinder-style yes/no to triage a category quickly into the shortlist.
- **Bookings / reservation tracker:** status `idea → to-book → booked`; store confirmation #, date & time, party size, cost, notes; surface **"book now" urgency badges** (see seed `booking_urgency`).
- **Running budget total:** sum lodging + dinners + experiences against a target; per-category breakdown; show remaining.
- **Notes** + a simple **packing list**.

### Tier 3 — nice-to-have
- **Live "suggest more"** via Anthropic + web_search (with the §3 verification gate).
- **Weather & sunset** for the dates; reservation reminders.
- **Export / share:** print-friendly plan, and **calendar export (.ics)** of scheduled items + reservations.

---

## 6. Screens / information architecture

- **Home:** trip summary (dates, base, countdown), progress (saved & scheduled counts), budget snapshot, urgent booking reminders, quick links to Stay/Eat/Do.
- **Stay / Eat / Do** (one component, category param): the four view-mode toggles (cards / swipe / compare / map) over the same filtered list.
- **Map** (global).
- **Itinerary** (Aug 1–7 builder + per-day timeline & map).
- **Bookings** tracker.
- **Settings:** base/region (editable `TRIP_CONFIG`), budget target, dietary prefs, API-key status indicators, data export/reset.

---

## 7. Design direction — clean & minimal, warm Spanish accent

- **Minimal and intentional**, not a templated dashboard. Generous whitespace; strong type hierarchy; calm.
- **Type:** one clean humanist sans (e.g., Inter) for UI; optionally a refined serif for headers. Restrained.
- **Palette:** off-white / sand background, near-black ink text, soft neutral borders, and **one** warm accent (terracotta or a Mediterranean blue) used sparingly for actions and the active state.
- **Cards:** image-forward but uncluttered; clear price/drive-time/badges; large thumb-friendly tap targets. **Mobile-first**, comfortable one-handed.
- **Motion:** subtle and quick; no flashy gimmicks. Apply real design craft — spacing, alignment, and restraint over decoration.
- **Accessibility:** high contrast, focus states, semantic markup, works at small widths.

---

## 8. Tech stack (recommended — use unless you have a clearly better reason)

- **Vite + React + TypeScript.**
- **Tailwind CSS** for the minimal design system.
- **State:** Zustand (or React context) + persistence to **IndexedDB** (`idb`/`localForage`).
- **Maps:** `@vis.gl/react-google-maps` (or the Google Maps JS SDK).
- **PWA:** `vite-plugin-pwa` (offline caching + installable manifest).
- **Deployment:** static build deployable to **Vercel / Netlify / Cloudflare Pages** so the human gets a **URL they open anywhere**. No backend required. Provide one-command build + deploy steps.

---

## 9. Seed dataset (embed this; verify & enrich via Places at runtime)

Embed the following as a typed seed module. At runtime, resolve each entry against Google Places to attach `coordinates`, `photo`, `rating`, `priceLevel`, `hours`, `website`, `mapsUrl`, and the **drive time from base**. **Drop any entry that fails Places verification** rather than showing stale/guessed data. Expand later only via the verified live path (§3).

```json
{
  "TRIP_CONFIG": {
    "tripName": "Costa Brava — Aug 1–7",
    "startDate": "2026-08-01",
    "endDate": "2026-08-07",
    "nights": 6,
    "party": { "adults": 2, "children": 0 },
    "region": "Costa Brava (Empordà), Catalonia, Spain",
    "homeBaseOptions": ["Calella de Palafrugell", "Llafranc", "Begur", "Tamariu"],
    "homeBaseDefault": "Calella de Palafrugell",
    "hasCar": true,
    "lodgingMaxPerNightEUR": 200,
    "lodgingValueFirst": true,
    "lodgingRequiresAC": true,
    "splurgeDinnersTarget": 2,
    "interests": ["wine", "vineyards", "historic towns", "culture", "boats", "coves", "swimming"],
    "nearestAirports": ["Girona–Costa Brava (GRO, ~50 min)", "Barcelona–El Prat (BCN, ~1.5 h)"]
  },

  "stay": [
    { "name": "Hotel Mediterrani", "town": "Calella de Palafrugell", "ac": true, "priceHint": "€80–150", "walkToBeach": true, "walkToDining": true, "tags": ["sea-view", "rooftop terrace", "value", "couples"], "why": "Refurbished, sea-view rooms, AC + fans; walkable to beach and restaurants; strong value." },
    { "name": "Hotel Calella de Palafrugell", "town": "Calella de Palafrugell", "ac": true, "priceHint": "€100–160", "walkToBeach": true, "walkToDining": true, "tags": ["highly-rated", "central", "value"], "why": "Very highly rated, central, AC, walkable to everything." },
    { "name": "Hotel Sant Roc", "town": "Calella de Palafrugell", "ac": true, "priceHint": "€120–190", "walkToBeach": true, "walkToDining": true, "tags": ["sea-view", "terrace restaurant", "clifftop"], "why": "Clifftop bay views, sea-view balconies, direct path to the beach." },
    { "name": "Hotel Alga", "town": "Calella de Palafrugell", "ac": true, "priceHint": "€120–190", "walkToBeach": false, "walkToDining": true, "tags": ["gardens", "pools", "quiet"], "why": "Set in large gardens minutes from the centre; pools; calm." },
    { "name": "Hotel Llafranch", "town": "Llafranc", "ac": true, "priceHint": "€110–190", "walkToBeach": true, "walkToDining": true, "tags": ["seafront", "small", "good restaurant"], "why": "Small seafront hotel on the promenade with a well-regarded restaurant." },
    { "name": "Hotel Terramar", "town": "Llafranc", "ac": true, "priceHint": "€120–190", "walkToBeach": true, "walkToDining": true, "tags": ["seafront", "sea-view"], "why": "Seafront, modern sea-view rooms overlooking Llafranc beach." },
    { "name": "Isabella's Llafranc", "town": "Llafranc", "ac": true, "priceHint": "€180–260 (treat)", "walkToBeach": true, "walkToDining": true, "tags": ["boutique", "design", "seafront", "restaurant"], "why": "Design-forward boutique on the seafront; splurge-night option with its own restaurant." },
    { "name": "El Far Hotel", "town": "Llafranc (Sant Sebastià)", "ac": true, "priceHint": "€150–230", "walkToBeach": false, "walkToDining": false, "tags": ["clifftop", "views", "restaurant"], "why": "Romantic clifftop hideaway with panoramic views and a restaurant (needs a short drive down)." },
    { "name": "La Bionda", "town": "Begur", "ac": true, "priceHint": "€160–240", "walkToBeach": false, "walkToDining": true, "tags": ["adults-only", "boutique", "garden"], "why": "Adults-only boutique in charming hilltop Begur; coves a short drive away." }
  ],

  "eat": [
    { "name": "Casamar", "town": "Llafranc", "tier": "splurge", "michelin": 1, "priceHint": "tasting from ~€79", "walkFromBase": "Llafranc-based: walkable", "tags": ["sea-view", "modern Catalan", "DO Empordà wines"], "why": "1-star with sea views and local wines — the *walkable* splurge if you base in Llafranc.", "booking_urgency": "Reserve weeks ahead for peak August." },
    { "name": "Bo.TiC", "town": "Corçà", "tier": "splurge", "michelin": 2, "priceHint": "~€150–190", "tags": ["creative Empordà", "intimate"], "why": "2-star in an old carriage workshop; inventive takes on Empordà classics; ~30 min drive and far more attainable than El Celler.", "booking_urgency": "Book 1–2 months ahead." },
    { "name": "Castell Peralada", "town": "Peralada", "tier": "splurge", "michelin": 1, "priceHint": "wine menu ~€74+", "tags": ["castle setting", "wine estate", "pairings"], "why": "1-star in a 14th-c castle with its own vineyards — combine the splurge with wine.", "booking_urgency": "Book several weeks ahead." },
    { "name": "El Celler de Can Roca", "town": "Girona", "tier": "marquee", "michelin": 3, "priceHint": "~€195–215", "tags": ["world-famous", "tasting", "bucket-list"], "why": "One of the world's best. ~40 minutes' drive.", "booking_urgency": "CRITICAL: bookings open 11 months ahead at midnight on the 1st and sell out within hours — for these dates, join the waitlist now and don't count on it." },
    { "name": "Miramar", "town": "Llançà", "tier": "splurge", "michelin": 2, "priceHint": "~€180", "tags": ["seafront", "avant-garde seafood"], "why": "2-star seafront avant-garde cooking (~1 h north) if you want a coastal-drive splurge.", "booking_urgency": "Book 1–2 months ahead." },
    { "name": "Esperit Roca", "town": "Sant Julià de Ramis", "tier": "splurge", "michelin": 1, "priceHint": "tasting menus + à la carte", "tags": ["Roca brothers", "fortress setting"], "why": "The Roca brothers' newer, more attainable concept in a hilltop fortress near Girona.", "booking_urgency": "Easier than El Celler but still book ahead." },
    { "name": "Local seafood, Palamós", "town": "Palamós", "tier": "local", "priceHint": "€€", "tags": ["gambes de Palamós", "fishing port", "seafood"], "why": "Palamós is famous for its prawns; verify a specific harbour-front seafood spot via Places.", "verify": true },
    { "name": "Hostal Restaurant Sa Tuna", "town": "Sa Tuna (Begur)", "tier": "local", "priceHint": "€€–€€€", "tags": ["on-the-water", "cove", "seafood"], "why": "Dine right on a tiny cove — quintessential casual Costa Brava." }
  ],
  "eat_note": "Seed a handful more *local* spots in Calella de Palafrugell and Llafranc by querying Google Places for top-rated seafood/Catalan within walking distance of the base; show only verified results.",

  "do": [
    { "name": "Camí de Ronda (Calella ↔ Llafranc ↔ Tamariu)", "town": "Palafrugell coast", "type": "walk", "interests": ["coves", "scenery"], "why": "Cliffside coastal path linking the coves — walkable straight from base." },
    { "name": "Cove-hopping: Sa Tuna, Aiguablava, Sa Riera, Platja Fonda", "town": "Begur coast", "type": "beach", "interests": ["swimming", "coves"], "why": "The Costa Brava's signature small turquoise coves; short drives apart." },
    { "name": "Cap Roig Botanical Gardens", "town": "Calella de Palafrugell", "type": "sight", "interests": ["culture", "scenery"], "why": "Clifftop gardens with sea views; walkable/short drive from Calella." },
    { "name": "License-free boat rental / boat tour", "town": "Palamós or Roses", "type": "boat", "interests": ["boats", "coves"], "why": "Rent a small boat (no license) or take a tour to reach hidden coves by sea.", "verify": true },
    { "name": "Medes Islands snorkeling / diving", "town": "L'Estartit", "type": "watersport", "interests": ["swimming", "coves"], "why": "Protected marine reserve — the area's best snorkeling/diving.", "verify": true },
    { "name": "DO Empordà winery visit", "town": "Peralada / Garriguella area", "type": "wine", "interests": ["wine", "vineyards"], "why": "Tastings/tours in the Empordà wine region; pair with Castell Peralada.", "verify": true },
    { "name": "Girona old town", "town": "Girona", "type": "town", "interests": ["historic towns", "culture"], "why": "Cathedral, colorful riverfront, Jewish quarter, filming locations; ~40 min." },
    { "name": "Medieval villages: Pals, Peratallada, Monells", "town": "Baix Empordà", "type": "town", "interests": ["historic towns"], "why": "Tiny stone-built medieval villages, a short drive inland." },
    { "name": "Cadaqués + Cap de Creus + Dalí House (Portlligat)", "town": "Cadaqués", "type": "town", "interests": ["historic towns", "scenery"], "why": "Whitewashed artists' village in a wild headland; the Dalí house is nearby (~1.5 h)." },
    { "name": "Museu del Suro (Cork Museum)", "town": "Palafrugell", "type": "sight", "interests": ["culture"], "why": "Local cork-industry museum in town — easy rainy-hour or evening stop." }
  ]
}
```

---

## 10. Guardrails & quality bar

- **Never invent places.** Verified-real only (§3). This overrides everything.
- This is a **planning aid**, not professional advice; don't present prices/availability as guaranteed — link out to book.
- **Never blank-screen.** Handle every API/network failure gracefully and keep seed data usable offline.
- **Persist reliably;** confirm before any reset; offer data export.
- **Secrets:** `.env` only, `.gitignore`d, `.env.example` committed.
- **Order of work:** Tier 1 fully working and tested before Tier 2; Tier 2 before Tier 3.
- **Performance/cost:** cache Places and Routes responses; batch where possible.

---

## 11. Deliverables

1. The deployable web app (source + production build) per §8.
2. **README** covering: what it is, prerequisites, **step-by-step API-key setup** (which Google APIs to enable + how to restrict; optional Anthropic key), local run, **deploy to a URL**, and a note that **`TRIP_CONFIG` (§9) is the single place to change base/region/dates**.
3. `.env.example`.
4. The embedded seed data module (§9) as typed source.

---

## 12. "Done" checklist (self-verify before declaring complete)

- [ ] Stay/Eat/Do feeds render real seed places with photo, price, drive-time, tags, badges, and a working external link.
- [ ] Stay enforces **AC** and the **<€200** ceiling; all feeds filter & sort.
- [ ] Save → shortlist → assign to an **Aug 1–7 day** → mark **booked** all work and persist across reloads.
- [ ] Cards, swipe, compare, and map are four views of the **same** saved list.
- [ ] Map shows base + pins; itinerary shows per-day timeline + map + drive times.
- [ ] Bookings tracker + budget total + notes/packing work.
- [ ] **Urgency badges** appear (esp. El Celler de Can Roca = waitlist-now).
- [ ] Installable PWA; the plan and seed data work **offline** on a phone.
- [ ] **No invented places** anywhere; unverifiable AI suggestions are dropped.
- [ ] Missing keys degrade gracefully; nothing crashes.
- [ ] README + `.env.example` complete; `TRIP_CONFIG` documented as the one-stop relocation switch.

---

*Tone for the build: minimal, warm, trustworthy. The couple should open this and immediately feel they have a calm, real, walkable Costa Brava trip taking shape — and know exactly what to book first.*
