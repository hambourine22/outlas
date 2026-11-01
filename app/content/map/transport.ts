// Transport — train stations and EV charge points near every resort.
//
// Two sources, merged at the bottom of this file:
// - Scotland, hand-picked below: the ScotRail stops and ChargePlace
//   Scotland sites that serve the five Scottish resorts, two or three each.
//   Coordinates are approximate centroids; a content pass against the OS
//   1:50k and the ChargePlace API tightens them later.
// - Everywhere else, generated in transport-world.ts from OpenStreetMap:
//   the nearest mainline station and nearest public car charger per resort.
//
// `nearest` is the resort's name and `km` the straight-line distance to
// it — the map's hover card prints both. A PostGIS proximity query can
// replace both fields when that lands.

import { WORLD_STATIONS, WORLD_CHARGE_POINTS } from "./transport-world";

export type TransportKind = "station" | "charge";

export const TRANSPORT_LABEL: Record<TransportKind, string> = {
  station: "Train station",
  charge: "Charge point",
};

// Hairline note beside each label in the sidebar — Nikolai-voice, short
// enough to share the 288px row with the label and count.
export const TRANSPORT_NOTE: Record<TransportKind, string> = {
  station: "nearest rail",
  charge: "nearest plug",
};

export type TransportPoint = {
  kind: TransportKind;
  slug: string;
  name: string;
  nearest: string;     // the resort it serves — e.g. "Cairngorm" or "Zermatt"
  km?: number;         // straight-line distance to `nearest`
  lat: number;
  long: number;
  osm?: string;        // OpenStreetMap element, e.g. "node/240052658"
  // Every resort this point is the nearest of its kind to, by slug, with
  // the distance from each — one station can serve several resorts.
  // Generated points carry it; hand-picked Scottish ones derive it below.
  serves?: { resort: string; km: number }[];
};

// Train stations — the ScotRail stops that actually serve the five resorts.
// Not every station in Scotland, deliberately — the useful ones.
export const STATIONS: TransportPoint[] = [
  // Cairngorm
  { kind: "station", slug: "stn-aviemore",      name: "Aviemore",      nearest: "Cairngorm", km: 12.2,   lat: 57.1917, long: -3.8266 },
  { kind: "station", slug: "stn-kingussie",     name: "Kingussie",     nearest: "Cairngorm", km: 23.3,   lat: 57.0797, long: -4.0548 },
  { kind: "station", slug: "stn-dalwhinnie",    name: "Dalwhinnie",    nearest: "Cairngorm", km: 39.8,   lat: 56.9357, long: -4.2425 },
  // Nevis Range
  { kind: "station", slug: "stn-fort-william",  name: "Fort William",  nearest: "Nevis Range", km: 5.9, lat: 56.8198, long: -5.1052 },
  { kind: "station", slug: "stn-spean-bridge",  name: "Spean Bridge",  nearest: "Nevis Range", km: 9.8, lat: 56.8927, long: -4.9196 },
  { kind: "station", slug: "stn-banavie",       name: "Banavie",       nearest: "Nevis Range", km: 6.4, lat: 56.8445, long: -5.1023 },
  // Glencoe
  { kind: "station", slug: "stn-bridge-orchy",  name: "Bridge of Orchy", nearest: "Glencoe", km: 16.7,   lat: 56.5125, long: -4.7698 },
  { kind: "station", slug: "stn-rannoch",       name: "Rannoch",       nearest: "Glencoe", km: 19.9,     lat: 56.6868, long: -4.5806 },
  { kind: "station", slug: "stn-corrour",       name: "Corrour",       nearest: "Glencoe", km: 17.9,     lat: 56.7592, long: -4.6902 },
  // Glenshee — no very-close station; Pitlochry + Perth are the two realistic ones.
  { kind: "station", slug: "stn-pitlochry",     name: "Pitlochry",     nearest: "Glenshee", km: 26.1,    lat: 56.7066, long: -3.7322 },
  { kind: "station", slug: "stn-perth",         name: "Perth",         nearest: "Glenshee", km: 53.0,    lat: 56.3929, long: -3.4388 },
  // The Lecht
  { kind: "station", slug: "stn-keith",         name: "Keith",         nearest: "The Lecht", km: 40.5,   lat: 57.5366, long: -2.9548 },
  { kind: "station", slug: "stn-huntly",        name: "Huntly",        nearest: "The Lecht", km: 38.5,   lat: 57.4494, long: -2.7828 },
  { kind: "station", slug: "stn-aberdeen",      name: "Aberdeen",      nearest: "The Lecht", km: 69.0,   lat: 57.1434, long: -2.0978 },
];

// EV charge points — ChargePlace Scotland sites within useful range of
// the five resorts. Approximate; a content pass against the ChargePlace
// Scotland API tightens the list and adds connector detail.
export const CHARGE_POINTS: TransportPoint[] = [
  // Cairngorm — Aviemore cluster
  { kind: "charge", slug: "chg-aviemore-centre",    name: "Aviemore Village",       nearest: "Cairngorm", km: 12.3,   lat: 57.1932, long: -3.8260 },
  { kind: "charge", slug: "chg-aviemore-macdonald", name: "Macdonald Aviemore",     nearest: "Cairngorm", km: 12.0,   lat: 57.1860, long: -3.8311 },
  { kind: "charge", slug: "chg-cairngorm-base",     name: "Cairngorm Mountain",     nearest: "Cairngorm", km: 0.5,   lat: 57.1156, long: -3.6694 },
  // Nevis Range — Fort William cluster
  { kind: "charge", slug: "chg-fort-william-west",  name: "Fort William West End",  nearest: "Nevis Range", km: 6.4, lat: 56.8181, long: -5.1134 },
  { kind: "charge", slug: "chg-fort-william-lochaber", name: "Lochaber Leisure Ctr", nearest: "Nevis Range", km: 5.7, lat: 56.8248, long: -5.1015 },
  { kind: "charge", slug: "chg-nevis-base",         name: "Nevis Range Base",       nearest: "Nevis Range", km: 2.7, lat: 56.8216, long: -4.9641 },
  // Glencoe
  { kind: "charge", slug: "chg-glencoe-mountain",   name: "Glencoe Mountain",       nearest: "Glencoe", km: 2.2,     lat: 56.6600, long: -4.9219 },
  { kind: "charge", slug: "chg-ballachulish",       name: "Ballachulish",           nearest: "Glencoe", km: 17.6,     lat: 56.6830, long: -5.1770 },
  { kind: "charge", slug: "chg-kinlochleven",       name: "Kinlochleven",           nearest: "Glencoe", km: 9.1,     lat: 56.7175, long: -4.9654 },
  // Glenshee
  { kind: "charge", slug: "chg-spittal-glenshee",   name: "Spittal of Glenshee",    nearest: "Glenshee", km: 5.8,    lat: 56.8220, long: -3.4610 },
  { kind: "charge", slug: "chg-blairgowrie",        name: "Blairgowrie",            nearest: "Glenshee", km: 31.2,    lat: 56.5922, long: -3.3406 },
  // The Lecht
  { kind: "charge", slug: "chg-tomintoul",          name: "Tomintoul",              nearest: "The Lecht", km: 9.8,   lat: 57.2548, long: -3.3722 },
  { kind: "charge", slug: "chg-lecht-base",         name: "The Lecht Base",         nearest: "The Lecht", km: 0.7,   lat: 57.2000, long: -3.2322 },
];

// Scotland's hand-picked points plus the generated nearest-per-resort set.
const ALL_STATIONS = [...STATIONS, ...WORLD_STATIONS];
const ALL_CHARGE_POINTS = [...CHARGE_POINTS, ...WORLD_CHARGE_POINTS];

export const ALL_TRANSPORT: TransportPoint[] = [...ALL_STATIONS, ...ALL_CHARGE_POINTS];

export const TRANSPORT_COUNTS: Record<TransportKind, number> = {
  station: ALL_STATIONS.length,
  charge: ALL_CHARGE_POINTS.length,
};

// The resorts the hand-picked Scottish points name, by slug.
const SCOTTISH_RESORT: Record<string, string> = {
  "Cairngorm": "cairngorm-mountain",
  "Nevis Range": "nevis-range",
  "Glencoe": "glencoe-mountain-resort",
  "Glenshee": "glenshee-ski-centre",
  "The Lecht": "the-lecht",
};

// Per resort slug: its nearest station and charger, with the distance from
// that resort. The map's world-zoom badges beside each resort pin read it.
export type ResortTransport = Partial<
  Record<TransportKind, { point: TransportPoint; km: number }>
>;

export const TRANSPORT_BY_RESORT: Record<string, ResortTransport> = {};
for (const point of ALL_TRANSPORT) {
  const scottish = SCOTTISH_RESORT[point.nearest];
  const serves =
    point.serves ?? (scottish ? [{ resort: scottish, km: point.km ?? 0 }] : []);
  for (const { resort, km } of serves) {
    const entry = (TRANSPORT_BY_RESORT[resort] ??= {});
    const current = entry[point.kind];
    if (!current || km < current.km) entry[point.kind] = { point, km };
  }
}
