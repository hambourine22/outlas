// Oütlas icon registry — one geometry source for every UI glyph.
//
// Construction — the HUX 1px icon spec (`iconography` in design-system.ts):
// - 24 × 24 trim, 2-unit padding band, live area 2–22. Content stays in the
//   live area, may reach into the padding, never past the trim.
// - Keylines for proportion: portrait 4,2 16×20 · square 3,3 18×18 ·
//   landscape 2,4 20×16 · circles r10 and r6 at 12,12. A glyph should fill
//   its keyline, so a tall glyph and a round one read the same size.
// - 1px line, round caps and joins, `currentColor` — the icon flips with
//   --ink per theme and takes the surface's ink. Below 24px the renderer
//   keeps the line at 1px (non-scaling stroke).
// - No fills. The only solid shapes are dots (wheels, heads, eyes): filled
//   circles with no stroke, r 1–1.5 so they read against a 1px line.
// - Orthogonals and simple curves; functional, not illustrative. The
//   transport map glyphs keep their own 16-grid and a heavier line because
//   they serialise to Mapbox bitmaps (TransportIcons.tsx).
//
// Add an icon here, never inline an <svg> in a component. The design-system
// Iconography chapter renders this registry, so a new entry documents itself.

export type IconPart =
  | { el: "path"; d: string }
  | { el: "circle"; cx: number; cy: number; r: number; dot?: boolean }   // dot = filled, no stroke
  | { el: "rect"; x: number; y: number; width: number; height: number; rx?: number; transform?: string };

export type IconSet = "ui" | "activity" | "feature" | "transport";

export type IconDef = {
  set: IconSet;
  label: string;        // human name, also the default aria-label when `label` is requested
  parts: IconPart[];
};

const P = (d: string): IconPart => ({ el: "path", d });
const DOT = (cx: number, cy: number, r = 1.5): IconPart => ({ el: "circle", cx, cy, r, dot: true });
const RING = (cx: number, cy: number, r: number): IconPart => ({ el: "circle", cx, cy, r });

export const ICONS = {
  /* ---------------------------------------------------------------- UI */
  menu:            { set: "ui", label: "Menu",            parts: [P("M4 7h16M4 12h16M4 17h16")] },
  close:           { set: "ui", label: "Close",           parts: [P("M6 6l12 12M18 6L6 18")] },
  "chevron-down":  { set: "ui", label: "Expand",          parts: [P("M6 9l6 6 6-6")] },
  "chevron-up":    { set: "ui", label: "Collapse",        parts: [P("M6 15l6-6 6 6")] },
  "chevron-left":  { set: "ui", label: "Back",            parts: [P("M15 6l-6 6 6 6")] },
  "chevron-right": { set: "ui", label: "Forward",         parts: [P("M9 6l6 6-6 6")] },
  "arrow-right":   { set: "ui", label: "Go",              parts: [P("M4 12h16M13 5l7 7-7 7")] },
  "arrow-left":    { set: "ui", label: "Return",          parts: [P("M20 12H4M11 5l-7 7 7 7")] },
  external:        { set: "ui", label: "Opens elsewhere", parts: [P("M7 17L17 7M9 7h8v8")] },
  search:          { set: "ui", label: "Search",          parts: [RING(11, 11, 6), P("M15.5 15.5L21 21")] },
  plus:            { set: "ui", label: "Add",             parts: [P("M12 5v14M5 12h14")] },
  minus:           { set: "ui", label: "Remove",          parts: [P("M5 12h14")] },
  check:           { set: "ui", label: "Done",            parts: [P("M5 12l5 5 9-9")] },
  upload:          { set: "ui", label: "Upload",          parts: [P("M12 16V4m0 0l-5 5m5-5l5 5M4 20h16")] },
  file:            { set: "ui", label: "File",            parts: [P("M7 3h7l4 4v14H7V3zm7 0v4h4")] },
  sun:             { set: "ui", label: "Light theme",     parts: [RING(12, 12, 4), P("M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41")] },
  monitor:         { set: "ui", label: "System theme",    parts: [{ el: "rect", x: 3, y: 4, width: 18, height: 12, rx: 1.5 }, P("M8 20h8M12 16v4")] },
  moon:            { set: "ui", label: "Dark theme",      parts: [P("M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z")] },
  pin:             { set: "ui", label: "Place",           parts: [P("M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"), RING(12, 10, 2)] },

  /* ---------------------------------------------------------- Activity */
  ski:             { set: "activity", label: "Ski",        parts: [P("M3 20l18-7M3 16l18-7M9 4v7")] },
  snowboard:       { set: "activity", label: "Snowboard",  parts: [{ el: "rect", x: 9.5, y: 2.5, width: 5, height: 19, rx: 2.5, transform: "rotate(45 12 12)" }, P("M8 14l2 2M14 8l2 2")] },
  splitboard:      { set: "activity", label: "Splitboard", parts: [{ el: "rect", x: 8, y: 2.5, width: 3.4, height: 19, rx: 1.7, transform: "rotate(45 12 12)" }, { el: "rect", x: 12.6, y: 2.5, width: 3.4, height: 19, rx: 1.7, transform: "rotate(45 12 12)" }] },
  hike:            { set: "activity", label: "Hike",       parts: [P("M3 19l6-11 4 6 3-4 5 9"), DOT(18.5, 5, 1.2)] },
  "trail-run":     { set: "activity", label: "Trail run",  parts: [P("M3 18l5-6 4 4 5-8"), P("M18 5h3M17 9h3")] },
  bike:            { set: "activity", label: "Bike",       parts: [RING(6.5, 16, 3.5), RING(17.5, 16, 3.5), P("M6.5 16L10 9h5l2.5 7M10 9H8M15 9l-1-3h2")] },
  climb:           { set: "activity", label: "Climb",      parts: [{ el: "rect", x: 6, y: 3, width: 12, height: 18, rx: 5 }, P("M9 8v5")] },
  kayak:           { set: "activity", label: "Kayak",      parts: [{ el: "rect", x: 2, y: 10, width: 20, height: 4, rx: 2 }, P("M8 4l8 16M6.5 5.5l3-1M14.5 19.5l3-1")] },
  "wild-swim":     { set: "activity", label: "Wild swim",  parts: [P("M3 12c3-3 6-3 9 0s6 3 9 0M3 18c3-3 6-3 9 0s6 3 9 0"), DOT(8, 6)] },
  sail:            { set: "activity", label: "Sail",       parts: [P("M12 3v13M12 3l8 13H12M4 18h16l-2 3H6l-2-3")] },
  wakeboard:       { set: "activity", label: "Wakeboard",  parts: [{ el: "rect", x: 3, y: 14, width: 18, height: 4, rx: 2 }, P("M12 14V7l7-3M8 14v-2M16 14v-2")] },

  /* ----------------------------------------------- Feature (map legend) */
  fish:            { set: "feature", label: "Fishing",     parts: [P("M3 12c4-5 10-5 14 0-4 5-10 5-14 0zM17 12l4-4M17 12l4 4"), DOT(7, 11, 1)] },
  bird:            { set: "feature", label: "Birding",     parts: [P("M3 13c3-4 6-4 9 0M12 13c3-4 6-4 9 0")] },
  camp:            { set: "feature", label: "Camping",     parts: [P("M12 4L3 20h18L12 4M12 11l4 9")] },

  /* --------------------------------------- Transport (legend, 24-grid) */
  // Same construction as the 16-grid map glyphs in TransportIcons.tsx —
  // carriage profile with a door and two wheels; open four-segment bolt.
  train:           { set: "transport", label: "Train",     parts: [{ el: "rect", x: 4, y: 4, width: 16, height: 11, rx: 1.5 }, P("M12 4v11"), DOT(8, 18.5), DOT(16, 18.5)] },
  ev:              { set: "transport", label: "EV",        parts: [P("M15 3L7.5 12.75H12L9 21")] },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function iconsInSet(set: IconSet): IconName[] {
  return ICON_NAMES.filter((n) => ICONS[n].set === set);
}

// Map legend vocabulary (mapLegend in design-system.ts) → icon. Kept here so
// the legend chapter, the map key and any future legend read the same glyph.
export const LEGEND_ICON: Record<string, IconName> = {
  ev: "ev", train: "train", sail: "sail",
  ski: "ski", hike: "hike", bike: "bike", fish: "fish", kayak: "kayak",
  bird: "bird", climb: "climb", swim: "wild-swim", camp: "camp",
};
