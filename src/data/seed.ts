// ─────────────────────────────────────────────────────────────────────────────
// Two-leg trip seed: Basque Country (Aug 3–7) + Balearic Islands (Aug 7–12).
//
// Eat/Do are REAL, currently-operating places gathered from research (Google,
// travel forums, food blogs/vlogs) — each carries its `source` URL and a filter
// category, and is still re-verified against Google Places at runtime. Stays are
// NOT seeded here: they come live from Google Hotels via the price proxy.
//
// TRIP_CONFIG is the single place to change bases/regions/dates.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TripConfig,
  SeedStay,
  SeedEat,
  SeedDo,
  SeedPlace,
  LegId,
} from '../types'

export const TRIP_CONFIG: TripConfig = {
  tripName: 'Basque + Balearics — Aug 3–12',
  startDate: '2026-08-03',
  endDate: '2026-08-12',
  nights: 9,
  party: { adults: 2, children: 0 },
  region: 'Basque Country & Balearic Islands, Spain',
  legs: [
    {
      id: 'basque',
      name: 'Basque Country',
      region: 'Basque Country, Spain',
      startDate: '2026-08-03',
      endDate: '2026-08-07',
      nights: 4,
      bases: ['San Sebastián', 'Bilbao'],
      homeBaseDefault: 'San Sebastián',
      towns: ['San Sebastián', 'Bilbao', 'Getaria'],
      travelToNext: 'Fly Bilbao/San Sebastián → Palma de Mallorca (~1h15m)',
    },
    {
      id: 'balearic',
      name: 'Balearic Islands',
      region: 'Mallorca & Menorca, Spain',
      startDate: '2026-08-07',
      endDate: '2026-08-12',
      nights: 5,
      bases: ['Palma de Mallorca', 'Ciutadella de Menorca'],
      homeBaseDefault: 'Palma de Mallorca',
      towns: [
        'Palma de Mallorca',
        'Sóller',
        'Ciutadella de Menorca',
        'Mahón',
      ],
    },
  ],
  homeBaseOptions: [
    'San Sebastián',
    'Bilbao',
    'Palma de Mallorca',
    'Ciutadella de Menorca',
  ],
  homeBaseDefault: 'San Sebastián',
  hasCar: true,
  lodgingRequiresAC: true,
  interests: [
    'food',
    'pintxos',
    'beaches',
    'coves',
    'culture',
    'wine',
    'coastal walks',
  ],
  nearestAirports: [
    'San Sebastián (EAS)',
    'Bilbao (BIO)',
    'Palma de Mallorca (PMI)',
    'Menorca–Mahón (MAH)',
  ],
}

/** Map a name to a stable, URL-safe id. */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Stays are sourced live from Google Hotels (proxy), so no curated seed here.
export const STAY: SeedStay[] = []

// ── Eat ──────────────────────────────────────────────────────────────────────

type RawEat = {
  name: string
  town: string
  leg: LegId
  tier: SeedEat['tier']
  type: string
  michelin?: number
  why: string
  source: string
}

const RAW_EAT: RawEat[] = [
  // ── Basque — San Sebastián & around ──
  { name: 'Bar Néstor', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Cult tiny bar for its once-a-day tortilla, txuleta and Gernika peppers.', source: 'https://upnorthspain.com/eat-and-drink/best-bars-in-san-sebastian/' },
  { name: 'La Viña', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Home of the original burnt Basque cheesecake.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Gandarías', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Old-town institution with a lively pintxo counter and dining room.', source: 'https://upnorthspain.com/eat-and-drink/best-bars-in-san-sebastian/' },
  { name: 'La Cuchara de San Telmo', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Queue for the melting slow-cooked suckling pig.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Ganbara', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Legendary wild-mushroom surtido crowned with an egg yolk.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Borda Berri', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Made-to-order hot pintxos; famed orzo “risotto” with Basque cheeses.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Bar Zeruko', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Theatrical modern pintxos — the self-smoking cod on dry ice is a classic.', source: 'https://www.lagastronoma.com/los-diez-mejores-pintxos-de-san-sebastian/' },
  { name: 'Bar Txepetxa', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Legendary for anchovy pintxos dressed a dozen ways.', source: 'https://www.lagastronoma.com/los-diez-mejores-pintxos-de-san-sebastian/' },
  { name: 'Casa Urola', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'traditional', why: 'Seasonal Basque kitchen upstairs plus a strong pintxos bar below.', source: 'https://institutodelpintxodess.com/guia-ir-de-pintxos/casa-urola' },
  { name: 'Bar Bergara', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Gros benchmark for its prawn-and-mushroom “txalupa”.', source: 'https://pinchosbergara.es/pinchos-san-sebastian.html' },
  { name: 'Hidalgo 56', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Gros favourite for its black-pudding “volcán de morcilla”.', source: 'https://spanishsabores.com/the-best-pintxos-bars-in-gros-san-sebastians-trendy-neighborhood/' },
  { name: 'Bar Zabaleta', town: 'San Sebastián', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Unfussy Gros bar with one of the city’s best tortillas.', source: 'https://devourtours.com/blog/where-to-eat-in-san-sebastians-gros-neighborhood/' },
  { name: 'Kokotxa', town: 'San Sebastián', leg: 'basque', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'Cozy one-star in the old town, a lighter modern take on Basque produce.', source: 'https://guide.michelin.com/en/pais-vasco/es-donostia-san-sebastian/restaurant/kokotxa' },
  { name: 'Rekondo', town: 'San Sebastián', leg: 'basque', tier: 'splurge', type: 'asador', why: 'Classic grill dining with one of the world’s great wine cellars.', source: 'https://guide.michelin.com/us/en/pais-vasco/es-donostia-san-sebastian/restaurant/rekondo' },
  { name: 'Arzak', town: 'San Sebastián', leg: 'basque', tier: 'marquee', type: 'fine-dining', michelin: 3, why: 'Three Michelin stars — the Arzak family’s iconic New Basque cuisine.', source: 'https://www.eatingeurope.com/blog/michelin-star-restaurants-san-sebastian/' },
  { name: 'Akelarre', town: 'San Sebastián', leg: 'basque', tier: 'marquee', type: 'fine-dining', michelin: 3, why: 'Clifftop three-star with sweeping Cantabrian Sea views.', source: 'https://sansebastianturismoa.eus/en/gastronomy/michelin-stars/' },
  { name: 'Mugaritz', town: 'Errenteria', leg: 'basque', tier: 'marquee', type: 'fine-dining', michelin: 2, why: 'Andoni Aduriz’s two-star temple of sensory experimentation.', source: 'https://devourtours.com/blog/michelin-restaurants-in-san-sebastian/' },
  { name: 'Amelia by Paulo Airaudo', town: 'San Sebastián', leg: 'basque', tier: 'marquee', type: 'fine-dining', michelin: 2, why: 'Intimate two-star with an open kitchen blending Basque produce and global technique.', source: 'https://www.revigorate.com/michelin-star-restaurants-in-san-sebastian.html' },
  { name: 'Asador Etxebarri', town: 'Axpe (Atxondo)', leg: 'basque', tier: 'marquee', type: 'asador', michelin: 1, why: 'Temple of grilling ranked #2 in World’s 50 Best — worth the day trip.', source: 'https://guide.michelin.com/en/pais-vasco/axpe/restaurant/etxebarri' },
  { name: 'Elkano', town: 'Getaria', leg: 'basque', tier: 'splurge', type: 'seafood', michelin: 1, why: 'One-star seafood grill famous for whole charcoal-grilled turbot.', source: 'https://www.tripadvisor.com/Restaurant_Review-g1064419-d1903917-Reviews-Restaurante_Elkano-Getaria.html' },
  { name: 'Kaia Kaipe', town: 'Getaria', leg: 'basque', tier: 'splurge', type: 'seafood', why: 'Family charcoal-grill above Getaria’s port with a huge cellar.', source: 'https://www.kaia-kaipe.com/en/' },
  { name: 'Gran Sol', town: 'Hondarribia', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Hondarribia’s standout pintxos bar on Calle San Pedro.', source: 'https://guide.michelin.com/us/en/pais-vasco/hondarribia/restaurant/gran-sol' },
  { name: 'Alameda', town: 'Hondarribia', leg: 'basque', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'Long-held one-star, refined modern Basque by the Txapartegi brothers.', source: 'https://guide.michelin.com/us/en/pais-vasco/hondarribia/restaurant/alameda220551' },
  { name: 'Sidrería Petritegi', town: 'Astigarraga', leg: 'basque', tier: 'local', type: 'cider-house', why: 'Classic sagardotegi for the txotx cider-and-txuleta ritual.', source: 'https://doeatbetterexperience.com/blog/best-sidrerias-san-sebastian/' },
  { name: 'Zapiain Sagardotegia', town: 'Astigarraga', leg: 'basque', tier: 'local', type: 'cider-house', why: 'Purist cider house: cod omelette, txuleta and cider from the kupela.', source: 'https://discoverdonosti.com/cider-houses-in-astigarraga/' },
  { name: 'Astarbe Sagardotegia', town: 'Astigarraga', leg: 'basque', tier: 'local', type: 'cider-house', why: 'One of the oldest cider houses (1563) doing the full txotx ritual year-round.', source: 'https://astarbe.eus/en/cider-house' },
  // ── Basque — Bilbao & around ──
  { name: 'Gure Toki', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Award-winning Plaza Nueva bar; hot pintxos and the crab txalupa.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'Víctor Montes', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Bilbao institution since 1849 with a grand belle-époque bar.', source: 'https://www.latroupe.com/en/city-stories/best-pintxos-places-bilbao/' },
  { name: 'Café Iruña', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Iconic 1903 café with Mudéjar decor and grilled lamb pintxos morunos.', source: 'https://www.latroupe.com/en/city-stories/best-pintxos-places-bilbao/' },
  { name: 'El Globo', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Beloved for its spider-crab (txangurro) pintxo.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'Antxoa Taberna', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Anchovy specialist serving 20+ varieties from across Biscay.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'Xukela', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Tiny, always-packed bar where the solomillo toast is the move.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'Bar Charly', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'pintxos', why: 'Legendary for cod (bacalao) pintxos and a buzzing txikiteo crowd.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'La Viña del Ensanche', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'wine-bar', why: '1927 classic pairing acorn-fed Iberian ham with local wines.', source: 'https://lavinadelensanche.com/en/' },
  { name: 'Mercado de la Ribera', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'market', why: 'Huge riverside market with upstairs gastro-bars (gildas, txangurro).', source: 'https://www.bilbaoturismo.net/BilbaoTurismo/en/gastronomic-shopping/-ribera-market' },
  { name: 'ARVO Specialty Coffee', town: 'Bilbao', leg: 'basque', tier: 'local', type: 'cafe', why: 'Top specialty coffee, brunch and pastries by the Guggenheim.', source: 'https://arvobilbao.es/en/guggenheim/' },
  { name: 'Nerua Guggenheim Bilbao', town: 'Bilbao', leg: 'basque', tier: 'marquee', type: 'fine-dining', michelin: 1, why: 'One-star inside the Guggenheim; Josean Alija’s precise Basque cuisine.', source: 'https://www.bilbaoturismo.net/BilbaoTurismo/en/home/michelin-starred-restaurants-in-bilbao' },
  { name: 'Mina', town: 'Bilbao', leg: 'basque', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'One-star riverfront tasting menu; intimate, market-driven.', source: 'https://bonviveur.com/es/noticias/restaurantes-de-bilbao-con-estrellas-michelin' },
  { name: 'Atelier Etxanobe', town: 'Bilbao', leg: 'basque', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'One-star creative tasting menus in a former glass factory.', source: 'https://atelieretxanobe.com/en/' },
  { name: 'Zarate', town: 'Bilbao', leg: 'basque', tier: 'splurge', type: 'seafood', michelin: 1, why: 'One-star, sea-driven cooking built on superb baked and grilled wild fish.', source: 'https://guide.michelin.com/gb/en/pais-vasco/bilbao/restaurant/zarate' },
  { name: 'Ola Martín Berasategui', town: 'Bilbao', leg: 'basque', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'One-star Berasategui outpost with a signature liquid tortilla and truffle.', source: 'https://guide.michelin.com/en/pais-vasco/bilbao/restaurant/ola-martin-berasategui' },
  { name: 'Asador Cannon', town: 'Bermeo', leg: 'basque', tier: 'local', type: 'asador', why: 'Hilltop grill with Atlantic views and fish that changes with the boats.', source: 'https://wanderlog.com/list/geoCategory/201290/where-to-eat-best-restaurants-in-bermeo' },
  // ── Balearic — Mallorca ──
  { name: 'VORO', town: 'Canyamel', leg: 'balearic', tier: 'marquee', type: 'fine-dining', michelin: 2, why: 'Mallorca’s only two-star — an 18–22 course journey at Cap Vermell.', source: 'https://www.majorcadailybulletin.com/news/did-you-know/2025/11/26/138371/map-all-michelin-starred-restaurants-mallorca-2026.html' },
  { name: 'Marc Fosh', town: 'Palma de Mallorca', leg: 'balearic', tier: 'marquee', type: 'fine-dining', michelin: 1, why: 'Michelin-starred seasonal Mediterranean cooking in a 17th-c. convent.', source: 'https://guide.michelin.com/us/en/islas-baleares/palma/restaurant/marc-fosh' },
  { name: 'DINS Santi Taura', town: 'Palma de Mallorca', leg: 'balearic', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'One-star reinventing heirloom Mallorcan recipes as a tasting menu.', source: 'https://www.helencummins.com/mallorcas-michelin-stars/' },
  { name: 'Adrián Quetglas', town: 'Palma de Mallorca', leg: 'balearic', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'Relaxed one-star bistro with 5- and 8-course tasting menus.', source: 'https://guide.michelin.com/en/islas-baleares/palma/restaurant/adrian-quetglas' },
  { name: 'Maca de Castro', town: 'Port d’Alcúdia', leg: 'balearic', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'One-star surprise menu from the chef’s own garden.', source: 'https://guide.michelin.com/en/islas-baleares/port-d-alcdia/restaurant/maca-de-castro' },
  { name: 'Es Fum', town: 'Costa d’en Blanes', leg: 'balearic', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'Refined seaside one-star tasting menus with polished service.', source: 'https://www.privatepropertymallorca.com/en/culture/michelin-starred-restaurants-in-mallorca-2025/' },
  { name: 'Béns d’Avall', town: 'Sóller', leg: 'balearic', tier: 'marquee', type: 'fine-dining', michelin: 1, why: 'Clifftop Michelin star + Green Star with magical sunset sea views.', source: 'https://guide.michelin.com/gb/en/islas-baleares/soller/restaurant/bens-d-avall' },
  { name: 'Es Racó d’es Teix', town: 'Deià', leg: 'balearic', tier: 'splurge', type: 'fine-dining', michelin: 1, why: 'Michelin star in a Deià stone house with a terrace over the valley.', source: 'https://www.tripadvisor.com/Restaurant_Review-g187462-d1177079-Reviews-Es_Raco_d_es_Teix-Majorca.html' },
  { name: 'Ca’s Patró March', town: 'Cala Deià', leg: 'balearic', tier: 'splurge', type: 'seafood', why: 'Cliffside shack above Cala Deià serving the day’s catch.', source: 'https://www.abc-mallorca.com/cas-patro-march-cala-deia/' },
  { name: 'Restaurante Sa Foradada', town: 'Deià', leg: 'balearic', tier: 'marquee', type: 'seafood', why: 'Iconic lunch-only wood-fired paella on a cliff peninsula.', source: 'https://restaurantesaforadada.com/' },
  { name: 'Restaurante Miramar', town: 'Port d’Alcúdia', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Family seafood institution since 1871 for paellas and red prawns.', source: 'https://www.themallorcan.com/blog/best-restaurants-in-port-alcudia' },
  { name: 'Ca’n Boqueta', town: 'Sóller', leg: 'balearic', tier: 'local', type: 'traditional', why: 'Bib Gourmand set menus of inventive Mallorcan cooking in a stone townhouse.', source: 'https://restaurantguru.com/Can-Boqueta-Soller' },
  { name: 'Es Cantonet', town: 'Santanyí', leg: 'balearic', tier: 'splurge', type: 'traditional', why: 'Restored townhouse with a courtyard and a much-praised paella.', source: 'https://restaurantguru.com/Es-Cantonet-Santanyi' },
  { name: 'Celler Sa Premsa', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'traditional', why: 'Rustic celler for hearty traditional dishes among giant wine barrels.', source: 'https://www.helencummins.com/best-restaurants-palma/' },
  { name: 'Bodega La Rambla', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'traditional', why: '1940s tavern for the house “variat” platter of squid, octopus and cod.', source: 'https://www.theinfatuation.com/mallorca/guides/best-restaurants-palma-de-mallorca' },
  { name: 'Maura', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'traditional', why: 'Beautiful modernist room serving a big selection of Mallorcan specialities.', source: 'https://paperplanesandcaramelwaffles.com/best-places-to-eat-and-drink-in-palma-mallorca/' },
  { name: 'El Camino', town: 'Palma de Mallorca', leg: 'balearic', tier: 'marquee', type: 'tapas', why: 'Buzzy counter-seating tapas; front-row view of the kitchen.', source: 'https://www.theinfatuation.com/mallorca/guides/best-restaurants-palma-de-mallorca' },
  { name: 'La Sang', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'wine-bar', why: 'Mallorca’s first natural-wine bar and a hub for local winemakers.', source: 'https://starwinelist.com/wine-guide/great-wine-bars-and-restaurants-in-palma-de-mallorca' },
  { name: 'La Rosa Catalina', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'wine-bar', why: 'Beloved vermutería for house vermouth and a giant tortilla pintxo.', source: 'https://www.estilopalma.com/2025/09/la-rosa-catalina-vermouth-vibes/' },
  { name: 'Wineing', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', type: 'wine-bar', why: 'Self-serve card system to sample ~48 Balearic and Spanish wines by the sip.', source: 'https://wineing.es/' },
  { name: 'NENI Mallorca', town: 'Port de Sóller', leg: 'balearic', tier: 'splurge', type: 'international', why: 'Eastern-Med sharing plates with panoramic Port de Sóller bay views.', source: 'https://www.bikini-hotels.com/mallorca-hotels/port-de-soller/eat-drink/neni-mallorca-port-de-soller/' },
  { name: 'Es Taller', town: 'Valldemossa', leg: 'balearic', tier: 'splurge', type: 'international', why: 'Former garage fusing local produce with global spice.', source: 'https://www.estallervalldemossa.com/' },
  { name: 'De Tokio a Lima', town: 'Valldemossa', leg: 'balearic', tier: 'splurge', type: 'international', why: 'Nikkei ceviches and tiraditos overlooking the Valldemossa valley.', source: 'https://detokioalima.com/valldemossa/' },
  // ── Balearic — Menorca ──
  { name: 'Café Balear', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Harbourfront institution buying the day’s catch; famed lobster stew.', source: 'https://menorcaboattrip.com/best-seafood-restaurants-menorca/' },
  { name: 'S’Amarador', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'splurge', type: 'seafood', why: 'Michelin-Guide seafood spot on the marina, prized for caldereta.', source: 'https://www.theinfatuation.com/menorca/guides/the-best-restaurants-on-menorca' },
  { name: 'Godai', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'marquee', type: 'fine-dining', why: 'Michelin-Guide Japanese-Menorcan fusion with a sunset marina terrace.', source: 'https://guide.michelin.com/en/islas-baleares/ciutadella-de-menorca/restaurant/godai' },
  { name: 'Smoix', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'marquee', type: 'fine-dining', why: 'Michelin-Guide modern Mediterranean built on Menorcan produce.', source: 'https://www.zigzagonearth.com/best-restaurants-menorca-where-eat-reviews/' },
  { name: 'Pinzell', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'splurge', type: 'fine-dining', why: 'Creative, produce-driven Menorcan cooking by chef Joan Salord.', source: 'https://www.artiemhotels.com/en/blog/restaurants-menorca' },
  { name: 'Ulisses', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Beside the fish market, serving daily catch from its own boat.', source: 'https://www.artiemhotels.com/en/blog/restaurants-menorca' },
  { name: 'Es Tast de na Silvia', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'local', type: 'traditional', why: 'Tiny homey spot where Silvia cooks nearly everything from scratch.', source: 'https://www.zigzagonearth.com/best-restaurants-menorca-where-eat-reviews/' },
  { name: 'Sa Llagosta', town: 'Fornells', leg: 'balearic', tier: 'marquee', type: 'seafood', why: 'Fornells lobster specialist whose caldereta was praised by José Andrés.', source: 'https://www.gastromondiale.com/menorca-restaurants-sa-llagosta-and-others/' },
  { name: 'Es Cranc', town: 'Fornells', leg: 'balearic', tier: 'splurge', type: 'seafood', why: 'Michelin-recommended kitchen known for lobster stew and octopus.', source: 'https://menorcanguide.com/best-restaurants-for-lobster-stew-in-menorca/' },
  { name: 'La Guapa', town: 'Fornells', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Fornells go-to for caldereta de langosta and lobster rice.', source: 'https://menorcanguide.com/best-restaurants-for-lobster-stew-in-menorca/' },
  { name: 'Ses Forquilles', town: 'Mahón', leg: 'balearic', tier: 'local', type: 'tapas', why: 'Local-favourite casa de comidas doing elevated small plates.', source: 'https://www.theinfatuation.com/menorca/reviews/ses-forquilles' },
  { name: 'S’Espigó', town: 'Mahón', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Waterfront Maó spot for grilled fish and caldereta with port views.', source: 'https://www.homemenorca.com/news-detail/where-to-eat-in-mahon-harbour-top-restaurants-by-the-water/52891' },
  { name: 'Restaurant Arjau', town: 'Mahón', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Port institution in the capital for seafood and paellas.', source: 'https://menorcanguide.com/best-restaurants-in-mahon-harbour/' },
  { name: 'Sa Vinya des Port', town: 'Mahón', leg: 'balearic', tier: 'local', type: 'wine-bar', why: 'Charming harbourside wine bar for snacks, cocktails and live music.', source: 'https://menorcanguide.com/best-restaurants-in-mahon-harbour/' },
  { name: 'Torralbenc', town: 'Alaior', leg: 'balearic', tier: 'marquee', type: 'fine-dining', why: 'Michelin-Guide agroturismo blending Basque technique and Menorcan roots.', source: 'https://guide.michelin.com/en/islas-baleares/cala-en-porter/restaurant/torralbenc' },
  { name: 'Es Molí de Foc', town: 'Sant Climent', leg: 'balearic', tier: 'splurge', type: 'traditional', why: 'Rice specialist in a 19th-c. mill with its own craft brewery.', source: 'https://www.tripadvisor.com/Restaurant_Review-g2260832-d1755186-Reviews-Es_Moli_de_Foc-Sant_Climent_Mahon_Menorca.html' },
  { name: 'Ca na Marga', town: 'Es Mercadal', leg: 'balearic', tier: 'local', type: 'asador', why: 'Charcoal-grill house famed for local ribeye and island wines.', source: 'https://wanderlog.com/place/details/1105130/ca-na-marga' },
  { name: 'Sa Punta', town: 'Es Castell', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Waterfront terrace at Cales Fonts serving island fish and seafood.', source: 'https://www.rutaskayakmenorca.com/en/where-to-dine-in-cales-fonts/' },
  { name: 'Es Llenegall', town: 'Es Castell', leg: 'balearic', tier: 'local', type: 'tapas', why: 'Informal tapas right on the Cales Fonts quay.', source: 'https://www.rutaskayakmenorca.com/en/where-to-dine-in-cales-fonts/' },
  { name: 'Es Bruc', town: 'Sant Tomàs', leg: 'balearic', tier: 'local', type: 'seafood', why: 'Beachfront classic since the ’50s for fresh fish and paella.', source: 'https://www.theinfatuation.com/menorca/guides/the-best-restaurants-on-menorca' },
]

export const EAT: SeedEat[] = RAW_EAT.map((e) => ({
  id: slug(e.name),
  category: 'eat',
  name: e.name,
  town: e.town,
  leg: e.leg,
  tier: e.tier,
  type: e.type,
  michelin: e.michelin,
  tags: [e.type],
  why: e.why,
  source: e.source,
  bookingUrgency:
    e.tier === 'marquee'
      ? 'Book 1–2 months ahead for peak August.'
      : e.tier === 'splurge'
        ? 'Reserve a few weeks ahead for August.'
        : undefined,
}))

// ── Do ───────────────────────────────────────────────────────────────────────

type RawDo = {
  name: string
  town: string
  leg: LegId
  type: string
  why: string
  source: string
}

const RAW_DO: RawDo[] = [
  // ── Basque — San Sebastián & around ──
  { name: 'La Concha Beach', town: 'San Sebastián', leg: 'basque', type: 'beach', why: 'Europe’s most beautiful urban beach with an elegant promenade.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/san-sebastian-beaches/' },
  { name: 'Zurriola Beach', town: 'San Sebastián', leg: 'basque', type: 'watersport', why: 'The city’s Atlantic surf beach in Gros, popular for lessons.', source: 'https://carameltrail.com/san-sebastian-surf-spots-la-zurriola-in-the-cantabrian-sea/' },
  { name: 'Monte Igueldo', town: 'San Sebastián', leg: 'basque', type: 'viewpoint', why: 'Ride the 1912 funicular for the classic panorama over the bay.', source: 'https://sansebastianturismoa.eus/en/to-do/hills/mount-igeldo/' },
  { name: 'Monte Ulia coastal walk', town: 'San Sebastián', leg: 'basque', type: 'coastal-walk', why: 'Clifftop whaler’s-lookout walk on the Camino coastal route.', source: 'https://www.packing-up-the-pieces.com/monte-ulia-hike-san-sebastian/' },
  { name: 'Peine del Viento', town: 'San Sebastián', leg: 'basque', type: 'landmark', why: 'Chillida’s iron sculptures anchored in the rocks at the bay’s end.', source: 'https://www.sansebastian.travel/en/peine-del-viento/' },
  { name: 'Kursaal', town: 'San Sebastián', leg: 'basque', type: 'landmark', why: 'Moneo’s iconic glass cubes at the mouth of the Urumea.', source: 'https://meetmeindepartures.com/things-to-do-in-san-sebastian/' },
  { name: 'Tabakalera', town: 'San Sebastián', leg: 'basque', type: 'landmark', why: 'Former tobacco factory turned free cultural hub with a rooftop view.', source: 'https://www.freewalkingtoursansebastian.com/tabakalera/' },
  { name: 'San Telmo Museoa', town: 'San Sebastián', leg: 'basque', type: 'museum', why: 'The Basque Country’s oldest museum, in a 16th-c. convent.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/san-telmo-museoa/' },
  { name: 'San Sebastián Aquarium', town: 'San Sebastián', leg: 'basque', type: 'museum', why: 'Harbour-front aquarium and seafaring museum — a good rainy-hour stop.', source: 'https://www.tripadvisor.com/Attraction_Review-g187457-d2049408-Reviews-Aquarium-Donostia_San_Sebastian.html' },
  { name: 'Cristina Enea Park', town: 'San Sebastián', leg: 'basque', type: 'garden', why: 'The city’s loveliest park — shady paths and roaming peacocks.', source: 'https://sansebastianturismoa.eus/en/to-do/plans-in-san-sebastian/walking-tours/cristina-enea-park/' },
  { name: 'Santa Clara Island', town: 'San Sebastián', leg: 'basque', type: 'boat', why: 'Short seasonal ferry to the island in the bay for trails and a beach.', source: 'https://www.adventurouskate.com/things-to-do-in-san-sebastian-spain/' },
  { name: 'Pasai Donibane village', town: 'Pasaia', leg: 'basque', type: 'old-town', why: 'Roadless painted-house village reached by a tiny motorboat crossing.', source: 'https://turismovasco.com/en/gipuzkoa/what-to-see-in-gipuzkoa/pasai-donibane-pasajes-san-juan/' },
  { name: 'Hondarribia', town: 'Hondarribia', leg: 'basque', type: 'old-town', why: 'Colorful medieval fishing town with a marina and pintxos street.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/hondarribia/' },
  { name: 'Monte Jaizkibel & Guadalupe viewpoint', town: 'Hondarribia', leg: 'basque', type: 'viewpoint', why: 'Cliff-top ridge road with towers and Bay of Txingudi vistas.', source: 'https://guias-viajar.com/en/turismo-espana/visitar-pais-vasco/guipuzcoa-jaizquibel-pasaia-hondarribia/' },
  { name: 'Chillida Leku', town: 'Hernani', leg: 'basque', type: 'museum', why: '11 hectares of Chillida’s monumental sculptures around a farmhouse.', source: 'https://tourism.euskadi.eus/en/museums/chillida-leku-museum/webtur00-content/en/' },
  { name: 'Atxondo Valley walk', town: 'Axpe (Atxondo)', leg: 'basque', type: 'hike', why: 'Easy valley walk beneath Mount Anboto, by Asador Etxebarri.', source: 'https://casagoikomaia.com/en/las-3-rutas-mas-bonitas-en-el-valle-de-atxondo/' },
  { name: 'Getaria & Txomin Etxaniz winery', town: 'Getaria', leg: 'basque', type: 'winery', why: 'Fishing town, birthplace of Txakoli; tour the hillside winery.', source: 'https://www.txominetxaniz.com/en/enoturismoa/' },
  { name: 'Gaintza Txakoli winery', town: 'Getaria', leg: 'basque', type: 'winery', why: '90-min family-winery tour and Txakoli tasting with anchovies and tuna.', source: 'https://gaintza.com/en/visitas/' },
  { name: 'Cristóbal Balenciaga Museoa', town: 'Getaria', leg: 'basque', type: 'museum', why: 'World’s first museum devoted to a couturier, in his home village.', source: 'https://www.cristobalbalenciagamuseoa.com/en/visit/opening-hours-and-prices/' },
  { name: 'Zarautz Beach & Santa Bárbara viewpoint', town: 'Zarautz', leg: 'basque', type: 'beach', why: '2.5 km beach with a sculpture promenade and a hermitage viewpoint.', source: 'https://tourism.euskadi.eus/en/beaches-reservoirs-rivers/zarautz-beach/webtur00-content/en/' },
  { name: 'Zumaia Flysch', town: 'Zumaia', leg: 'basque', type: 'coastal-walk', why: 'Dramatic 50-million-year rock layers on foot or by geopark boat.', source: 'https://geoparkea.eus/en/guided-tours/flysch-tour' },
  { name: 'Guggenheim Museum Bilbao', town: 'Bilbao', leg: 'basque', type: 'museum', why: 'Frank Gehry’s titanium landmark and world-class contemporary art.', source: 'https://thislifeintrips.com/what-to-do-in-bilbao-24-hours-itinerary/' },
  { name: 'Museo de Bellas Artes de Bilbao', town: 'Bilbao', leg: 'basque', type: 'museum', why: 'World-class fine-arts collection from the 12th century to today.', source: 'https://www.hellotickets.com/spain/bilbao/museums/sc-315-5598' },
  { name: 'Itsasmuseum Bilbao', town: 'Bilbao', leg: 'basque', type: 'museum', why: 'Interactive maritime museum tracing Bilbao’s port heritage.', source: 'https://www.itsasmuseum.eus/en/visit/surrounding-area/what-to-see-in-bilbao/' },
  { name: 'Casco Viejo (Siete Calles)', town: 'Bilbao', leg: 'basque', type: 'old-town', why: 'Bilbao’s medieval old town of seven streets, cathedral and pintxos lanes.', source: 'https://thetravelista.net/travel/a-48-hour-guide-to-bilbao/' },
  { name: 'Funicular de Artxanda', town: 'Bilbao', leg: 'basque', type: 'viewpoint', why: 'Historic funicular to a hilltop viewpoint over the whole city.', source: 'https://bilbaoinsider.com/mount-artxanda-guide/' },
  { name: 'San Mamés & Athletic Club Museum', town: 'Bilbao', leg: 'basque', type: 'landmark', why: 'Tour Athletic’s iconic stadium and immersive museum.', source: 'https://sanmames.athletic-club.eus/en/blog/museums-to-visit-in-bilbao/' },
  { name: 'Puerto Viejo de Algorta', town: 'Getxo', leg: 'basque', type: 'old-town', why: 'Whitewashed fishermen’s quarter with bay views, pintxos and txakoli.', source: 'https://turismovasco.com/en/bizkaia/what-to-see-in-bizkaia/puerto-viejo-de-algorta/' },
  { name: 'Puente Bizkaia (Vizcaya Bridge)', town: 'Getxo', leg: 'basque', type: 'landmark', why: 'UNESCO transporter bridge — the world’s first — in seaside Getxo.', source: 'https://bea-adventurous.com/day-trips-from-bilbao-2/' },
  { name: 'Plentzia & Gorliz beaches', town: 'Plentzia', leg: 'basque', type: 'beach', why: 'Twin calm-water beaches on Plentzia bay, reachable by metro.', source: 'https://authenticbasquecountry.com/best-beaches-near-bilbao/' },
  { name: 'San Juan de Gaztelugatxe', town: 'Bermeo', leg: 'basque', type: 'landmark', why: '241-step causeway to a clifftop hermitage (GoT’s Dragonstone).', source: 'https://www.getyourguide.com/bilbao-l93/bilbao-san-juan-de-gaztelugatxe-and-txakoli-wine-day-trip-t421363/' },
  { name: 'Mundaka', town: 'Mundaka', leg: 'basque', type: 'watersport', why: 'Home to Europe’s celebrated left surf wave and a pretty estuary village.', source: 'https://tourism.euskadi.eus/en/blog/essential-things-to-do-in-the-urdaibai-biosphere-reserve/webtur00-contfichapost/en/' },
  { name: 'Doniene Gorrondona Txakoli winery', town: 'Bakio', leg: 'basque', type: 'winery', why: 'Seaside 1852 winery for a vineyard tour and txakoli tasting.', source: 'https://donienegorrondona.com/en/visit/' },
  { name: 'Gernika: Peace Museum', town: 'Gernika', leg: 'basque', type: 'museum', why: 'Moving 1937-bombing museum plus the Basque assembly house and oak.', source: 'https://gernikainfo.eus/en/what-to-see-in-gernika-in-a-day/' },
  { name: 'Laguardia & Rioja Alavesa', town: 'Laguardia', leg: 'basque', type: 'day-trip', why: 'Medieval hilltop wine town near Marqués de Riscal.', source: 'https://www.getyourguide.com/bilbao-l93/haro-laguardia-and-two-rioja-wineries-from-bilbao-t343561/' },
  // ── Balearic — Mallorca ──
  { name: 'Sa Calobra & Serra de Tramuntana drive', town: 'Serra de Tramuntana', leg: 'balearic', type: 'viewpoint', why: 'UNESCO mountain drive with 26 hairpins and the “tie-knot” bridge.', source: 'https://crazyroads.net/sa-calobra-road/' },
  { name: 'Ferrocarril de Sóller', town: 'Sóller', leg: 'balearic', type: 'landmark', why: '1912 wooden train through citrus groves, then a tram to the port.', source: 'https://trendesoller.com/eng/routes/train' },
  { name: 'Cala Deià', town: 'Deià', leg: 'balearic', type: 'cove', why: 'Small rocky cove with crystal water and cliffside restaurants.', source: 'https://www.abc-mallorca.com/cala-deia/' },
  { name: 'Sa Foradada peninsula walk', town: 'Deià', leg: 'balearic', type: 'coastal-walk', why: '~45-min walk to the dramatic pierced-rock peninsula.', source: 'https://www.ourbigjourney.com/sa-foradada-in-mallorca-hike/' },
  { name: 'Es Trenc', town: 'Campos', leg: 'balearic', type: 'beach', why: 'Mallorca’s last big natural beach — white sand, turquoise water.', source: 'https://www.mallorca-beaches.com/en/es-trenc/' },
  { name: 'Cala Varques', town: 'Manacor', leg: 'balearic', type: 'cove', why: 'Undeveloped turquoise cove reached on foot; nearby sea caves.', source: 'https://www.calavarques.com/' },
  { name: 'Caló des Moro', town: 'Santanyí', leg: 'balearic', type: 'cove', why: 'Postcard cliff-framed cove often called Mallorca’s prettiest — go early.', source: 'https://www.palmaweekly.com/beaches-east-coast-mallorca/' },
  { name: 'Cala Llombards', town: 'Santanyí', leg: 'balearic', type: 'cove', why: 'Fjord-like inlet with white sand and calm, pine-sheltered water.', source: 'https://byemyself.com/mallorca-east-coast-bay-by-bay-cala/' },
  { name: 'Cala Mondragó', town: 'Santanyí', leg: 'balearic', type: 'beach', why: 'Protected fine-sand inlets with shallow turquoise water in a nature park.', source: 'https://www.lonelyplanet.com/articles/mallorca-best-beaches' },
  { name: 'Cala Figuera', town: 'Santanyí', leg: 'balearic', type: 'old-town', why: 'Working fishing village of twin inlets and bobbing llaüts.', source: 'https://www.melia.com/en/blog/travel/what-to-see-cala-figuera' },
  { name: 'Palma Cathedral (La Seu)', town: 'Palma de Mallorca', leg: 'balearic', type: 'landmark', why: 'Towering Gothic cathedral with a Gaudí-designed altar canopy.', source: 'https://catedraldemallorca.org/en/visits/tours/' },
  { name: 'Valldemossa & Carthusian Monastery', town: 'Valldemossa', leg: 'balearic', type: 'old-town', why: 'Postcard mountain village with the charterhouse where Chopin wintered.', source: 'https://www.mallorca.com/en/guide/places/valldemossa' },
  { name: 'Fornalutx village', town: 'Sóller', leg: 'balearic', type: 'old-town', why: 'Often called Spain’s prettiest village — cobbled lanes above Sóller.', source: 'https://www.bontraveler.com/fornalutx-mallorca/' },
  { name: 'Castell d’Alaró hike', town: 'Alaró', leg: 'balearic', type: 'hike', why: '~45-min climb to a clifftop castle ruin with roast-lamb lunch en route.', source: 'https://www.privatepropertymallorca.com/en/general-information/our-favourite-hike-es-verger-restaurant-to-castell-dalaro-monastery/' },
  { name: 'Jardins d’Alfàbia', town: 'Bunyola', leg: 'balearic', type: 'garden', why: 'Centuries-old Moorish-influenced gardens with fountains and shade.', source: 'https://www.jardinesdealfabia.com/en/' },
  { name: 'Cap de Formentor & Mirador Es Colomer', town: 'Pollença', leg: 'balearic', type: 'viewpoint', why: 'Cliff-top viewpoints at the island’s dramatic northern tip.', source: 'https://www.click-mallorca.com/blog/en/what-to-do-mallorca/sightseeing/how-to-get-to-formentor/' },
  { name: 'Alcúdia old town', town: 'Alcúdia', leg: 'balearic', type: 'old-town', why: 'Walk the 14th-c. walls and Roman ruins in tapas-lined lanes.', source: 'https://thehappyjetlagger.com/en/alcudia-mallorca/' },
  { name: 'Bodega Ribas', town: 'Consell', leg: 'balearic', type: 'winery', why: 'Mallorca’s oldest winery (1711); taste Manto Negro and Prensal Blanc.', source: 'https://bodegaribas.com/en/visit-us/' },
  { name: 'Bodegas José L. Ferrer', town: 'Binissalem', leg: 'balearic', type: 'winery', why: 'D.O. Binissalem winery (est. 1931) with cellar tours and tastings.', source: 'https://www.vinosferrer.com/en/wine-tourism/visits-and-tasting/' },
  { name: 'Mallorca Gin Distillery', town: 'Palma de Mallorca', leg: 'balearic', type: 'distillery', why: 'Copper-still gin tour with foraged botanicals and a make-your-own option.', source: 'https://www.mallorcagin.com/' },
  { name: 'Barcos Azules boat to Sa Calobra', town: 'Port de Sóller', leg: 'balearic', type: 'boat', why: 'Scenic coastal boat from Sóller to the turquoise Tuent and Sa Calobra coves.', source: 'https://www.barcoscalobra.com/?lang=en' },
  { name: 'Palma Bay sunset boat trip', town: 'Palma de Mallorca', leg: 'balearic', type: 'boat', why: 'Half-day or sunset charter to swim in hidden west-coast coves.', source: 'https://www.seemallorca.com/boat-trips/guide' },
  // ── Balearic — Menorca ──
  { name: 'Cala Macarella & Macarelleta', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'cove', why: 'Menorca’s postcard turquoise coves; reach by bus, boat or a walk.', source: 'https://www.alongdustyroads.com/posts/cala-macarella-macarelleta-beach' },
  { name: 'Cala Turqueta', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'cove', why: 'Sheltered white-sand cove with clear turquoise water.', source: 'https://www.artiemhotels.com/en/blog/discover-the-beauty-of-cala-turqueta-a-paradise-in-menorca' },
  { name: 'Son Saura', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'beach', why: 'Twin white-sand bays with easier parking than Turqueta.', source: 'https://www.alongdustyroads.com/posts/best-beaches-in-menorca' },
  { name: 'Cala Mitjana', town: 'Ferreries', leg: 'balearic', type: 'cove', why: 'White limestone-cliff cove with clear water and a trail to Trebalúger.', source: 'https://www.menorcadiferente.com/en/the-10-best-beaches-of-menorca/' },
  { name: 'Cala Pregonda', town: 'Es Mercadal', leg: 'balearic', type: 'beach', why: 'Wild “Martian” beach of red-orange sand against turquoise water.', source: 'https://www.alongdustyroads.com/posts/cala-pregonda-menorca' },
  { name: 'Platja de Cavalleria', town: 'Es Mercadal', leg: 'balearic', type: 'beach', why: 'Large unspoilt red-sand north-coast beach beneath a lighthouse.', source: 'https://www.descobreixmenorca.com/en/beaches-of-menorca/cavalleria-beach/' },
  { name: 'Binimel·là', town: 'Es Mercadal', leg: 'balearic', type: 'beach', why: 'Coarse-sand beach in the marine reserve with excellent snorkelling.', source: 'https://www.descobreixmenorca.com/en/beaches-of-menorca/binimella-beach/' },
  { name: 'Camí de Cavalls: Cala Galdana → Macarella', town: 'Cala Galdana', leg: 'balearic', type: 'coastal-walk', why: '~45-min clifftop coastal walk linking Galdana to the turquoise calas.', source: 'https://www.lelongweekend.com/cala-macarella-macarelleta-menorca/' },
  { name: 'Camí de Cavalls: Binimel·là → Cala Pilar', town: 'Es Mercadal', leg: 'balearic', type: 'coastal-walk', why: 'A spectacular, demanding north-coast stretch ending at wild Cala Pilar.', source: 'https://www.descobreixmenorca.com/en/cami-de-cavalls-3/best-stretches/' },
  { name: 'S’Albufera des Grau Natural Park', town: 'Es Grau', leg: 'balearic', type: 'hike', why: 'Core of Menorca’s Biosphere Reserve: easy lagoon-and-wood trails.', source: 'https://www.thenaturaladventure.com/blog/walking-menorca-cami-de-cavalls/' },
  { name: 'Ciutadella Old Town', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'old-town', why: 'Walled centre with the Gothic cathedral and arched Ses Voltes.', source: 'https://www.heatheronhertravels.com/things-to-do-in-ciutadella-menorca-spain/' },
  { name: 'Cap de Favàritx', town: 'Mahón', leg: 'balearic', type: 'landmark', why: 'Striking black-slate cape and lighthouse with a lunar coastline.', source: 'https://www.descobreixmenorca.com/en/cami-de-cavalls-3/' },
  { name: 'Illa del Rei & Hauser & Wirth', town: 'Mahón', leg: 'balearic', type: 'museum', why: 'Harbour islet with a restored hospital and a Hauser & Wirth gallery.', source: 'https://www.zigzagonearth.com/illa-del-rei-port-mahon-menorca-visit/' },
  { name: 'Port of Maó harbour boat trip', town: 'Mahón', leg: 'balearic', type: 'boat', why: 'Glass-bottom catamaran around the Mediterranean’s largest harbour.', source: 'https://www.yellowcatamarans.com/en/trip-around-the-port' },
  { name: 'Naveta des Tudons', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'landmark', why: 'Iconic ship-shaped funerary monument of the UNESCO Talayotic sites.', source: 'https://www.heatheronhertravels.com/naveta-des-tudons-menorca-talayotic-culture/' },
  { name: 'Torre d’en Galmés', town: 'Alaior', leg: 'balearic', type: 'landmark', why: 'Largest prehistoric settlement on the island, with sea views.', source: 'https://www.descobreixmenorca.com/en/megalithic-menorca/' },
  { name: 'Monte Toro', town: 'Es Mercadal', leg: 'balearic', type: 'viewpoint', why: 'Menorca’s summit with a sanctuary and 360° island panoramas.', source: 'https://www.illesbalears.travel/en/menorca/sanctuary-monte-toro' },
  { name: 'Cova d’en Xoroi', town: 'Cala en Porter', leg: 'balearic', type: 'nightlife', why: 'Cliffside cave bar famed for romantic sunset cocktails.', source: 'https://www.covadenxoroi.com/en' },
  { name: 'Kayak cave route: Cala en Porter → Cales Coves', town: 'Cala en Porter', leg: 'balearic', type: 'watersport', why: 'Guided paddle into sea caves with snorkelling at the Cales Coves necropolis.', source: 'https://www.rutaskayakmenorca.com/en/best-kayak-excursion-in-kayak-route-of-the-caves/' },
  { name: 'Bodegas Binifadet', town: 'Sant Lluís', leg: 'balearic', type: 'winery', why: 'Menorca’s best-known winery with tours, tastings and a wine-bar restaurant.', source: 'https://binifadet.com/en' },
  { name: 'Bodegas Binitord', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'winery', why: 'Family organic winery in an old quarry with a vineyard-walk tasting.', source: 'https://wanderlog.com/place/details/6108812/binitord-bodega' },
  { name: 'Xoriguer Gin Distillery', town: 'Mahón', leg: 'balearic', type: 'distillery', why: 'Portside distillery of Gin de Mahón with free tastings.', source: 'https://www.tripadvisor.com/Attraction_Review-g642211-d3637468-Reviews-Xoriguer_Gin_Factory-Mahon.html' },
  { name: 'Hort de Sant Patrici', town: 'Ferreries', leg: 'balearic', type: 'garden', why: 'Farm making Mahón-Menorca cheese and wine, with a cheese museum.', source: 'https://santpatrici.es/en/store-visit' },
]

export const DO: SeedDo[] = RAW_DO.map((d) => ({
  id: slug(d.name),
  category: 'do',
  name: d.name,
  town: d.town,
  leg: d.leg,
  type: d.type,
  interests: [d.type],
  tags: [d.type],
  why: d.why,
  source: d.source,
}))

// ── Combined access ──────────────────────────────────────────────────────────

export const SEED_PLACES: SeedPlace[] = [...STAY, ...EAT, ...DO]

export const SEED_BY_CATEGORY: Record<'stay' | 'eat' | 'do', SeedPlace[]> = {
  stay: STAY,
  eat: EAT,
  do: DO,
}

const SEED_INDEX: Record<string, SeedPlace> = Object.fromEntries(
  SEED_PLACES.map((p) => [p.id, p]),
)

/** Look up a seed place by id — guarantees we only render real seed places. */
export function getSeedPlace(id: string): SeedPlace | undefined {
  return SEED_INDEX[id]
}

export function isSeedId(id: string): boolean {
  return id in SEED_INDEX
}

/** The leg a date falls in (used for itinerary grouping + drive-time base). */
export function legForDate(iso: string): LegId {
  const balearic = TRIP_CONFIG.legs.find((l) => l.id === 'balearic')
  return balearic && iso >= balearic.startDate ? 'balearic' : 'basque'
}

export function legById(id: LegId) {
  return TRIP_CONFIG.legs.find((l) => l.id === id) ?? TRIP_CONFIG.legs[0]
}

// ── Base areas (for "top picks" grouping) ────────────────────────────────────

export interface BaseArea {
  key: string
  leg: LegId
  label: string
  towns: string[]
}

/** The four bases the trip is organised around, with the towns near each. */
export const BASE_AREAS: BaseArea[] = [
  {
    key: 'san-sebastian',
    leg: 'basque',
    label: 'San Sebastián',
    towns: [
      'San Sebastián',
      'Getaria',
      'Axpe (Atxondo)',
      'Astigarraga',
      'Hondarribia',
      'Errenteria',
      'Pasaia',
      'Hernani',
      'Zarautz',
      'Zumaia',
    ],
  },
  {
    key: 'bilbao',
    leg: 'basque',
    label: 'Bilbao',
    towns: [
      'Bilbao',
      'Bermeo',
      'Getxo',
      'Mundaka',
      'Bakio',
      'Gernika',
      'Plentzia',
      'Laguardia',
    ],
  },
  {
    key: 'mallorca',
    leg: 'balearic',
    label: 'Mallorca',
    towns: [
      'Palma de Mallorca',
      'Sóller',
      'Port de Sóller',
      'Deià',
      'Cala Deià',
      'Serra de Tramuntana',
      'Campos',
      'Manacor',
      'Santanyí',
      'Valldemossa',
      'Binissalem',
      'Consell',
      'Bunyola',
      'Alaró',
      'Pollença',
      'Alcúdia',
      'Port d’Alcúdia',
      'Canyamel',
      'Costa d’en Blanes',
    ],
  },
  {
    key: 'menorca',
    leg: 'balearic',
    label: 'Menorca',
    towns: [
      'Ciutadella de Menorca',
      'Fornells',
      'Mahón',
      'Alaior',
      'Es Mercadal',
      'Cala Galdana',
      'Cala en Porter',
      'Sant Lluís',
      'Sant Climent',
      'Es Castell',
      'Sant Tomàs',
      'Ferreries',
      'Es Grau',
    ],
  },
]

/** Which base area a place belongs to (by town, falling back to its leg). */
export function areaKeyForPlace(p: { town: string; leg: LegId }): string {
  const byTown = BASE_AREAS.find((a) => a.towns.includes(p.town))
  if (byTown) return byTown.key
  return BASE_AREAS.find((a) => a.leg === p.leg)?.key ?? BASE_AREAS[0].key
}
