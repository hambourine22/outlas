import type { Guides } from "./types";

/* -----------------------------------------------------------------
 * Guides — individual mountain guides and small guiding businesses
 * registered with Oütlas. Service providers in the brand's provider
 * taxonomy. Render as sand pins on the map.
 *
 * World set (2026-10-31): extended from the 4 Scottish seeds with
 * real-named guide bureaus and alpine schools across the top-15
 * world resorts. See docs/briefs/guides-near-resorts.md.
 * ---------------------------------------------------------------- */

function g(overrides: Partial<Guides>): Guides {
  return {
    name: "",
    slug: "",
    item_id: "",
    disciplines: "",
    languages: "",
    website: "",
    phone: "",
    rate_per_day: "",
    bio: "",
    regions: "",
    image_url: "",
    lat: 0,
    long: 0,
    status: "published",
    ...overrides,
  };
}

// --- Scotland (4) — original seeded individuals -----------------------
const SCOTLAND: Guides[] = [
  g({
    name: "Cairngorm Guides — Angus Kerr",
    slug: "cairngorm-guides-angus-kerr",
    item_id: "g-angus-kerr",
    disciplines: "Ski touring, winter mountaineering, avalanche awareness",
    languages: "English, Gaelic",
    website: "https://cairngormguides.example",
    phone: "+44 1479 810101",
    rate_per_day: "£340 / day · 1 – 2 clients",
    bio: "BMG qualified. Twenty winters in the Northern Corries. Teaches the Oütlas snow stability course each February.",
    regions: "Cairngorms",
    lat: 57.1240, long: -3.6730,
  }),
  g({
    name: "West Highland Alpine — Rhona MacLeod",
    slug: "west-highland-alpine-rhona-macleod",
    item_id: "g-rhona-macleod",
    disciplines: "Ski touring, ice climbing, splitboard touring",
    languages: "English, French",
    website: "https://westhighlandalpine.example",
    phone: "+44 1397 701717",
    rate_per_day: "£360 / day · 1 – 2 clients",
    bio: "Based in Fort William. Specialises in Nevis Range backcountry and the Mamores. UIAGM accreditation.",
    regions: "Lochaber",
    lat: 56.8220, long: -5.0330,
  }),
  g({
    name: "Glencoe Snow School — Ewan Taggart",
    slug: "glencoe-snow-school-ewan-taggart",
    item_id: "g-ewan-taggart",
    disciplines: "Beginner snow safety, group avalanche awareness, courses",
    languages: "English",
    website: "https://glencoesnowschool.example",
    phone: "+44 1855 851515",
    rate_per_day: "£180 / day · small groups",
    bio: "Teaches the entry-level snow safety course each weekend through winter. Partnered with Glencoe Mountain Resort.",
    regions: "Glen Coe",
    lat: 56.6540, long: -4.9080,
  }),
  g({
    name: "Dàmhair Mountain — Mhairi Macdonald",
    slug: "damhair-mountain-mhairi-macdonald",
    item_id: "g-mhairi-macdonald",
    disciplines: "Women-only backcountry days, splitboard progression",
    languages: "English, Spanish",
    website: "https://damhair.example",
    phone: "+44 1479 870303",
    rate_per_day: "£320 / day · 1 – 3 clients",
    bio: "Runs women-only backcountry days from Aviemore through the season. Oütlas community guide.",
    regions: "Cairngorms",
    lat: 57.1960, long: -3.8320,
  }),
];

// --- France · Alps (3) ------------------------------------------------
const FRANCE: Guides[] = [
  g({
    name: "Compagnie des Guides de Chamonix",
    slug: "compagnie-des-guides-chamonix",
    item_id: "g-compagnie-guides-chamonix",
    disciplines: "Ski touring, alpinism, off-piste, ice climbing, rescue",
    languages: "French, English, Italian, German",
    bio: "World's oldest guiding bureau (1821). Hundreds of IFMGA guides working across the Mont Blanc massif, the Vallée Blanche, the Grands Montets.",
    regions: "Chamonix, Mont Blanc massif",
    lat: 45.9227, long: 6.8696,
  }),
  g({
    name: "Bureau des Guides de Val d'Isère",
    slug: "bureau-des-guides-val-disere",
    item_id: "g-bureau-guides-val-disere",
    disciplines: "Ski touring, freeride, off-piste, mountaineering",
    languages: "French, English",
    bio: "The historic Val d'Isère guides bureau — ski touring across the Espace Killy, freeride off the Rocher de Bellevarde and the Face de Bellevarde.",
    regions: "Val d'Isère, Espace Killy",
    lat: 45.4489, long: 6.9792,
  }),
  g({
    name: "Bureau des Guides de La Grave",
    slug: "bureau-des-guides-la-grave",
    item_id: "g-bureau-guides-la-grave",
    disciplines: "Freeride ski guiding, ski mountaineering, alpinism",
    languages: "French, English",
    bio: "Guides specialising in the Vallons de la Meije and the unmarked slopes of La Grave — mandatory partners for anyone riding the Girose cable car off-piste.",
    regions: "La Grave, Écrins",
    lat: 45.0458, long: 6.3061,
  }),
];

// --- Switzerland (3) --------------------------------------------------
const SWITZERLAND: Guides[] = [
  g({
    name: "Zermatt Alpin Center",
    slug: "zermatt-alpin-center",
    item_id: "g-zermatt-alpin-center",
    disciplines: "Ski touring, Haute Route, alpinism, Matterhorn",
    languages: "German, English, French, Italian",
    bio: "The Zermatt Bergführer collective. Ski touring across the Monte Rosa group, the Haute Route to Chamonix, and the Matterhorn in summer.",
    regions: "Zermatt, Valais",
    lat: 46.0207, long: 7.7491,
  }),
  g({
    name: "La Fantastique — Verbier Guides",
    slug: "la-fantastique-verbier",
    item_id: "g-la-fantastique-verbier",
    disciplines: "Freeride ski guiding, ski touring, Haute Route",
    languages: "French, English, German",
    bio: "Verbier's main freeride bureau. Guides across the Four Valleys, the Tortin couloirs, and the Haute Route start to Chamonix.",
    regions: "Verbier, Four Valleys",
    lat: 46.0961, long: 7.2286,
  }),
  g({
    name: "Grindelwald Sports — Bergführer",
    slug: "grindelwald-sports-bergfuhrer",
    item_id: "g-grindelwald-sports-bergfuhrer",
    disciplines: "Ski touring, alpinism, Eiger North Face, ice climbing",
    languages: "German, English, French",
    bio: "Grindelwald's bergführer bureau — ski touring and alpinism around the Jungfrau, Eiger and Mönch.",
    regions: "Grindelwald, Bernese Oberland",
    lat: 46.6244, long: 8.0414,
  }),
];

// --- Austria (2) ------------------------------------------------------
const AUSTRIA: Guides[] = [
  g({
    name: "Arlberg Alpin Zentrum — St. Anton",
    slug: "arlberg-alpin-zentrum-st-anton",
    item_id: "g-arlberg-alpin-zentrum",
    disciplines: "Ski touring, off-piste, freeride, avalanche courses",
    languages: "German, English",
    bio: "St. Anton guides bureau — off-piste across the Arlberg, ski touring into the Verwall and Lechtaler Alps.",
    regions: "St. Anton, Arlberg",
    lat: 47.1283, long: 10.2608,
  }),
  g({
    name: "Peter Habeler Alpinschule Mayrhofen",
    slug: "peter-habeler-alpinschule-mayrhofen",
    item_id: "g-peter-habeler-alpinschule",
    disciplines: "Ski touring, alpinism, freeride, ice climbing",
    languages: "German, English",
    bio: "Mayrhofen alpine school founded by Peter Habeler. Ski touring in the Zillertal, freeride on Hintertux, big-mountain alpinism in the Dolomites.",
    regions: "Mayrhofen, Zillertal",
    lat: 47.1667, long: 11.8667,
  }),
];

// --- Italy (2) --------------------------------------------------------
const ITALY: Guides[] = [
  g({
    name: "Guide Alpine Cortina",
    slug: "guide-alpine-cortina",
    item_id: "g-guide-alpine-cortina",
    disciplines: "Ski touring, freeride, Dolomites alpinism",
    languages: "Italian, English, German",
    bio: "Cortina's guide bureau. Freeride across the Tofane and Faloria, ski touring and ice climbing in the surrounding Dolomites.",
    regions: "Cortina, Dolomites",
    lat: 46.5406, long: 12.1356,
  }),
  g({
    name: "Gruppo Guide Alpine Val Gardena",
    slug: "gruppo-guide-alpine-val-gardena",
    item_id: "g-gruppo-guide-alpine-val-gardena",
    disciplines: "Ski touring, Sella Ronda freeride, Dolomites alpinism",
    languages: "Italian, German, English, Ladin",
    bio: "Val Gardena guide collective — ski touring across the Sella and Gardena groups, summer rock climbing on the Vajolet Towers.",
    regions: "Val Gardena, Dolomites",
    lat: 46.5600, long: 11.7306,
  }),
];

// --- USA (4) ----------------------------------------------------------
const USA: Guides[] = [
  g({
    name: "Jackson Hole Mountain Guides",
    slug: "jackson-hole-mountain-guides",
    item_id: "g-jackson-hole-mountain-guides",
    disciplines: "Backcountry ski touring, splitboard, avalanche courses, ice climbing",
    languages: "English",
    bio: "Jackson's long-standing guide service — backcountry days across the Tetons, Grand Teton ski descents and AIARE avalanche courses.",
    regions: "Jackson Hole, Tetons",
    lat: 43.4815, long: -110.7627,
  }),
  g({
    name: "Exum Mountain Guides",
    slug: "exum-mountain-guides",
    item_id: "g-exum-mountain-guides",
    disciplines: "Grand Teton climbing, ski mountaineering, backcountry",
    languages: "English",
    bio: "Grand Teton's oldest guide service (since 1931). Ski descents, Grand Teton guided climbs, Yellowstone trips.",
    regions: "Grand Teton National Park",
    lat: 43.7378, long: -110.8044,
  }),
  g({
    name: "Aspen Alpine Guides",
    slug: "aspen-alpine-guides",
    item_id: "g-aspen-alpine-guides",
    disciplines: "Backcountry ski touring, hut trips, Elk Mountains alpinism",
    languages: "English",
    bio: "Aspen's AMGA-certified guide service — Elk Mountains backcountry, 10th Mountain Division hut-to-hut traverses, Highland Bowl objectives.",
    regions: "Aspen, Elk Mountains",
    lat: 39.1911, long: -106.8175,
  }),
  g({
    name: "Big Sky Backcountry Guides",
    slug: "big-sky-backcountry-guides",
    item_id: "g-big-sky-backcountry-guides",
    disciplines: "Backcountry ski touring, splitboard, avalanche courses",
    languages: "English",
    bio: "Big Sky's backcountry guide service — touring in the Spanish Peaks and Beehive Basin, AIARE courses, Lone Peak objectives.",
    regions: "Big Sky, Montana",
    lat: 45.2805, long: -111.3085,
  }),
];

// --- Canada (1) -------------------------------------------------------
const CANADA: Guides[] = [
  g({
    name: "Whistler Alpine Guides Bureau",
    slug: "whistler-alpine-guides-bureau",
    item_id: "g-whistler-alpine-guides-bureau",
    disciplines: "Backcountry ski touring, splitboard, Spearhead Traverse, heli-touring",
    languages: "English, French",
    bio: "Whistler's ACMG-certified guide collective — Spearhead Traverse, Garibaldi Park ski touring, Blackcomb backcountry objectives.",
    regions: "Whistler, Coast Range",
    lat: 50.1163, long: -122.9574,
  }),
];

// --- Japan (2) --------------------------------------------------------
const JAPAN: Guides[] = [
  g({
    name: "Niseko Backcountry Guides",
    slug: "niseko-backcountry-guides",
    item_id: "g-niseko-backcountry-guides",
    disciplines: "Niseko backcountry, Yotei volcano, splitboard, avalanche safety",
    languages: "English, Japanese",
    bio: "Niseko backcountry collective — the Yotei volcano skin, Annupuri sidecountry and Chisenupuri objectives beyond the resort boundary.",
    regions: "Niseko, Hokkaido",
    lat: 42.8614, long: 140.6986,
  }),
  g({
    name: "Evergreen Outdoor Center — Hakuba",
    slug: "evergreen-outdoor-center-hakuba",
    item_id: "g-evergreen-hakuba",
    disciplines: "Backcountry ski touring, Hakuba avalanche safety, Tsugaike objectives",
    languages: "English, Japanese",
    bio: "Hakuba-based guide and outdoor school — backcountry days in the Northern Japan Alps and multi-day Hakuba ski-touring programmes.",
    regions: "Hakuba, Nagano",
    lat: 36.6986, long: 137.8328,
  }),
];

// --- New Zealand (1) --------------------------------------------------
const NEW_ZEALAND: Guides[] = [
  g({
    name: "Alpine Guides New Zealand",
    slug: "alpine-guides-new-zealand",
    item_id: "g-alpine-guides-nz",
    disciplines: "Ski touring, ski mountaineering, Mt Cook / Aoraki, Tasman Glacier",
    languages: "English",
    bio: "NZ Mountain Guides Association collective — ski touring across the Southern Alps, Tasman and Fox glacier descents, Mt Cook / Aoraki alpinism.",
    regions: "Mt Hutt, Aoraki/Mt Cook",
    lat: -43.7340, long: 170.0960,
  }),
];

export const GUIDES: Guides[] = [
  ...SCOTLAND,
  ...FRANCE,
  ...SWITZERLAND,
  ...AUSTRIA,
  ...ITALY,
  ...USA,
  ...CANADA,
  ...JAPAN,
  ...NEW_ZEALAND,
];
