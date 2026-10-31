import type { Repairs } from "@/app/definitions/mapboxDefinitions";

function repair(overrides: Partial<Repairs>): Repairs {
  return {
    name: "",
    repair_address: "",
    repair_phone: "",
    repair_website: "",
    regions: "Scotland",
    accept_in_person_visits: "yes",
    image_url: "",
    opening_times: "",
    item_id: "",
    slug: "",
    status: "published",
    lat: 0,
    long: 0,
    ...overrides,
  };
}

// --- Scotland (3) — original seeded set ---------------------------------
const SCOTLAND: Repairs[] = [
  repair({
    name: "Aviemore Edge Works",
    slug: "aviemore-edge-works",
    item_id: "p-aviemore-edge",
    repair_address: "Grampian Road, Aviemore PH22 1PD",
    repair_phone: "+44 1479 810222",
    repair_website: "https://edgeworks.example",
    opening_times: "Daily, 09:00 – 18:00",
    lat: 57.1894, long: -3.8278,
  }),
  repair({
    name: "Fort William Base Grinder",
    slug: "fort-william-base-grinder",
    item_id: "p-fort-william",
    repair_address: "High Street, Fort William PH33 6DJ",
    repair_phone: "+44 1397 702022",
    opening_times: "Tue – Sat, 09:30 – 17:00",
    lat: 56.8198, long: -5.1052,
  }),
  repair({
    name: "Perthshire Ski Service",
    slug: "perthshire-ski-service",
    item_id: "p-perth",
    repair_address: "Scott Street, Perth PH1 5EH",
    repair_phone: "+44 1738 622022",
    opening_times: "Mon – Sat, 10:00 – 17:30",
    lat: 56.3978, long: -3.4370,
  }),
];

// --- France · Alps (3) ---------------------------------------------------
const FRANCE: Repairs[] = [
  repair({
    name: "Snell Sports",
    slug: "snell-sports-chamonix",
    item_id: "p-snell-sports-chamonix",
    regions: "France",
    repair_address: "104 Rue du Dr Paccard, Chamonix 74400",
    opening_times: "Daily in season, 08:30 – 19:30",
    lat: 45.9239, long: 6.8702,
  }),
  repair({
    name: "Oxygène Service Workshop",
    slug: "oxygene-service-val-disere",
    item_id: "p-oxygene-service-val-disere",
    regions: "France",
    repair_address: "Val d'Isère 73150",
    opening_times: "Daily in season",
    lat: 45.4475, long: 6.9775,
  }),
  repair({
    name: "Nevada Sport Service",
    slug: "nevada-sport-service-val-thorens",
    item_id: "p-nevada-sport-service-val-thorens",
    regions: "France",
    repair_address: "Val Thorens 73440",
    opening_times: "Daily in season",
    lat: 45.2963, long: 6.5820,
  }),
];

// --- Switzerland (2) -----------------------------------------------------
const SWITZERLAND: Repairs[] = [
  repair({
    name: "Bayard Sports Workshop",
    slug: "bayard-sports-workshop-zermatt",
    item_id: "p-bayard-sports-workshop-zermatt",
    regions: "Switzerland",
    repair_address: "Bahnhofplatz, Zermatt 3920",
    opening_times: "Daily in season, 08:00 – 19:00",
    lat: 46.0215, long: 7.7488,
  }),
  repair({
    name: "Ski Service Verbier",
    slug: "ski-service-verbier",
    item_id: "p-ski-service-verbier",
    regions: "Switzerland",
    repair_address: "Rte de Médran, Verbier 1936",
    opening_times: "Daily in season, 08:00 – 19:00",
    lat: 46.0948, long: 7.2298,
  }),
];

// --- Austria (3) ---------------------------------------------------------
const AUSTRIA: Repairs[] = [
  repair({
    name: "Alber Sport Werkstatt",
    slug: "alber-sport-werkstatt-st-anton",
    item_id: "p-alber-sport-werkstatt-st-anton",
    regions: "Austria",
    repair_address: "Dorfstrasse 20, St. Anton am Arlberg 6580",
    opening_times: "Daily in season",
    lat: 47.1290, long: 10.2615,
  }),
  repair({
    name: "Strolz Boot & Service",
    slug: "strolz-boot-service-lech",
    item_id: "p-strolz-boot-service-lech",
    regions: "Austria",
    repair_address: "Omesberg 173, Lech 6764",
    opening_times: "Daily in season",
    lat: 47.2080, long: 10.1415,
  }),
  repair({
    name: "Intersport Kitzsport Workshop",
    slug: "intersport-kitzsport-workshop",
    item_id: "p-intersport-kitzsport-workshop",
    regions: "Austria",
    repair_address: "Jochberger Strasse 7, Kitzbühel 6370",
    opening_times: "Daily in season, 08:00 – 18:30",
    lat: 47.4465, long: 12.3920,
  }),
];

// --- Italy (1) -----------------------------------------------------------
const ITALY: Repairs[] = [
  repair({
    name: "Sport Chalet Armellini Workshop",
    slug: "sport-chalet-armellini-workshop-cortina",
    item_id: "p-sport-chalet-armellini-workshop-cortina",
    regions: "Italy",
    repair_address: "Corso Italia, Cortina d'Ampezzo 32043",
    opening_times: "Daily in season",
    lat: 46.5410, long: 12.1360,
  }),
];

// --- USA (6) -------------------------------------------------------------
const USA: Repairs[] = [
  repair({
    name: "Christy Sports Service — Vail",
    slug: "christy-sports-service-vail",
    item_id: "p-christy-sports-service-vail",
    regions: "USA/Colorado",
    repair_address: "Vail Village, Vail, CO 81657",
    opening_times: "Daily in season",
    lat: 39.6400, long: -106.3750,
  }),
  repair({
    name: "Christy Sports Service — Breckenridge",
    slug: "christy-sports-service-breckenridge",
    item_id: "p-christy-sports-service-breckenridge",
    regions: "USA/Colorado",
    repair_address: "505 S Main Street, Breckenridge, CO 80424",
    opening_times: "Daily in season",
    lat: 39.4789, long: -106.0411,
  }),
  repair({
    name: "Jans Service — Park City",
    slug: "jans-service-park-city",
    item_id: "p-jans-service-park-city",
    regions: "USA/Utah",
    repair_address: "1600 Park Avenue, Park City, UT 84060",
    opening_times: "Daily in season",
    lat: 40.6520, long: -111.5075,
  }),
  repair({
    name: "Hoback Sports",
    slug: "hoback-sports-jackson",
    item_id: "p-hoback-sports-jackson",
    regions: "USA/Wyoming",
    repair_address: "520 W Broadway, Jackson, WY 83001",
    opening_times: "Mon – Sun, 08:00 – 19:00",
    lat: 43.4792, long: -110.7735,
  }),
  repair({
    name: "Grizzly Outfitters",
    slug: "grizzly-outfitters-big-sky",
    item_id: "p-grizzly-outfitters-big-sky",
    regions: "USA/Montana",
    repair_address: "11 Lone Peak Drive, Big Sky, MT 59716",
    opening_times: "Daily in season",
    lat: 45.2805, long: -111.3085,
  }),
  repair({
    name: "Wave Rave Snowboard Shop",
    slug: "wave-rave-snowboard-shop-mammoth",
    item_id: "p-wave-rave-snowboard-shop-mammoth",
    regions: "USA/California",
    repair_address: "3203 Main Street, Mammoth Lakes, CA 93546",
    opening_times: "Daily in season, 08:00 – 19:00",
    lat: 37.6490, long: -118.9712,
  }),
];

// --- Canada (1) ----------------------------------------------------------
const CANADA: Repairs[] = [
  repair({
    name: "Showcase Snowboards",
    slug: "showcase-snowboards-whistler",
    item_id: "p-showcase-snowboards-whistler",
    regions: "Canada/BC",
    repair_address: "4154 Village Stroll, Whistler, BC V8E 1H1",
    opening_times: "Daily in season",
    lat: 50.1155, long: -122.9580,
  }),
];

// --- Japan (2) -----------------------------------------------------------
const JAPAN: Repairs[] = [
  repair({
    name: "Rhythm Niseko Tuning",
    slug: "rhythm-niseko-tuning",
    item_id: "p-rhythm-niseko-tuning",
    regions: "Japan/Hokkaido",
    repair_address: "Yamada 190-6, Niseko-cho, Hokkaido 048-1522",
    opening_times: "Daily in season",
    lat: 42.8620, long: 140.6990,
  }),
  repair({
    name: "Spicy Rentals Workshop",
    slug: "spicy-rentals-workshop-hakuba",
    item_id: "p-spicy-rentals-workshop-hakuba",
    regions: "Japan/Nagano",
    repair_address: "Wadano, Hakuba, Nagano 399-9301",
    opening_times: "Daily in season",
    lat: 36.6980, long: 137.8335,
  }),
];

// --- Scandinavia (2) -----------------------------------------------------
const SCANDINAVIA: Repairs[] = [
  repair({
    name: "SkiStar Service — Trysil",
    slug: "skistar-service-trysil",
    item_id: "p-skistar-service-trysil",
    regions: "Norway",
    repair_address: "Trysilfjellet, 2420 Trysil",
    opening_times: "Daily in season",
    lat: 61.3085, long: 12.2660,
  }),
  repair({
    name: "SkiStar Service — Åre",
    slug: "skistar-service-are",
    item_id: "p-skistar-service-are",
    regions: "Sweden",
    repair_address: "Åre Torg, 837 51 Åre",
    opening_times: "Daily in season",
    lat: 63.3992, long: 13.0790,
  }),
];

// --- Southern Hemisphere (1) --------------------------------------------
const SOUTHERN: Repairs[] = [
  repair({
    name: "Outside Sports Queenstown",
    slug: "outside-sports-queenstown",
    item_id: "p-outside-sports-queenstown",
    regions: "New Zealand",
    repair_address: "9 Shotover Street, Queenstown 9300",
    opening_times: "Daily in season",
    lat: -45.0318, long: 168.6618,
  }),
];

export const REPAIRS: Repairs[] = [
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
];
