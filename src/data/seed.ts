// ─────────────────────────────────────────────────────────────────────────────
// Two-leg trip seed: Basque Country (Aug 1–4) + Balearic Islands (Aug 4–7).
//
// Eat/Do are REAL, currently-operating places gathered from research (Google,
// travel forums, food blogs/vlogs) — each carries its `source` URL and is still
// re-verified against Google Places at runtime. Stays are NOT seeded here: they
// come live from Google Hotels via the price proxy (AC-confirmed, priced).
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
  tripName: 'Basque + Balearics — Aug 1–7',
  startDate: '2026-08-01',
  endDate: '2026-08-07',
  nights: 6,
  party: { adults: 2, children: 0 },
  region: 'Basque Country & Balearic Islands, Spain',
  legs: [
    {
      id: 'basque',
      name: 'Basque Country',
      region: 'Basque Country, Spain',
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      nights: 3,
      bases: ['San Sebastián', 'Bilbao'],
      homeBaseDefault: 'San Sebastián',
      towns: ['San Sebastián', 'Bilbao', 'Getaria'],
      travelToNext: 'Fly Bilbao/San Sebastián → Palma de Mallorca (~1h15m)',
    },
    {
      id: 'balearic',
      name: 'Balearic Islands',
      region: 'Mallorca & Menorca, Spain',
      startDate: '2026-08-04',
      endDate: '2026-08-07',
      nights: 3,
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

// ── Stay: sourced live from Google Hotels (proxy), so no curated seed here ────

export const STAY: SeedStay[] = []

// ── Eat ──────────────────────────────────────────────────────────────────────

type RawEat = {
  name: string
  town: string
  leg: LegId
  tier: SeedEat['tier']
  michelin?: number
  tags: string[]
  why: string
  source: string
}

const RAW_EAT: RawEat[] = [
  // ── Basque: San Sebastián ──
  { name: 'Bar Néstor', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'tortilla', 'txuleta'], why: 'Cult tiny bar for its once-a-day tortilla de patata, txuleta and Gernika peppers.', source: 'https://upnorthspain.com/eat-and-drink/best-bars-in-san-sebastian/' },
  { name: 'La Viña', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'cheesecake', 'wine'], why: 'Home of the original burnt Basque cheesecake, among Spain’s best.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Gandarías', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'classic'], why: 'Old-town institution with a lively pintxo counter and a sit-down dining room.', source: 'https://upnorthspain.com/eat-and-drink/best-bars-in-san-sebastian/' },
  { name: 'La Cuchara de San Telmo', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'cooked-to-order'], why: 'Famous no-counter bar; queue for the melting slow-cooked suckling pig.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Ganbara', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'wild-mushrooms'], why: 'Legendary surtido de setas — buttery wild mushrooms crowned with an egg yolk.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Borda Berri', town: 'San Sebastián', leg: 'basque', tier: 'local', tags: ['pintxos', 'hot-pintxos'], why: 'Made-to-order hot pintxos; famed for orzo “risotto” with Basque sheep cheeses.', source: 'https://www.theinfatuation.com/san-sebastian/guides/best-pintxos-san-sebastian-old-town' },
  { name: 'Arzak', town: 'San Sebastián', leg: 'basque', tier: 'marquee', michelin: 3, tags: ['tasting-menu', 'avant-garde'], why: 'Three Michelin stars — the Arzak family’s iconic New Basque cuisine.', source: 'https://www.eatingeurope.com/blog/michelin-star-restaurants-san-sebastian/' },
  { name: 'Akelarre', town: 'San Sebastián', leg: 'basque', tier: 'marquee', michelin: 3, tags: ['tasting-menu', 'sea-view'], why: 'Pedro Subijana’s clifftop three-star with sweeping Cantabrian Sea views.', source: 'https://sansebastianturismoa.eus/en/gastronomy/michelin-stars/' },
  { name: 'Asador Etxebarri', town: 'Axpe (Atxondo)', leg: 'basque', tier: 'marquee', tags: ['wood-fire-grill', 'seafood'], why: 'Temple of grilling ranked #2 in World’s 50 Best 2025 — worth the day trip.', source: 'https://www.theworlds50best.com/the-list/Asador-Etxebarri.html' },
  { name: 'Elkano', town: 'Getaria', leg: 'basque', tier: 'splurge', michelin: 1, tags: ['grilled-turbot', 'seafood'], why: 'One-star seafood grill famous for whole charcoal-grilled turbot.', source: 'https://www.tripadvisor.com/Restaurant_Review-g1064419-d1903917-Reviews-Restaurante_Elkano-Getaria.html' },
  { name: 'Sidrería Petritegi', town: 'Astigarraga', leg: 'basque', tier: 'local', tags: ['cider-house', 'txotx', 'grill'], why: 'Classic sagardotegi for the txotx cider-and-txuleta ritual, 5 km from the city.', source: 'https://doeatbetterexperience.com/blog/best-sidrerias-san-sebastian/' },
  // ── Basque: Bilbao ──
  { name: 'Gure Toki', town: 'Bilbao', leg: 'basque', tier: 'local', tags: ['pintxos', 'creative'], why: 'Award-winning Plaza Nueva bar; order the hot pintxos and the crab txalupa.', source: 'https://doeatbetterexperience.com/blog/casco-viejo-bilbao-food-guide/' },
  { name: 'Víctor Montes', town: 'Bilbao', leg: 'basque', tier: 'local', tags: ['pintxos', 'historic'], why: 'Bilbao institution since 1849 with a grand belle-époque pintxo bar.', source: 'https://www.latroupe.com/en/city-stories/best-pintxos-places-bilbao/' },
  { name: 'Café Iruña', town: 'Bilbao', leg: 'basque', tier: 'local', tags: ['pintxos', 'historic'], why: 'Iconic 1903 café with Mudéjar decor and grilled lamb pintxos morunos.', source: 'https://www.latroupe.com/en/city-stories/best-pintxos-places-bilbao/' },
  { name: 'Mercado de la Ribera', town: 'Bilbao', leg: 'basque', tier: 'local', tags: ['market', 'pintxos'], why: 'Huge riverside market with upstairs gastro-bars (gildas, txangurro, tortilla).', source: 'https://www.bilbaoturismo.net/BilbaoTurismo/en/gastronomic-shopping/-ribera-market' },
  { name: 'Nerua Guggenheim Bilbao', town: 'Bilbao', leg: 'basque', tier: 'marquee', michelin: 1, tags: ['tasting-menu', 'vegetable-forward'], why: 'One Michelin star inside the Guggenheim; Josean Alija’s precise Basque cuisine.', source: 'https://www.bilbaoturismo.net/BilbaoTurismo/en/home/michelin-starred-restaurants-in-bilbao' },
  { name: 'Mina', town: 'Bilbao', leg: 'basque', tier: 'splurge', michelin: 1, tags: ['tasting-menu', 'riverside'], why: 'One-star riverfront tasting menu; Álvaro Garrido’s intimate seasonal cooking.', source: 'https://bonviveur.com/es/noticias/restaurantes-de-bilbao-con-estrellas-michelin' },
  { name: 'Atelier Etxanobe', town: 'Bilbao', leg: 'basque', tier: 'splurge', michelin: 1, tags: ['tasting-menu', 'creative'], why: 'One-star creative tasting menus by Fernando Canales in a former glass factory.', source: 'https://atelieretxanobe.com/en/' },
  // ── Balearic: Mallorca ──
  { name: 'Marc Fosh', town: 'Palma de Mallorca', leg: 'balearic', tier: 'marquee', michelin: 1, tags: ['tasting-menu', 'seasonal-med'], why: 'Michelin-starred seasonal Mediterranean cooking in a 17th-c. convent.', source: 'https://guide.michelin.com/us/en/islas-baleares/palma/restaurant/marc-fosh' },
  { name: 'Adrián Quetglas', town: 'Palma de Mallorca', leg: 'balearic', tier: 'splurge', michelin: 1, tags: ['tasting-menu', 'wine-pairing'], why: 'Relaxed Michelin-starred bistro with 5- and 8-course tasting menus.', source: 'https://guide.michelin.com/en/islas-baleares/palma/restaurant/adrian-quetglas' },
  { name: 'Béns d’Avall', town: 'Sóller', leg: 'balearic', tier: 'marquee', michelin: 1, tags: ['sea-view', 'green-star', 'tasting-menu'], why: 'Clifftop Michelin star + Green Star with magical sunset sea views.', source: 'https://guide.michelin.com/gb/en/islas-baleares/soller/restaurant/bens-d-avall' },
  { name: 'Es Racó d’es Teix', town: 'Deià', leg: 'balearic', tier: 'splurge', michelin: 1, tags: ['terrace-view', 'mediterranean'], why: 'Michelin star in a Deià stone house with a terrace over the valley.', source: 'https://www.tripadvisor.com/Restaurant_Review-g187462-d1177079-Reviews-Es_Raco_d_es_Teix-Majorca.html' },
  { name: 'Ca’s Patró March', town: 'Cala Deià', leg: 'balearic', tier: 'splurge', tags: ['seafood', 'waterfront', 'romantic'], why: 'Cliffside shack above Cala Deià serving the day’s catch — arrive by boat or foot.', source: 'https://www.abc-mallorca.com/cas-patro-march-cala-deia/' },
  { name: 'Celler Sa Premsa', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', tags: ['traditional', 'rustic'], why: 'Rustic celler famed for hearty traditional Mallorcan dishes among giant wine barrels.', source: 'https://www.helencummins.com/best-restaurants-palma/' },
  { name: 'Patiki Beach', town: 'Port de Sóller', leg: 'balearic', tier: 'local', tags: ['chiringuito', 'beachfront'], why: 'Farm-to-table beach chiringuito with views over Port de Sóller and the Tramuntana.', source: 'https://www.themallorcan.com/blog/best-restaurants-in-port-soller' },
  { name: 'La Sang', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', tags: ['natural-wine', 'small-plates'], why: 'Mallorca’s first natural-wine bar and bottle shop, a hub for local winemakers.', source: 'https://starwinelist.com/wine-guide/great-wine-bars-and-restaurants-in-palma-de-mallorca' },
  { name: 'Maura', town: 'Palma de Mallorca', leg: 'balearic', tier: 'local', tags: ['mallorcan', 'modernist'], why: 'Beautiful modernist room serving a big selection of Mallorcan specialities.', source: 'https://paperplanesandcaramelwaffles.com/best-places-to-eat-and-drink-in-palma-mallorca/' },
  // ── Balearic: Menorca ──
  { name: 'Café Balear', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'local', tags: ['seafood', 'caldereta'], why: 'Harbourfront institution buying the day’s catch off local boats; famed lobster stew.', source: 'https://menorcaboattrip.com/best-seafood-restaurants-menorca/' },
  { name: 'S’Amarador', town: 'Ciutadella de Menorca', leg: 'balearic', tier: 'splurge', tags: ['seafood', 'caldereta'], why: 'Michelin-Guide seafood spot on the marina, prized for caldereta de langosta.', source: 'https://www.theinfatuation.com/menorca/guides/the-best-restaurants-on-menorca' },
  { name: 'Sa Llagosta', town: 'Fornells', leg: 'balearic', tier: 'marquee', tags: ['lobster', 'caldereta'], why: 'Fornells lobster specialist whose caldereta was praised by chef José Andrés.', source: 'https://www.gastromondiale.com/menorca-restaurants-sa-llagosta-and-others/' },
  { name: 'Es Cranc', town: 'Fornells', leg: 'balearic', tier: 'splurge', tags: ['seafood', 'caldereta'], why: 'Michelin-recommended kitchen known for lobster stew, seafood rice and octopus.', source: 'https://menorcanguide.com/best-restaurants-for-lobster-stew-in-menorca/' },
  { name: 'Ses Forquilles', town: 'Mahón', leg: 'balearic', tier: 'local', tags: ['tapas', 'seasonal'], why: 'Local-favourite casa de comidas in central Maó doing elevated small plates.', source: 'https://www.theinfatuation.com/menorca/reviews/ses-forquilles' },
  { name: 'S’Espigó', town: 'Mahón', leg: 'balearic', tier: 'local', tags: ['seafood', 'harbourfront'], why: 'Waterfront Maó spot for grilled fish and caldereta de pescado with port views.', source: 'https://www.homemenorca.com/news-detail/where-to-eat-in-mahon-harbour-top-restaurants-by-the-water/52891' },
  { name: 'Torralbenc', town: 'Alaior', leg: 'balearic', tier: 'marquee', tags: ['fine-dining', 'vineyard'], why: 'Michelin-Guide agroturismo blending Basque technique and Menorcan roots by the vines.', source: 'https://guide.michelin.com/en/islas-baleares/cala-en-porter/restaurant/torralbenc' },
]

export const EAT: SeedEat[] = RAW_EAT.map((e) => ({
  id: slug(e.name),
  category: 'eat',
  name: e.name,
  town: e.town,
  leg: e.leg,
  tier: e.tier,
  michelin: e.michelin,
  tags: e.tags,
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
  interests: string[]
  why: string
  source: string
}

const RAW_DO: RawDo[] = [
  // ── Basque: San Sebastián ──
  { name: 'La Concha Beach', town: 'San Sebastián', leg: 'basque', type: 'beach', interests: ['beaches', 'coastal walks'], why: 'Europe’s most beautiful urban beach with an elegant 1,300 m promenade.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/san-sebastian-beaches/' },
  { name: 'Monte Igueldo', town: 'San Sebastián', leg: 'basque', type: 'sight', interests: ['culture'], why: 'Ride the 1912 funicular for the classic panorama over the bay.', source: 'https://sansebastianturismoa.eus/en/to-do/hills/mount-igeldo/' },
  { name: 'Peine del Viento', town: 'San Sebastián', leg: 'basque', type: 'sight', interests: ['culture', 'coastal walks'], why: 'Chillida’s iron sculptures anchored in the rocks at the bay’s western end.', source: 'https://www.sansebastian.travel/en/peine-del-viento/' },
  { name: 'San Telmo Museoa', town: 'San Sebastián', leg: 'basque', type: 'museum', interests: ['culture'], why: 'The Basque Country’s oldest museum, in a 16th-c. convent below Monte Urgull.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/san-telmo-museoa/' },
  { name: 'Getaria & Txomin Etxaniz winery', town: 'Getaria', leg: 'basque', type: 'wine', interests: ['wine'], why: 'Charming fishing town, birthplace of Txakoli; tour the hillside winery with a tasting.', source: 'https://www.txominetxaniz.com/en/enoturismoa/' },
  { name: 'Monte Ulia coastal walk', town: 'San Sebastián', leg: 'basque', type: 'walk', interests: ['coastal walks'], why: 'Clifftop whaler’s-lookout walk on the Camino coastal route.', source: 'https://www.packing-up-the-pieces.com/monte-ulia-hike-san-sebastian/' },
  { name: 'Hondarribia', town: 'Hondarribia', leg: 'basque', type: 'town', interests: ['culture', 'pintxos'], why: 'Colorful medieval fishing town with a photogenic marina and pintxos street.', source: 'https://www.barcelo.com/guia-turismo/en/spain/san-sebastian/things-to-do/hondarribia/' },
  { name: 'Zurriola Beach', town: 'San Sebastián', leg: 'basque', type: 'watersport', interests: ['beaches'], why: 'The city’s Atlantic surf beach in Gros, popular for lessons.', source: 'https://carameltrail.com/san-sebastian-surf-spots-la-zurriola-in-the-cantabrian-sea/' },
  { name: 'Santa Clara Island', town: 'San Sebastián', leg: 'basque', type: 'boat', interests: ['beaches'], why: 'Short seasonal ferry to the island in the bay for trails and a tiny beach.', source: 'https://www.adventurouskate.com/things-to-do-in-san-sebastian-spain/' },
  // ── Basque: Bilbao ──
  { name: 'Guggenheim Museum Bilbao', town: 'Bilbao', leg: 'basque', type: 'museum', interests: ['culture'], why: 'Frank Gehry’s titanium landmark and world-class contemporary art.', source: 'https://thislifeintrips.com/what-to-do-in-bilbao-24-hours-itinerary/' },
  { name: 'Casco Viejo (Siete Calles)', town: 'Bilbao', leg: 'basque', type: 'town', interests: ['culture'], why: 'Bilbao’s medieval old town of seven streets, cathedral and pintxos lanes.', source: 'https://thetravelista.net/travel/a-48-hour-guide-to-bilbao/' },
  { name: 'Funicular de Artxanda', town: 'Bilbao', leg: 'basque', type: 'sight', interests: ['culture'], why: 'Historic funicular to a hilltop viewpoint over the whole city.', source: 'https://bilbaoinsider.com/mount-artxanda-guide/' },
  { name: 'Azkuna Zentroa', town: 'Bilbao', leg: 'basque', type: 'museum', interests: ['culture'], why: 'Philippe Starck-designed cultural hub in a former wine warehouse.', source: 'https://madhattersnyc.com/blog/things-to-do-bilbao' },
  { name: 'San Juan de Gaztelugatxe', town: 'Bermeo', leg: 'basque', type: 'sight', interests: ['coastal walks'], why: '241-step causeway to a clifftop hermitage (GoT’s Dragonstone).', source: 'https://www.getyourguide.com/bilbao-l93/bilbao-san-juan-de-gaztelugatxe-and-txakoli-wine-day-trip-t421363/' },
  { name: 'Puente Bizkaia (Vizcaya Bridge)', town: 'Getxo', leg: 'basque', type: 'sight', interests: ['culture'], why: 'UNESCO transporter bridge — the world’s first — in seaside Getxo.', source: 'https://bea-adventurous.com/day-trips-from-bilbao-2/' },
  // ── Balearic: Mallorca ──
  { name: 'Sa Calobra & Serra de Tramuntana drive', town: 'Serra de Tramuntana', leg: 'balearic', type: 'sight', interests: ['coastal walks', 'coves'], why: 'UNESCO mountain drive with 26 hairpins and the “tie-knot” bridge; go early.', source: 'https://crazyroads.net/sa-calobra-road/' },
  { name: 'Ferrocarril de Sóller', town: 'Sóller', leg: 'balearic', type: 'sight', interests: ['culture'], why: '1912 wooden train through citrus groves, then a historic tram to the port.', source: 'https://trendesoller.com/eng/routes/train' },
  { name: 'Cala Deià', town: 'Deià', leg: 'balearic', type: 'beach', interests: ['coves', 'beaches'], why: 'Small rocky cove with crystal water and cliffside restaurants; arrive early.', source: 'https://www.abc-mallorca.com/cala-deia/' },
  { name: 'Es Trenc', town: 'Campos', leg: 'balearic', type: 'beach', interests: ['beaches'], why: 'Mallorca’s last big natural beach — 2 km of white sand and turquoise water.', source: 'https://www.mallorca-beaches.com/en/es-trenc/' },
  { name: 'Cala Varques', town: 'Manacor', leg: 'balearic', type: 'beach', interests: ['coves', 'coastal walks'], why: 'Undeveloped turquoise cove reached on foot; nearby sea caves and rock arch.', source: 'https://www.calavarques.com/' },
  { name: 'Palma Cathedral (La Seu)', town: 'Palma de Mallorca', leg: 'balearic', type: 'sight', interests: ['culture'], why: 'Towering Gothic cathedral with a Gaudí-designed altar canopy and terrace tours.', source: 'https://catedraldemallorca.org/en/visits/tours/' },
  { name: 'Valldemossa & Carthusian Monastery', town: 'Valldemossa', leg: 'balearic', type: 'town', interests: ['culture'], why: 'Postcard mountain village with the charterhouse where Chopin wintered in 1838.', source: 'https://www.mallorca.com/en/guide/places/valldemossa' },
  { name: 'Bodegas José L. Ferrer', town: 'Binissalem', leg: 'balearic', type: 'wine', interests: ['wine'], why: 'D.O. Binissalem winery (est. 1931) with guided cellar tours and tastings.', source: 'https://www.vinosferrer.com/en/wine-tourism/visits-and-tasting/' },
  { name: 'Palma Bay sunset boat trip', town: 'Palma de Mallorca', leg: 'balearic', type: 'boat', interests: ['coves', 'beaches'], why: 'Half-day or sunset charter stopping to swim in hidden west-coast coves.', source: 'https://www.seemallorca.com/boat-trips/guide' },
  // ── Balearic: Menorca ──
  { name: 'Cala Macarella & Macarelleta', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'beach', interests: ['coves', 'beaches'], why: 'Menorca’s postcard turquoise coves; reach by bus, boat or a coastal walk.', source: 'https://www.alongdustyroads.com/posts/cala-macarella-macarelleta-beach' },
  { name: 'Cala Turqueta', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'beach', interests: ['coves', 'beaches'], why: 'Sheltered white-sand cove with clear turquoise water, a short walk from parking.', source: 'https://www.artiemhotels.com/en/blog/discover-the-beauty-of-cala-turqueta-a-paradise-in-menorca' },
  { name: 'Cala Pregonda', town: 'Es Mercadal', leg: 'balearic', type: 'beach', interests: ['coves', 'coastal walks'], why: 'Wild “Martian” beach of red-orange sand against turquoise water; walk in from Binimel·là.', source: 'https://www.alongdustyroads.com/posts/cala-pregonda-menorca' },
  { name: 'Camí de Cavalls: Cala Galdana → Macarella', town: 'Cala Galdana', leg: 'balearic', type: 'walk', interests: ['coastal walks', 'coves'], why: '~45-min clifftop coastal walk linking Cala Galdana to the turquoise calas.', source: 'https://www.lelongweekend.com/cala-macarella-macarelleta-menorca/' },
  { name: 'Ciutadella Old Town', town: 'Ciutadella de Menorca', leg: 'balearic', type: 'town', interests: ['culture'], why: 'Walled centre with the Gothic cathedral, Plaça des Born and arched Ses Voltes.', source: 'https://www.heatheronhertravels.com/things-to-do-in-ciutadella-menorca-spain/' },
  { name: 'Port of Maó harbour boat trip', town: 'Mahón', leg: 'balearic', type: 'boat', interests: ['coves'], why: 'Glass-bottom catamaran around the Mediterranean’s largest natural harbour.', source: 'https://www.yellowcatamarans.com/en/trip-around-the-port' },
  { name: 'Cova d’en Xoroi', town: 'Cala en Porter', leg: 'balearic', type: 'sight', interests: ['culture', 'coves'], why: 'Cliffside cave bar terraces over the sea, famed for romantic sunset cocktails.', source: 'https://www.covadenxoroi.com/en' },
  { name: 'Monte Toro', town: 'Es Mercadal', leg: 'balearic', type: 'sight', interests: ['culture'], why: 'Menorca’s 358 m summit with a sanctuary and 360° island panoramas.', source: 'https://www.illesbalears.travel/en/menorca/sanctuary-monte-toro' },
  { name: 'Bodegas Binifadet', town: 'Sant Lluís', leg: 'balearic', type: 'wine', interests: ['wine'], why: 'Menorca’s best-known winery with vineyard tours, tastings and a wine-bar restaurant.', source: 'https://binifadet.com/en' },
  { name: 'Xoriguer Gin Distillery', town: 'Mahón', leg: 'balearic', type: 'wine', interests: ['culture'], why: 'Portside distillery of Gin de Mahón with free tastings of gin and local liqueurs.', source: 'https://www.tripadvisor.com/Attraction_Review-g642211-d3637468-Reviews-Xoriguer_Gin_Factory-Mahon.html' },
]

export const DO: SeedDo[] = RAW_DO.map((d) => ({
  id: slug(d.name),
  category: 'do',
  name: d.name,
  town: d.town,
  leg: d.leg,
  type: d.type,
  interests: d.interests,
  tags: d.interests,
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
    towns: ['San Sebastián', 'Getaria', 'Axpe (Atxondo)', 'Astigarraga', 'Hondarribia'],
  },
  {
    key: 'bilbao',
    leg: 'basque',
    label: 'Bilbao',
    towns: ['Bilbao', 'Bermeo', 'Getxo'],
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
      'Valldemossa',
      'Binissalem',
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
    ],
  },
]

/** Which base area a place belongs to (by town, falling back to its leg). */
export function areaKeyForPlace(p: { town: string; leg: LegId }): string {
  const byTown = BASE_AREAS.find((a) => a.towns.includes(p.town))
  if (byTown) return byTown.key
  return BASE_AREAS.find((a) => a.leg === p.leg)?.key ?? BASE_AREAS[0].key
}
