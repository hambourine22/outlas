// Regions — the map's "where am I viewing" axis.
//
// A region is a camera preset: centre + zoom (and a human label). Clicking a
// region in the sidebar flies the map there. Pins are not filtered by the
// camera — a user who has zoomed into the Cairngorms still sees whatever
// pins lie outside the viewport if they pan. The region picker steers the
// camera, not the data.
//
// The default is "worldwide" because the content layer went global on
// 2026-10-31 (world-mountain-resorts spec). Scotland remains the first
// sub-region because the brand's history and most-tested data are there.

export type RegionKey =
  | "worldwide"
  | "scotland"
  | "highlands"
  | "cairngorms"
  | "trossachs"
  | "borders"
  | "islands";

export type Region = {
  key: RegionKey;
  label: string;         // the title the h3 shows when this region is active
  oneLine: string;       // single sentence of context (Nikolai voice)
  centre: [number, number]; // [lng, lat]
  zoom: number;
};

// Ordered from widest to narrowest so the sidebar reads top-down from "the
// whole thing" to "a specific valley."
export const REGIONS: Region[] = [
  {
    key: "worldwide",
    label: "Worldwide",
    oneLine: "Every resort, rental, repair and guide in the content layer.",
    centre: [0, 45],
    zoom: 1.0,
  },
  {
    key: "scotland",
    label: "All of Scotland",
    oneLine: "Five resorts. One good season a year, if we're lucky.",
    centre: [-4.205, 57.122],
    zoom: 6.5,
  },
  {
    key: "highlands",
    label: "Highlands",
    oneLine: "Nevis Range and the long drives west — the big country.",
    centre: [-5.0, 56.95],
    zoom: 8.2,
  },
  {
    key: "cairngorms",
    label: "Cairngorms",
    oneLine: "Cairngorm and Aviemore. The one that's open the most.",
    centre: [-3.6, 57.1],
    zoom: 9.0,
  },
  {
    key: "trossachs",
    label: "Trossachs",
    oneLine: "Glencoe and the loch country — a short drive from Glasgow.",
    centre: [-4.6, 56.65],
    zoom: 9.0,
  },
  {
    key: "borders",
    label: "Borders",
    oneLine: "Not Scotland's ski heartland. Here for completeness.",
    centre: [-2.8, 55.55],
    zoom: 8.5,
  },
  {
    key: "islands",
    label: "Islands & Hebrides",
    oneLine: "Skye, Mull, the Outer Hebrides. Not for the lifts.",
    centre: [-6.5, 57.5],
    zoom: 7.5,
  },
];

export const DEFAULT_REGION: RegionKey = "worldwide";

export function regionByKey(key: RegionKey): Region {
  return REGIONS.find((r) => r.key === key) ?? REGIONS[0];
}
