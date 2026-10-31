import type { Resorts, OperationalStatus } from "@/app/definitions/mapboxDefinitions";
import type { Activity } from "@/app/content/map/types";

// --- Compact factory ------------------------------------------------------
// Legacy Resorts type carries ~30 fields (score dimensions, cost breakdowns,
// opening_times, scraper leftovers) that aren't rendered in the preview
// panel. We keep them for backwards compatibility with the Postgres schema
// but default them here so each record only names what the UI needs.

const emptyCost = { "Day Pass": "—", "Season Pass": "—" };

type ShortResort = {
  n: string;                   // name
  s: string;                   // slug (also used as id suffix)
  lat: number;
  long: number;
  alt?: string;                // altitude (free-text)
  country: string;             // human-readable country / region
  op: OperationalStatus;
  from?: string;               // season start "MM-DD"
  to?: string;                 // season end   "MM-DD"
  acts: Activity[];            // 3–6 major activities
  // Top-5 stats (resort-stats-pack, 2026-10-31) — optional per spec; a
  // missing stat omits its StatStrip cell.
  peak_m?: number;
  vertical_m?: number;
  terrain_km?: number;
  lifts?: number;
  snowfall_cm?: number;
};

function r({ n, s, lat, long, alt, country, op, from, to, acts, peak_m, vertical_m, terrain_km, lifts, snowfall_cm }: ShortResort): Resorts {
  return {
    operational_status: op,
    season_from: from,
    season_to: to,
    activities: acts,
    country,
    peak_m,
    vertical_m,
    terrain_km,
    lifts,
    snowfall_cm,

    name: n,
    slug: s,
    item_id: `r-${s}`,
    lat,
    long,
    altitude: alt ?? "—",
    region: country,
    status: "published",
    publish: "",

    // Legacy fields the panel never reads — defaulted.
    total_score: 0,
    sustainability_score: 0,
    family_score: 0,
    cost: emptyCost,
    accessibility: 0,
    female_friendly: 0,
    lack_racism: 0,
    lgbtq_friendly: 0,
    lack_crime: 0,
    nearest_rail_station: "",
    nearest_charge_point: "",
    number_rental_stores: 0,
    number_of_repair_stores: 0,
    opening_times: "",
    price_index: "",
    currency: "",
    cover_image: "",
    image_url: "",
    featured_rental_store: "",
    other_rental_stores: "",
    featured_repair_store: "",
    other_repair_stores: "",
    internet_quality: "",
    snowfall_per_year: "",
    rated_by_outsiders: "",
    hospitals_medical_centres: "",
    places_to_work: "",
    sustainability_score_two: "",
    rentals_two: "",
    sustainability_score_copy: "",
  };
}

// Season presets — one honest window per climate band, so edits scale by
// region rather than record-by-record.
const S = {
  scotland:         ["12-10", "04-15"],
  alps:             ["12-01", "04-30"],
  alpsGlacier:      ["06-15", "08-31"], // summer glacier window; year-round resorts set op:"year-round" directly
  usRockies:        ["11-20", "04-25"],
  usEast:           ["12-01", "04-10"],
  usSierra:         ["11-20", "05-10"],
  japan:            ["11-25", "05-05"],
  scandinavia:      ["11-20", "04-25"],
  scandinaviaNorth: ["10-15", "05-10"],
  pyrenees:         ["12-01", "04-15"],
  balkans:          ["12-10", "04-10"],
  korea:            ["12-01", "03-15"],
  china:            ["11-25", "03-30"],
  caucasus:         ["12-10", "04-15"],
  mideast:          ["12-15", "03-30"],
  southern:         ["06-15", "10-15"],
} satisfies Record<string, [string, string]>;

// --- Scotland (5) --------------------------------------------------------
// Stats sourced from each resort's own site + Wikipedia. Numbers that are
// approximate (Scottish snowfall varies wildly year-to-year) are rounded
// to the nearest 10 cm with the honest understanding that these are
// multi-year averages, not forecasts.
const SCOTLAND: Resorts[] = [
  r({ n: "Cairngorm Mountain",        s: "cairngorm-mountain",       lat: 57.1182, long: -3.6761, alt: "1,245m", country: "Scotland",
      op: "seasonal", from: S.scotland[0], to: S.scotland[1],
      acts: ["ski","snowboard","hike","trail-run"],
      peak_m: 1245, vertical_m: 462, terrain_km: 30, lifts: 11, snowfall_cm: 180 }),
  r({ n: "Glencoe Mountain Resort",   s: "glencoe-mountain-resort",  lat: 56.6453, long: -4.8970, alt: "1,108m", country: "Scotland",
      op: "seasonal", from: S.scotland[0], to: S.scotland[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1108, vertical_m: 400, terrain_km: 20, lifts: 7, snowfall_cm: 250 }),
  r({ n: "Nevis Range",               s: "nevis-range",              lat: 56.8192, long: -5.0083, alt: "1,221m", country: "Scotland",
      op: "seasonal", from: S.scotland[0], to: S.scotland[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 1221, vertical_m: 566, terrain_km: 35, lifts: 11, snowfall_cm: 180 }),
  r({ n: "Glenshee Ski Centre",       s: "glenshee-ski-centre",      lat: 56.8694, long: -3.4225, alt: "1,068m", country: "Scotland",
      op: "seasonal", from: S.scotland[0], to: S.scotland[1],
      acts: ["ski","snowboard","hike"],
      peak_m: 1068, vertical_m: 440, terrain_km: 40, lifts: 21, snowfall_cm: 160 }),
  r({ n: "The Lecht",                 s: "the-lecht",                lat: 57.2057, long: -3.2375, alt: "793m",   country: "Scotland",
      op: "seasonal", from: S.scotland[0], to: S.scotland[1],
      acts: ["ski","snowboard","hike"],
      peak_m: 793, vertical_m: 200, terrain_km: 20, lifts: 13, snowfall_cm: 130 }),
];

// --- Alps · France (10) ---------------------------------------------------
// Stats from each resort's own site + Wikipedia. Peak = highest lift-served
// point. Terrain = groomed pistes within the resort or linked domain,
// stated per-resort for Trois Vallées / Paradiski / Espace Killy (not the
// linked total — otherwise two resorts share the same number).
const FRANCE: Resorts[] = [
  r({ n: "Chamonix-Mont-Blanc",       s: "chamonix-mont-blanc",      lat: 45.9237, long: 6.8694,  alt: "1,035m", country: "France",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","climb","trail-run"],
      peak_m: 3842, vertical_m: 2807, terrain_km: 155, lifts: 48, snowfall_cm: 900 }),
  r({ n: "Val d'Isère",               s: "val-disere",               lat: 45.4489, long: 6.9792,  alt: "1,850m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3456, vertical_m: 1606, terrain_km: 150, lifts: 43, snowfall_cm: 750 }),
  r({ n: "Tignes",                    s: "tignes",                   lat: 45.4675, long: 6.9064,  alt: "2,100m", country: "France",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","bike"],
      peak_m: 3456, vertical_m: 1550, terrain_km: 150, lifts: 42, snowfall_cm: 750 }),
  r({ n: "Courchevel",                s: "courchevel",               lat: 45.4154, long: 6.6347,  alt: "1,850m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2738, vertical_m: 1438, terrain_km: 150, lifts: 56, snowfall_cm: 500 }),
  r({ n: "Val Thorens",               s: "val-thorens",              lat: 45.2975, long: 6.5806,  alt: "2,300m", country: "France",
      op: "seasonal", from: "11-20", to: "05-05",
      acts: ["ski","snowboard","splitboard","hike"],
      peak_m: 3230, vertical_m: 930, terrain_km: 150, lifts: 30, snowfall_cm: 550 }),
  r({ n: "Méribel",                   s: "meribel",                  lat: 45.3961, long: 6.5658,  alt: "1,450m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2952, vertical_m: 1502, terrain_km: 150, lifts: 50, snowfall_cm: 500 }),
  r({ n: "La Plagne",                 s: "la-plagne",                lat: 45.5069, long: 6.6792,  alt: "2,100m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3250, vertical_m: 2000, terrain_km: 225, lifts: 86, snowfall_cm: 500 }),
  r({ n: "Les Arcs",                  s: "les-arcs",                 lat: 45.5720, long: 6.8160,  alt: "1,800m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3250, vertical_m: 2050, terrain_km: 200, lifts: 54, snowfall_cm: 500 }),
  r({ n: "Alpe d'Huez",               s: "alpe-dhuez",               lat: 45.0909, long: 6.0693,  alt: "1,860m", country: "France",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 3330, vertical_m: 2080, terrain_km: 250, lifts: 69, snowfall_cm: 500 }),
  // La Grave's "terrain" is almost all off-piste served by the La Meije
  // téléphérique — only ~10km is formally groomed. Honest number, not
  // zero.
  r({ n: "La Grave",                  s: "la-grave",                 lat: 45.0458, long: 6.3061,  alt: "1,450m", country: "France",
      op: "seasonal", from: "12-20", to: "04-30",
      acts: ["ski","splitboard","hike","climb"],
      peak_m: 3600, vertical_m: 2150, terrain_km: 10, lifts: 2, snowfall_cm: 600 }),
];

// --- Alps · Switzerland (10) ---------------------------------------------
// Terrain reflects the Swiss-side domain per resort — Zermatt-Cervinia and
// 4 Vallées numbers are split so two linked resorts don't double-count the
// same pistes.
const SWITZERLAND: Resorts[] = [
  r({ n: "Zermatt",                   s: "zermatt",                  lat: 46.0207, long: 7.7491,  alt: "1,620m", country: "Switzerland",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","bike","climb"],
      peak_m: 3883, vertical_m: 2281, terrain_km: 200, lifts: 36, snowfall_cm: 480 }),
  r({ n: "Verbier",                   s: "verbier",                  lat: 46.0961, long: 7.2286,  alt: "1,500m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","splitboard","hike","bike","trail-run"],
      peak_m: 3330, vertical_m: 1830, terrain_km: 195, lifts: 36, snowfall_cm: 580 }),
  r({ n: "St. Moritz",                s: "st-moritz",                lat: 46.4983, long: 9.8322,  alt: "1,822m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","climb","sail"],
      peak_m: 3303, vertical_m: 1500, terrain_km: 350, lifts: 60, snowfall_cm: 300 }),
  r({ n: "Davos Klosters",            s: "davos-klosters",           lat: 46.7988, long: 9.8355,  alt: "1,560m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","trail-run"],
      peak_m: 2844, vertical_m: 1300, terrain_km: 300, lifts: 56, snowfall_cm: 300 }),
  r({ n: "Grindelwald",               s: "grindelwald",              lat: 46.6244, long: 8.0414,  alt: "1,034m", country: "Switzerland",
      op: "year-round",
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 2681, vertical_m: 1650, terrain_km: 206, lifts: 44, snowfall_cm: 500 }),
  r({ n: "Mürren",                    s: "murren",                   lat: 46.5589, long: 7.8928,  alt: "1,650m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","climb"],
      peak_m: 2970, vertical_m: 1320, terrain_km: 54, lifts: 14, snowfall_cm: 450 }),
  r({ n: "Saas-Fee",                  s: "saas-fee",                 lat: 46.1083, long: 7.9281,  alt: "1,800m", country: "Switzerland",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","climb"],
      peak_m: 3600, vertical_m: 1800, terrain_km: 100, lifts: 22, snowfall_cm: 500 }),
  r({ n: "Crans-Montana",             s: "crans-montana",            lat: 46.3103, long: 7.4786,  alt: "1,500m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3000, vertical_m: 1500, terrain_km: 140, lifts: 24, snowfall_cm: 400 }),
  r({ n: "Engelberg",                 s: "engelberg",                lat: 46.8217, long: 8.4053,  alt: "1,000m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","splitboard","hike","bike"],
      peak_m: 3020, vertical_m: 2000, terrain_km: 82, lifts: 24, snowfall_cm: 500 }),
  r({ n: "Andermatt",                 s: "andermatt",                lat: 46.6383, long: 8.5944,  alt: "1,444m", country: "Switzerland",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","splitboard","hike","climb"],
      peak_m: 2961, vertical_m: 1500, terrain_km: 180, lifts: 33, snowfall_cm: 650 }),
];

// --- Alps · Austria (10) --------------------------------------------------
// Arlberg (St. Anton + Lech-Zürs) and Silvretta Arena (Ischgl + Samnaun)
// are linked; stats per Austrian resort are their own-side figures.
const AUSTRIA: Resorts[] = [
  r({ n: "St. Anton am Arlberg",      s: "st-anton-am-arlberg",      lat: 47.1283, long: 10.2608, alt: "1,304m", country: "Austria",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","splitboard","hike","bike"],
      peak_m: 2811, vertical_m: 1507, terrain_km: 195, lifts: 42, snowfall_cm: 700 }),
  r({ n: "Lech-Zürs",                 s: "lech-zurs",                lat: 47.2082, long: 10.1413, alt: "1,450m", country: "Austria",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2811, vertical_m: 1361, terrain_km: 160, lifts: 48, snowfall_cm: 800 }),
  // Nordkette: lift-served from Innsbruck city at 574m to 2,256m — the
  // vertical headline is dramatic; groomed terrain is small (15km).
  r({ n: "Nordkette (Innsbruck)",     s: "nordkette",                lat: 47.3135, long: 11.3846, alt: "2,256m", country: "Austria",
      op: "year-round",
      acts: ["ski","snowboard","hike","climb","trail-run"],
      peak_m: 2256, vertical_m: 1682, terrain_km: 15, lifts: 7, snowfall_cm: 400 }),
  r({ n: "Kitzbühel",                 s: "kitzbuhel",                lat: 47.4467, long: 12.3917, alt: "800m",   country: "Austria",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2000, vertical_m: 1200, terrain_km: 230, lifts: 55, snowfall_cm: 500 }),
  r({ n: "Mayrhofen",                 s: "mayrhofen",                lat: 47.1667, long: 11.8667, alt: "630m",   country: "Austria",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 2500, vertical_m: 1870, terrain_km: 142, lifts: 56, snowfall_cm: 500 }),
  r({ n: "Ischgl",                    s: "ischgl",                   lat: 47.0094, long: 10.2908, alt: "1,377m", country: "Austria",
      op: "seasonal", from: "11-25", to: "05-05",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2872, vertical_m: 1495, terrain_km: 160, lifts: 45, snowfall_cm: 700 }),
  r({ n: "SkiWelt Wilder Kaiser",     s: "skiwelt-wilder-kaiser",    lat: 47.4997, long: 12.1861, alt: "703m",   country: "Austria",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1957, vertical_m: 1254, terrain_km: 284, lifts: 90, snowfall_cm: 400 }),
  r({ n: "Zell am See",               s: "zell-am-see",              lat: 47.3236, long: 12.7963, alt: "750m",   country: "Austria",
      op: "year-round",
      acts: ["ski","snowboard","hike","bike","sail","wild-swim"],
      peak_m: 3029, vertical_m: 2272, terrain_km: 138, lifts: 55, snowfall_cm: 500 }),
  r({ n: "Sölden",                    s: "solden",                   lat: 46.9681, long: 11.0094, alt: "1,377m", country: "Austria",
      op: "seasonal", from: "10-20", to: "05-05",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3340, vertical_m: 1963, terrain_km: 143, lifts: 32, snowfall_cm: 850 }),
  // Hintertux: year-round glacier skiing on Gefrorene Wand. One of the
  // snowiest resorts in the Alps.
  r({ n: "Hintertux Glacier",         s: "hintertux-glacier",        lat: 47.0719, long: 11.6833, alt: "1,500m", country: "Austria",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","climb"],
      peak_m: 3250, vertical_m: 1750, terrain_km: 86, lifts: 21, snowfall_cm: 1000 }),
];

// --- Alps · Italy (5) -----------------------------------------------------
// Dolomiti Superski (1,200km across 12 valleys) is linked — each resort
// here shows its own domain, not the superski total.
const ITALY: Resorts[] = [
  r({ n: "Cortina d'Ampezzo",         s: "cortina-dampezzo",         lat: 46.5406, long: 12.1356, alt: "1,224m", country: "Italy",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 3243, vertical_m: 2019, terrain_km: 140, lifts: 34, snowfall_cm: 500 }),
  r({ n: "Val Gardena",               s: "val-gardena",              lat: 46.5600, long: 11.7306, alt: "1,236m", country: "Italy",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 2518, vertical_m: 1282, terrain_km: 175, lifts: 79, snowfall_cm: 400 }),
  r({ n: "Madonna di Campiglio",      s: "madonna-di-campiglio",     lat: 46.2283, long: 10.8253, alt: "1,550m", country: "Italy",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2500, vertical_m: 950, terrain_km: 157, lifts: 61, snowfall_cm: 500 }),
  r({ n: "Livigno",                   s: "livigno",                  lat: 46.5386, long: 10.1361, alt: "1,816m", country: "Italy",
      op: "seasonal", from: "11-25", to: "05-01",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 2900, vertical_m: 1084, terrain_km: 115, lifts: 29, snowfall_cm: 450 }),
  r({ n: "Bormio",                    s: "bormio",                   lat: 46.4675, long: 10.3756, alt: "1,225m", country: "Italy",
      op: "seasonal", from: S.alps[0], to: S.alps[1],
      acts: ["ski","snowboard","hike","bike","wild-swim"],
      peak_m: 3012, vertical_m: 1787, terrain_km: 50, lifts: 15, snowfall_cm: 350 }),
];

// --- North America · USA (16) --------------------------------------------
// US resorts publish area in acres rather than piste-km; terrain here is
// an honest conversion (1 ha ≈ 0.1 km piste by common usage; sometimes
// published own km stats, used when available).
const USA: Resorts[] = [
  r({ n: "Vail",                      s: "vail",                     lat: 39.6061, long: -106.3550, alt: "2,475m", country: "USA/Colorado",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3527, vertical_m: 1052, terrain_km: 215, lifts: 31, snowfall_cm: 890 }),
  r({ n: "Aspen Snowmass",            s: "aspen-snowmass",           lat: 39.2092, long: -106.9497, alt: "2,422m", country: "USA/Colorado",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 3813, vertical_m: 1348, terrain_km: 215, lifts: 42, snowfall_cm: 760 }),
  r({ n: "Breckenridge",              s: "breckenridge",             lat: 39.4817, long: -106.0384, alt: "2,926m", country: "USA/Colorado",
      op: "seasonal", from: "11-10", to: "05-28",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3963, vertical_m: 1037, terrain_km: 155, lifts: 34, snowfall_cm: 760 }),
  r({ n: "Steamboat",                 s: "steamboat",                lat: 40.4572, long: -106.8044, alt: "2,103m", country: "USA/Colorado",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike","wild-swim"],
      peak_m: 3220, vertical_m: 1117, terrain_km: 165, lifts: 18, snowfall_cm: 760 }),
  r({ n: "Telluride",                 s: "telluride",                lat: 37.9375, long: -107.8123, alt: "2,667m", country: "USA/Colorado",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 3790, vertical_m: 1123, terrain_km: 81, lifts: 18, snowfall_cm: 760 }),
  r({ n: "Park City",                 s: "park-city",                lat: 40.6514, long: -111.5080, alt: "2,103m", country: "USA/Utah",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 3049, vertical_m: 946, terrain_km: 290, lifts: 41, snowfall_cm: 760 }),
  r({ n: "Deer Valley",               s: "deer-valley",              lat: 40.6306, long: -111.4789, alt: "2,002m", country: "USA/Utah",
      op: "seasonal", from: "12-05", to: "04-15",
      acts: ["ski","hike","bike"],
      peak_m: 2891, vertical_m: 889, terrain_km: 81, lifts: 24, snowfall_cm: 760 }),
  // Alta: Little Cottonwood Canyon — famously snowy. ~525 inches / 13.3m.
  r({ n: "Alta",                      s: "alta",                     lat: 40.5833, long: -111.6381, alt: "2,606m", country: "USA/Utah",
      op: "seasonal", from: S.usRockies[0], to: "04-25",
      acts: ["ski","splitboard","hike"],
      peak_m: 3353, vertical_m: 747, terrain_km: 90, lifts: 7, snowfall_cm: 1330 }),
  r({ n: "Jackson Hole",              s: "jackson-hole",             lat: 43.5875, long: -110.8278, alt: "1,924m", country: "USA/Wyoming",
      op: "seasonal", from: S.usRockies[0], to: "04-10",
      acts: ["ski","snowboard","splitboard","hike","climb","kayak"],
      peak_m: 3185, vertical_m: 1262, terrain_km: 133, lifts: 13, snowfall_cm: 1120 }),
  r({ n: "Big Sky",                   s: "big-sky",                  lat: 45.2844, long: -111.4017, alt: "2,164m", country: "USA/Montana",
      op: "seasonal", from: S.usRockies[0], to: "04-20",
      acts: ["ski","snowboard","hike","bike","trail-run"],
      peak_m: 3403, vertical_m: 1239, terrain_km: 235, lifts: 36, snowfall_cm: 1090 }),
  r({ n: "Mammoth Mountain",          s: "mammoth-mountain",         lat: 37.6306, long: -119.0325, alt: "2,424m", country: "USA/California",
      op: "seasonal", from: S.usSierra[0], to: S.usSierra[1],
      acts: ["ski","snowboard","hike","bike","climb"],
      peak_m: 3369, vertical_m: 945, terrain_km: 140, lifts: 25, snowfall_cm: 1015 }),
  r({ n: "Palisades Tahoe",           s: "palisades-tahoe",          lat: 39.1972, long: -120.2358, alt: "1,890m", country: "USA/California",
      op: "seasonal", from: S.usSierra[0], to: S.usSierra[1],
      acts: ["ski","snowboard","hike","bike","wild-swim"],
      peak_m: 2758, vertical_m: 868, terrain_km: 243, lifts: 42, snowfall_cm: 1065 }),
  r({ n: "Heavenly",                  s: "heavenly",                 lat: 38.9353, long: -119.9400, alt: "2,000m", country: "USA/California",
      op: "seasonal", from: S.usSierra[0], to: "04-20",
      acts: ["ski","snowboard","hike","bike","sail"],
      peak_m: 3068, vertical_m: 1068, terrain_km: 195, lifts: 28, snowfall_cm: 915 }),
  r({ n: "Killington",                s: "killington",               lat: 43.6042, long: -72.7869,  alt: "1,290m", country: "USA/Vermont",
      op: "seasonal", from: S.usEast[0], to: "05-10",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1290, vertical_m: 753, terrain_km: 63, lifts: 22, snowfall_cm: 635 }),
  r({ n: "Stowe",                     s: "stowe",                    lat: 44.5308, long: -72.7814,  alt: "1,340m", country: "USA/Vermont",
      op: "seasonal", from: S.usEast[0], to: S.usEast[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1340, vertical_m: 870, terrain_km: 55, lifts: 13, snowfall_cm: 785 }),
  r({ n: "Sun Valley",                s: "sun-valley",               lat: 43.6716, long: -114.3528, alt: "1,780m", country: "USA/Idaho",
      op: "seasonal", from: S.usRockies[0], to: S.usRockies[1],
      acts: ["ski","snowboard","hike","bike","trail-run"],
      peak_m: 2789, vertical_m: 1009, terrain_km: 85, lifts: 18, snowfall_cm: 500 }),
];

// --- North America · Canada (4) ------------------------------------------
const CANADA: Resorts[] = [
  // Whistler Blackcomb — largest ski area in North America by acreage.
  r({ n: "Whistler Blackcomb",        s: "whistler-blackcomb",       lat: 50.1163, long: -122.9574, alt: "2,284m", country: "Canada/BC",
      op: "year-round",
      acts: ["ski","snowboard","splitboard","hike","bike","trail-run"],
      peak_m: 2436, vertical_m: 1784, terrain_km: 325, lifts: 37, snowfall_cm: 1170 }),
  r({ n: "Lake Louise",               s: "lake-louise",              lat: 51.4254, long: -116.1773, alt: "1,645m", country: "Canada/Alberta",
      op: "seasonal", from: "11-05", to: "05-05",
      acts: ["ski","snowboard","hike","kayak","wild-swim"],
      peak_m: 2637, vertical_m: 991, terrain_km: 165, lifts: 12, snowfall_cm: 460 }),
  // Revelstoke — the single-lift continental vertical-drop record holder.
  r({ n: "Revelstoke Mountain",       s: "revelstoke-mountain",      lat: 50.9631, long: -118.1636, alt: "2,225m", country: "Canada/BC",
      op: "seasonal", from: S.usRockies[0], to: "04-20",
      acts: ["ski","snowboard","splitboard","hike","bike"],
      peak_m: 2225, vertical_m: 1713, terrain_km: 121, lifts: 5, snowfall_cm: 1090 }),
  r({ n: "Mont Tremblant",            s: "mont-tremblant",           lat: 46.2097, long: -74.5853,  alt: "875m",   country: "Canada/Québec",
      op: "year-round",
      acts: ["ski","snowboard","hike","bike","kayak","wild-swim"],
      peak_m: 875, vertical_m: 645, terrain_km: 105, lifts: 14, snowfall_cm: 400 }),
];

// --- Japan (8) ------------------------------------------------------------
// Japanese resorts are famous for depth; Myoko and Niseko regularly top
// 15m seasons. Numbers below are multi-year averages — single seasons
// swing wildly either side.
const JAPAN: Resorts[] = [
  r({ n: "Niseko (Grand Hirafu)",     s: "niseko-grand-hirafu",      lat: 42.8614, long: 140.6986, alt: "1,308m", country: "Japan/Hokkaido",
      op: "seasonal", from: S.japan[0], to: S.japan[1],
      acts: ["ski","snowboard","splitboard","hike","wild-swim"],
      peak_m: 1308, vertical_m: 940, terrain_km: 44, lifts: 32, snowfall_cm: 1500 }),
  r({ n: "Rusutsu",                   s: "rusutsu",                  lat: 42.7536, long: 140.9169, alt: "994m",   country: "Japan/Hokkaido",
      op: "year-round",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 994, vertical_m: 670, terrain_km: 42, lifts: 18, snowfall_cm: 1200 }),
  r({ n: "Furano",                    s: "furano",                   lat: 43.3418, long: 142.3733, alt: "1,074m", country: "Japan/Hokkaido",
      op: "seasonal", from: S.japan[0], to: "04-05",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1074, vertical_m: 719, terrain_km: 25, lifts: 11, snowfall_cm: 900 }),
  r({ n: "Hakuba Happo-One",          s: "hakuba-happo-one",         lat: 36.6986, long: 137.8328, alt: "1,831m", country: "Japan/Nagano",
      op: "seasonal", from: S.japan[0], to: "05-05",
      acts: ["ski","snowboard","hike","climb","trail-run"],
      peak_m: 1831, vertical_m: 1071, terrain_km: 44, lifts: 23, snowfall_cm: 1100 }),
  r({ n: "Nozawa Onsen",              s: "nozawa-onsen",             lat: 36.9220, long: 138.4506, alt: "1,650m", country: "Japan/Nagano",
      op: "seasonal", from: "11-30", to: "05-05",
      acts: ["ski","snowboard","hike"],
      peak_m: 1650, vertical_m: 1085, terrain_km: 50, lifts: 21, snowfall_cm: 1000 }),
  // Myoko: notorious for "Myoko powder" — some seasons top 20m.
  r({ n: "Myoko Kogen (Akakura)",     s: "myoko-kogen",              lat: 36.8828, long: 138.1917, alt: "1,500m", country: "Japan/Niigata",
      op: "seasonal", from: S.japan[0], to: "05-05",
      acts: ["ski","snowboard","splitboard","hike"],
      peak_m: 1500, vertical_m: 750, terrain_km: 48, lifts: 32, snowfall_cm: 1300 }),
  // Shiga Kogen: 18 interconnected ski areas — largest in Japan.
  r({ n: "Shiga Kogen",               s: "shiga-kogen",              lat: 36.7236, long: 138.5017, alt: "2,307m", country: "Japan/Nagano",
      op: "seasonal", from: "11-20", to: "05-10",
      acts: ["ski","snowboard","hike"],
      peak_m: 2307, vertical_m: 967, terrain_km: 80, lifts: 60, snowfall_cm: 1000 }),
  r({ n: "Appi Kogen",                s: "appi-kogen",               lat: 40.0397, long: 140.9792, alt: "1,304m", country: "Japan/Iwate",
      op: "seasonal", from: S.japan[0], to: "05-05",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1304, vertical_m: 804, terrain_km: 45, lifts: 21, snowfall_cm: 1000 }),
];

// --- Scandinavia (7) -----------------------------------------------------
// Scandinavian resorts have modest peaks but long seasons (and in
// Riksgränsen's case, midnight-sun skiing well into June).
const SCANDINAVIA: Resorts[] = [
  r({ n: "Trysil",                    s: "trysil",                   lat: 61.3078, long: 12.2650,  alt: "1,132m", country: "Norway",
      op: "seasonal", from: S.scandinavia[0], to: S.scandinavia[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1132, vertical_m: 685, terrain_km: 71, lifts: 32, snowfall_cm: 300 }),
  r({ n: "Hemsedal",                  s: "hemsedal",                 lat: 60.8550, long: 8.5553,   alt: "1,497m", country: "Norway",
      op: "seasonal", from: S.scandinavia[0], to: "05-01",
      acts: ["ski","snowboard","splitboard","hike","trail-run"],
      peak_m: 1497, vertical_m: 810, terrain_km: 45, lifts: 20, snowfall_cm: 450 }),
  r({ n: "Geilo",                     s: "geilo",                    lat: 60.5333, long: 8.2047,   alt: "1,178m", country: "Norway",
      op: "seasonal", from: S.scandinavia[0], to: S.scandinavia[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 1178, vertical_m: 378, terrain_km: 40, lifts: 18, snowfall_cm: 350 }),
  r({ n: "Åre",                       s: "are",                      lat: 63.3989, long: 13.0786,  alt: "1,420m", country: "Sweden",
      op: "year-round",
      acts: ["ski","snowboard","hike","bike","trail-run","kayak"],
      peak_m: 1420, vertical_m: 1000, terrain_km: 90, lifts: 42, snowfall_cm: 500 }),
  r({ n: "Sälen (Lindvallen)",        s: "salen-lindvallen",         lat: 61.1764, long: 13.1067,  alt: "886m",   country: "Sweden",
      op: "seasonal", from: S.scandinavia[0], to: "04-20",
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 886, vertical_m: 303, terrain_km: 43, lifts: 32, snowfall_cm: 300 }),
  // Riksgränsen — Arctic circle. Short low season, then midnight-sun
  // skiing into late June.
  r({ n: "Riksgränsen",               s: "riksgransen",              lat: 68.4253, long: 18.1272,  alt: "909m",   country: "Sweden",
      op: "seasonal", from: "02-15", to: "06-24",
      acts: ["ski","snowboard","splitboard","hike"],
      peak_m: 909, vertical_m: 404, terrain_km: 24, lifts: 6, snowfall_cm: 600 }),
  r({ n: "Levi",                      s: "levi",                     lat: 67.8042, long: 24.8011,  alt: "531m",   country: "Finland",
      op: "seasonal", from: S.scandinaviaNorth[0], to: S.scandinaviaNorth[1],
      acts: ["ski","snowboard","hike","bike"],
      peak_m: 531, vertical_m: 325, terrain_km: 44, lifts: 27, snowfall_cm: 200 }),
];

// --- Southern Hemisphere (10) --------------------------------------------
const SOUTHERN: Resorts[] = [
  r({ n: "Coronet Peak",              s: "coronet-peak",             lat: -44.9272, long: 168.7347, alt: "1,649m", country: "New Zealand",
      op: "seasonal", from: S.southern[0], to: S.southern[1],
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "The Remarkables",           s: "the-remarkables",          lat: -45.0557, long: 168.8117, alt: "1,951m", country: "New Zealand",
      op: "seasonal", from: S.southern[0], to: S.southern[1],
      acts: ["ski","snowboard","splitboard","hike","climb"] }),
  r({ n: "Cardrona",                  s: "cardrona",                 lat: -44.8747, long: 168.9458, alt: "1,860m", country: "New Zealand",
      op: "seasonal", from: S.southern[0], to: "10-20",
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "Treble Cone",               s: "treble-cone",              lat: -44.6208, long: 168.8942, alt: "1,860m", country: "New Zealand",
      op: "seasonal", from: S.southern[0], to: "10-05",
      acts: ["ski","snowboard","splitboard","hike"] }),
  r({ n: "Mt Hutt",                   s: "mt-hutt",                  lat: -43.4683, long: 171.5500, alt: "2,086m", country: "New Zealand",
      op: "seasonal", from: "06-05", to: "10-15",
      acts: ["ski","snowboard","hike","trail-run"] }),
  r({ n: "Portillo",                  s: "portillo",                 lat: -32.8322, long: -70.1308, alt: "2,880m", country: "Chile",
      op: "seasonal", from: "06-15", to: "10-10",
      acts: ["ski","snowboard","hike","climb"] }),
  r({ n: "Valle Nevado",              s: "valle-nevado",             lat: -33.3550, long: -70.2500, alt: "3,025m", country: "Chile",
      op: "seasonal", from: S.southern[0], to: S.southern[1],
      acts: ["ski","snowboard","hike","climb"] }),
  r({ n: "Nevados de Chillán",        s: "nevados-de-chillan",       lat: -36.9000, long: -71.4000, alt: "1,650m", country: "Chile",
      op: "seasonal", from: S.southern[0], to: "10-10",
      acts: ["ski","snowboard","splitboard","hike","wild-swim"] }),
  r({ n: "Cerro Catedral (Bariloche)", s: "cerro-catedral",          lat: -41.1703, long: -71.4425, alt: "2,180m", country: "Argentina",
      op: "seasonal", from: S.southern[0], to: "10-05",
      acts: ["ski","snowboard","hike","bike","kayak","wild-swim"] }),
  r({ n: "Las Leñas",                 s: "las-lenas",                lat: -35.1500, long: -70.0833, alt: "2,240m", country: "Argentina",
      op: "seasonal", from: "06-20", to: "10-10",
      acts: ["ski","snowboard","splitboard","hike"] }),
];

// --- Rest of world (15) --------------------------------------------------
const REST: Resorts[] = [
  r({ n: "Sierra Nevada",             s: "sierra-nevada",            lat: 37.0956, long: -3.3980,  alt: "2,100m", country: "Spain",
      op: "seasonal", from: S.pyrenees[0], to: "05-01",
      acts: ["ski","snowboard","hike","bike","trail-run"] }),
  r({ n: "Baqueira-Beret",            s: "baqueira-beret",           lat: 42.6983, long: 0.9403,   alt: "1,500m", country: "Spain",
      op: "seasonal", from: S.pyrenees[0], to: "04-20",
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "Grandvalira",               s: "grandvalira",              lat: 42.5389, long: 1.6936,   alt: "2,100m", country: "Andorra",
      op: "seasonal", from: S.pyrenees[0], to: "04-15",
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "Bansko",                    s: "bansko",                   lat: 41.8369, long: 23.4850,  alt: "936m",   country: "Bulgaria",
      op: "seasonal", from: S.balkans[0], to: S.balkans[1],
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "Borovets",                  s: "borovets",                 lat: 42.2683, long: 23.6017,  alt: "1,350m", country: "Bulgaria",
      op: "seasonal", from: S.balkans[0], to: S.balkans[1],
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Palandöken",                s: "palandoken",               lat: 39.8714, long: 41.3017,  alt: "2,200m", country: "Turkey",
      op: "seasonal", from: "11-25", to: "04-05",
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Poiana Brașov",             s: "poiana-brasov",            lat: 45.5842, long: 25.5497,  alt: "1,030m", country: "Romania",
      op: "seasonal", from: "12-15", to: "03-25",
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Zakopane (Kasprowy Wierch)", s: "zakopane",                lat: 49.2322, long: 19.9820,  alt: "1,987m", country: "Poland",
      op: "year-round",
      acts: ["ski","snowboard","hike","climb"] }),
  r({ n: "Yongpyong",                 s: "yongpyong",                lat: 37.6356, long: 128.6686, alt: "1,458m", country: "Korea",
      op: "seasonal", from: S.korea[0], to: S.korea[1],
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Alpensia",                  s: "alpensia",                 lat: 37.6628, long: 128.6764, alt: "700m",   country: "Korea",
      op: "seasonal", from: S.korea[0], to: S.korea[1],
      acts: ["ski","snowboard","hike","bike"] }),
  r({ n: "Yabuli",                    s: "yabuli",                   lat: 44.6833, long: 128.6333, alt: "1,374m", country: "China",
      op: "seasonal", from: S.china[0], to: S.china[1],
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Beidahu",                   s: "beidahu",                  lat: 43.4617, long: 126.9450, alt: "1,404m", country: "China",
      op: "seasonal", from: S.china[0], to: S.china[1],
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Gudauri",                   s: "gudauri",                  lat: 42.4683, long: 44.4817,  alt: "2,196m", country: "Georgia",
      op: "seasonal", from: S.caucasus[0], to: "04-20",
      acts: ["ski","snowboard","splitboard","hike"] }),
  r({ n: "Dizin",                     s: "dizin",                    lat: 36.1600, long: 51.4433,  alt: "3,600m", country: "Iran",
      op: "seasonal", from: S.mideast[0], to: "05-01",
      acts: ["ski","snowboard","hike"] }),
  r({ n: "Mzaar Kfardebian",          s: "mzaar-kfardebian",         lat: 33.9833, long: 35.8333,  alt: "2,465m", country: "Lebanon",
      op: "seasonal", from: S.mideast[0], to: S.mideast[1],
      acts: ["ski","snowboard","hike"] }),
];

export const RESORTS: Resorts[] = [
  ...SCOTLAND,
  ...FRANCE,
  ...SWITZERLAND,
  ...AUSTRIA,
  ...ITALY,
  ...USA,
  ...CANADA,
  ...JAPAN,
  ...SCANDINAVIA,
  ...SOUTHERN,
  ...REST,
];
