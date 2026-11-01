// Transport — stations and charge points near the Scottish ski resorts.
//
// Scoped per the transport-icon-key brief: only points within reasonable
// driving distance of one of the five live Scottish resorts. The `nearest`
// field is a free-text resort name for now — a PostGIS-backed proximity
// query lands with the Spring 26 live-pins work and replaces this field.
//
// Coordinates are approximate centroids of each station / ChargePlace
// Scotland site. Close enough for a Mapbox pin at zoom 8–11; a content
// pass against the OS 1:50k and ChargePlace API tightens them later.

export type TransportKind = "station" | "charge";

export const TRANSPORT_LABEL: Record<TransportKind, string> = {
  station: "Train station",
  charge: "Charge point",
};

// Hairline note under each label in the sidebar — Nikolai-voice, one line.
export const TRANSPORT_NOTE: Record<TransportKind, string> = {
  station: "the useful stops",
  charge: "ChargePlace Scotland",
};

export type TransportPoint = {
  kind: TransportKind;
  slug: string;
  name: string;
  nearest: string;     // free-text — e.g. "Cairngorm" or "The Lecht"
  lat: number;
  long: number;
};

// Train stations — the ScotRail stops that actually serve the five resorts.
// Not every station in Scotland, deliberately — the useful ones.
export const STATIONS: TransportPoint[] = [
  // Cairngorm
  { kind: "station", slug: "stn-aviemore",      name: "Aviemore",      nearest: "Cairngorm",   lat: 57.1917, long: -3.8266 },
  { kind: "station", slug: "stn-kingussie",     name: "Kingussie",     nearest: "Cairngorm",   lat: 57.0797, long: -4.0548 },
  { kind: "station", slug: "stn-dalwhinnie",    name: "Dalwhinnie",    nearest: "Cairngorm",   lat: 56.9357, long: -4.2425 },
  // Nevis Range
  { kind: "station", slug: "stn-fort-william",  name: "Fort William",  nearest: "Nevis Range", lat: 56.8198, long: -5.1052 },
  { kind: "station", slug: "stn-spean-bridge",  name: "Spean Bridge",  nearest: "Nevis Range", lat: 56.8927, long: -4.9196 },
  { kind: "station", slug: "stn-banavie",       name: "Banavie",       nearest: "Nevis Range", lat: 56.8445, long: -5.1023 },
  // Glencoe
  { kind: "station", slug: "stn-bridge-orchy",  name: "Bridge of Orchy", nearest: "Glencoe",   lat: 56.5125, long: -4.7698 },
  { kind: "station", slug: "stn-rannoch",       name: "Rannoch",       nearest: "Glencoe",     lat: 56.6868, long: -4.5806 },
  { kind: "station", slug: "stn-corrour",       name: "Corrour",       nearest: "Glencoe",     lat: 56.7592, long: -4.6902 },
  // Glenshee — no very-close station; Pitlochry + Perth are the two realistic ones.
  { kind: "station", slug: "stn-pitlochry",     name: "Pitlochry",     nearest: "Glenshee",    lat: 56.7066, long: -3.7322 },
  { kind: "station", slug: "stn-perth",         name: "Perth",         nearest: "Glenshee",    lat: 56.3929, long: -3.4388 },
  // The Lecht
  { kind: "station", slug: "stn-keith",         name: "Keith",         nearest: "The Lecht",   lat: 57.5366, long: -2.9548 },
  { kind: "station", slug: "stn-huntly",        name: "Huntly",        nearest: "The Lecht",   lat: 57.4494, long: -2.7828 },
  { kind: "station", slug: "stn-aberdeen",      name: "Aberdeen",      nearest: "The Lecht",   lat: 57.1434, long: -2.0978 },
];

// EV charge points — ChargePlace Scotland sites within useful range of
// the five resorts. Approximate; a content pass against the ChargePlace
// Scotland API tightens the list and adds connector detail.
export const CHARGE_POINTS: TransportPoint[] = [
  // Cairngorm — Aviemore cluster
  { kind: "charge", slug: "chg-aviemore-centre",    name: "Aviemore Village",       nearest: "Cairngorm",   lat: 57.1932, long: -3.8260 },
  { kind: "charge", slug: "chg-aviemore-macdonald", name: "Macdonald Aviemore",     nearest: "Cairngorm",   lat: 57.1860, long: -3.8311 },
  { kind: "charge", slug: "chg-cairngorm-base",     name: "Cairngorm Mountain",     nearest: "Cairngorm",   lat: 57.1156, long: -3.6694 },
  // Nevis Range — Fort William cluster
  { kind: "charge", slug: "chg-fort-william-west",  name: "Fort William West End",  nearest: "Nevis Range", lat: 56.8181, long: -5.1134 },
  { kind: "charge", slug: "chg-fort-william-lochaber", name: "Lochaber Leisure Ctr", nearest: "Nevis Range", lat: 56.8248, long: -5.1015 },
  { kind: "charge", slug: "chg-nevis-base",         name: "Nevis Range Base",       nearest: "Nevis Range", lat: 56.8216, long: -4.9641 },
  // Glencoe
  { kind: "charge", slug: "chg-glencoe-mountain",   name: "Glencoe Mountain",       nearest: "Glencoe",     lat: 56.6600, long: -4.9219 },
  { kind: "charge", slug: "chg-ballachulish",       name: "Ballachulish",           nearest: "Glencoe",     lat: 56.6830, long: -5.1770 },
  { kind: "charge", slug: "chg-kinlochleven",       name: "Kinlochleven",           nearest: "Glencoe",     lat: 56.7175, long: -4.9654 },
  // Glenshee
  { kind: "charge", slug: "chg-spittal-glenshee",   name: "Spittal of Glenshee",    nearest: "Glenshee",    lat: 56.8220, long: -3.4610 },
  { kind: "charge", slug: "chg-blairgowrie",        name: "Blairgowrie",            nearest: "Glenshee",    lat: 56.5922, long: -3.3406 },
  // The Lecht
  { kind: "charge", slug: "chg-tomintoul",          name: "Tomintoul",              nearest: "The Lecht",   lat: 57.2548, long: -3.3722 },
  { kind: "charge", slug: "chg-lecht-base",         name: "The Lecht Base",         nearest: "The Lecht",   lat: 57.2000, long: -3.2322 },
];

export const ALL_TRANSPORT: TransportPoint[] = [...STATIONS, ...CHARGE_POINTS];

export const TRANSPORT_COUNTS: Record<TransportKind, number> = {
  station: STATIONS.length,
  charge: CHARGE_POINTS.length,
};
