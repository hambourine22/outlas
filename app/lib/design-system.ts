// Oütlas design system — single source of truth for brand tokens.
// Values match the Oütlas brand book (v1.3).

export const colors = {
  sand:    { hex: "#FFF6C3", rgb: "255 246 195", cmyk: "1 1 29 0",   name: "Sand",    swatch: "Yellow" },
  carbon:  { hex: "#1E1E1E", rgb: "30 30 30",    cmyk: "72 66 65 75", name: "Carbon",  swatch: "Black" },
  snow:    { hex: "#FFFFFF", rgb: "255 255 255", cmyk: "0 0 0 0",    name: "Snow",    swatch: "White" },
  rust:    { hex: "#B04B50", rgb: "176 75 80",   cmyk: "24 82 64 10", name: "Rust",    swatch: "Red" },
  pine:    { hex: "#2F5349", rgb: "47 83 73",    cmyk: "79 47 66 37", name: "Pine",    swatch: "Green" },
  glacier: { hex: "#ADCFD3", rgb: "173 207 211", cmyk: "32 8 15 0",  name: "Glacier", swatch: "Blue" },
} as const;

export type ColorKey = keyof typeof colors;

// Semantic surfaces. Themes bind to UX moments (rental / repair / story).
export const surfaces = {
  rental:   { bg: colors.sand.hex,    accent: colors.pine.hex, ink: colors.carbon.hex },
  repair:   { bg: colors.rust.hex,    accent: colors.snow.hex, ink: colors.snow.hex   },
  story:    { bg: colors.glacier.hex, accent: colors.pine.hex, ink: colors.carbon.hex },
  manifest: { bg: colors.sand.hex,    accent: colors.pine.hex, ink: colors.pine.hex   },
  default:  { bg: colors.snow.hex,    accent: colors.pine.hex, ink: colors.carbon.hex },
} as const;

// -------------------------------------------------------------------------
// THEMES — light, dark, and system (honours prefers-color-scheme).
// Both themes are built strictly from the six brand colours. Nothing new,
// nothing picked by eye. Semantic separation (card vs background) comes from
// hairline rules, not from a third shade — this matches the editorial system.
// Toggle via <html data-theme="light|dark"> (absent = system).
// Keep this in sync with the :root blocks in globals.css.
// -------------------------------------------------------------------------
export const themes = {
  light: {
    canvas:        colors.snow.hex,       // #FFFFFF
    canvasRaised:  colors.snow.hex,       // same; separate with rules
    ink:           colors.carbon.hex,     // #1E1E1E
    inkMuted:      "rgb(30 30 30 / 0.6)",   // carbon @ 60%
    inkFaint:      "rgb(30 30 30 / 0.35)",  // carbon @ 35%
    rule:          "rgb(30 30 30 / 0.15)",  // carbon @ 15%
    accent:        colors.pine.hex,       // #2F5349
    rowHover:      "rgb(30 30 30 / 0.07)",  // sidebar / list hover wash
    rowActive:     "rgb(30 30 30 / 0.10)",  // current item wash
    chromeBg:      "rgb(255 255 255 / 0.9)", // sticky TopBar fill (snow @ 90%)
    scrim:         "rgb(30 30 30 / 0.4)",   // drawer backdrop — always carbon
  },
  dark: {
    canvas:        colors.carbon.hex,     // #1E1E1E — never full black
    canvasRaised:  colors.carbon.hex,     // same; separate with rules
    ink:           colors.snow.hex,       // #FFFFFF
    inkMuted:      "rgb(255 255 255 / 0.6)",   // snow @ 60%
    inkFaint:      "rgb(255 255 255 / 0.35)",  // snow @ 35%
    rule:          "rgb(255 255 255 / 0.15)",  // snow @ 15%
    accent:        colors.glacier.hex,    // #ADCFD3 (pine is too dark on carbon)
    rowHover:      "rgb(255 255 255 / 0.08)",
    rowActive:     "rgb(255 255 255 / 0.12)",
    chromeBg:      "rgb(30 30 30 / 0.9)",   // carbon @ 90%
    scrim:         "rgb(30 30 30 / 0.6)",   // carbon @ 60%
  },
} as const;

export type ThemeKey = keyof typeof themes;
export type ThemeMode = ThemeKey | "system";

export type SurfaceKey = keyof typeof surfaces;

// Typography — Vollkorn for editorial/display, Archivo Narrow for UI labels.
// Both are loaded via next/font/google in app/layout.tsx.
export const typography = {
  families: {
    display: "var(--font-vollkorn), ui-serif, Georgia, serif",
    ui: "var(--font-archivo), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
  },
  scale: {
    // Chapter marker — huge numeral per TwelveLabs-style editorial pages.
    chapter:  { size: "clamp(5rem, 10vw, 10rem)", line: "0.95", tracking: "-0.03em" },
    // display sizes (clamp = fluid between min and max viewport)
    display1: { size: "clamp(2.5rem, 5vw + 1rem, 4.5rem)", line: "1.05", tracking: "-0.015em" },
    display2: { size: "clamp(2rem, 3.5vw + 1rem, 3.25rem)", line: "1.1", tracking: "-0.01em" },
    title:    { size: "1.75rem",  line: "1.15", tracking: "-0.01em" },
    section:  { size: "1.25rem",  line: "1.25", tracking: "-0.005em" },
    body:     { size: "1rem",     line: "1.55", tracking: "0" },
    small:    { size: "0.875rem", line: "1.45", tracking: "0" },
    // UI labels — Archivo Narrow, all-caps
    label:    { size: "0.75rem",   line: "1", tracking: "0.02em", transform: "uppercase" },
    micro:    { size: "0.6875rem", line: "1", tracking: "0.04em", transform: "uppercase" },
  },
} as const;

// -------------------------------------------------------------------------
// GRID — Power of 4.
// A 4×4 structure forms a 12-column grid. At narrower viewports the grid
// collapses to 6, 4, 3, or 2 columns while the rhythm (4%) stays constant.
// All spacing, radii, and sizing values round to the nearest multiple of 4px.
// -------------------------------------------------------------------------
export const grid = {
  columns:   12,
  scaleTo:   [12, 6, 4, 3, 2] as const,
  marginPct: 4,   // margin  = 4% of the viewport's shortest side
  gutterPct: 8,   // gutter  = 2 × margin
  baseUnit:  4,   // every length rounds to the nearest 4px
  breakpoints: {
    sm: 640,   // ≥ 2 cols
    md: 768,   // ≥ 4 cols
    lg: 1024,  // ≥ 6 cols
    xl: 1280,  // full 12 cols
  },
} as const;

// Spacing scale — Power of 4. Each rung is a multiple of 4px. The key is the
// rung name (4 = 16px, 8 = 32px, etc.); no sub-4px half-steps allowed.
export const spacing = {
  0:  "0",
  1:  "0.25rem",     // 4
  2:  "0.5rem",      // 8
  3:  "0.75rem",     // 12
  4:  "1rem",        // 16
  6:  "1.5rem",      // 24
  8:  "2rem",        // 32
  10: "2.5rem",      // 40
  12: "3rem",        // 48
  16: "4rem",        // 64
  20: "5rem",        // 80
  24: "6rem",        // 96
  32: "8rem",        // 128
} as const;

// Oütlas has flattened its radii in v2 of the system. The brand reads as
// editorial, not web-app. Only `chip` and `pill` keep their curvature.
export const radii = {
  none: "0",
  hairline: "2px",    // default for any surface that must have one
  sm:  "4px",
  md:  "6px",
  chip: "9999px",     // meta tags and status labels
  pill: "9999px",     // score pills, filter pills
} as const;

// Oütlas prefers hairline outlines over drop shadows. Depth comes from
// surface tone, not elevation. Keep this list minimal.
export const outlines = {
  hairline: "1px solid rgb(30 30 30 / 0.12)",
  rule:     "1px solid rgb(30 30 30 / 0.2)",
  strong:   "1px solid rgb(30 30 30 / 0.6)",
  inverse:  "1px solid rgb(255 255 255 / 0.3)",
} as const;

// Shadows are reserved for truly floating surfaces (modals, popovers).
// Cards and resting components use outlines instead.
export const shadows = {
  none: "none",
  modal: "0 32px 64px -16px rgb(30 30 30 / 0.28)",
} as const;

// Breakpoints — mobile-first; a tablet pivot and a desktop pivot.
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

// Provider taxonomy — matches the brand book's three-circle diagram.
export const providers = [
  { key: "parts",    label: "Parts Manufacturer",    tone: "red" as const },
  { key: "products", label: "Products Manufacturer", tone: "green" as const },
  { key: "service",  label: "Service Provider",      tone: "blue" as const },
] as const;

// Resort score dimensions — rendered in the Resort Score panel.
export const scoreDimensions = [
  { key: "total",          label: "Total Score",         kind: "composite" },
  { key: "sustainability", label: "Sustainability",       kind: "pillar" },
  { key: "family",         label: "Family",               kind: "pillar" },
  { key: "accessibility",  label: "Accessibility",        kind: "pillar" },
  { key: "femaleFriendly", label: "Female Friendly",      kind: "pillar" },
  { key: "lackOfRacism",   label: "Lack Of Racism",       kind: "pillar" },
  { key: "lgbtqFriendly",  label: "LGBTQ+ Friendly",      kind: "pillar" },
  { key: "lackOfCrime",    label: "Lack Of Crime",        kind: "pillar" },
  { key: "costDayPass",    label: "Cost / Day Pass",      kind: "currency" },
  { key: "costSeasonPass", label: "Cost / Season Pass",   kind: "currency" },
  { key: "nearestRail",    label: "Nearest Rail Station", kind: "poi" },
  { key: "nearestCharge",  label: "Nearest Charge Point", kind: "poi" },
] as const;

// Score pill bands — pill colour reflects where the value sits on a 0–5 scale.
export const scoreBands = [
  { min: 0, max: 1, label: "Very poor", surface: colors.rust.hex,   ink: colors.snow.hex   },
  { min: 1, max: 2, label: "Poor",      surface: colors.rust.hex,   ink: colors.snow.hex   },
  { min: 2, max: 3, label: "Fair",      surface: colors.sand.hex,   ink: colors.carbon.hex },
  { min: 3, max: 4, label: "Good",      surface: colors.pine.hex,   ink: colors.snow.hex   },
  { min: 4, max: 5, label: "Very good", surface: colors.carbon.hex, ink: colors.snow.hex   },
] as const;

// Map pins — one circle per record, fill only: no outline. The fill is the
// category colour at full opacity. Sharpness comes from integer radii that
// step with zoom (so the world view stays legible where resorts cluster),
// not from a stroke — a translucent 1px stroke is all anti-alias fringe and
// reads soft, and an opaque ring was judged too heavy on the editorial
// basemap.
// Consumed by app/content/map/types.ts (CATEGORY_COLOUR) and drawn by the
// `locations` circle layer in app/ui/mapbox/map.tsx. Key dots everywhere
// use the same fill.
export const mapPins = {
  radius: [
    { zoom: 1, px: 5 },   // world view
    { zoom: 4, px: 7 },   // continent
    { zoom: 8, px: 9 },   // region and closer
  ],
  categories: {
    resorts: { label: "Resorts", fill: colors.pine.hex,    role: "Product destination" },
    rentals: { label: "Rentals", fill: colors.glacier.hex, role: "Service provider" },
    repairs: { label: "Repairs", fill: colors.rust.hex,    role: "Parts manufacturer" },
    guides:  { label: "Guides",  fill: colors.sand.hex,    role: "Human expertise" },
  },
} as const;

export type MapPinCategory = keyof typeof mapPins.categories;

// Map legend — categories drawn on the Scotland (and future) map views.
export const mapLegend = {
  transport: [
    { key: "ev",    label: "EV" },
    { key: "train", label: "Train" },
    { key: "sail",  label: "Sail" },
  ],
  features: [
    { key: "ski",         label: "Ski" },
    { key: "hike",        label: "Hike" },
    { key: "bike",        label: "Bike Trails" },
    { key: "fish",        label: "Fishing" },
    { key: "kayak",       label: "Kayak" },
    { key: "bird",        label: "Birding" },
    { key: "climb",       label: "Rock Climbing" },
    { key: "swim",        label: "Wild Swimming" },
    { key: "camp",        label: "Camping" },
  ],
} as const;

// Design principles — the four load-bearing rules behind every surface.
export const principles = [
  {
    n: 1,
    title: "Decluttered Components",
    kind: "Content-driven",
    body: "Interface elements stay minimal so storytelling content and product visuals lead the eye.",
  },
  {
    n: 2,
    title: "Theming with Colour & Type",
    kind: "Tailored experience",
    body: "Each UX moment (rental, repair, story) carries its own surface pairing applied across the buying flow.",
  },
  {
    n: 3,
    title: "Familiar UX Patterns",
    kind: "Amplified storytelling",
    body: "The 'Story' mobile pattern is reused for product and resort narratives — immersive, swipeable, intuitive.",
  },
  {
    n: 4,
    title: "Going Fullscreen",
    kind: "Content-driven",
    body: "Transparent headers over a 2:3 visual ratio give PLPs an editorial, cover-shot opening.",
  },
] as const;

// -------------------------------------------------------------------------
// DATA VISUALISATION — line charts, bars, series.
// Oütlas dataviz uses the masterbrand palette on a transparent canvas with
// hairline dashed grids and solid Carbon axes. The series order below is the
// default — pick in sequence; the fifth series is for comparisons only.
// -------------------------------------------------------------------------
export const dataviz = {
  // Series colour cycle — strictly brand. Picked for cross-theme legibility:
  // pine and rust read well on snow; glacier and sand read well on carbon;
  // rust and glacier work in both. The sixth brand colour (snow / carbon
  // itself) is reserved — never a series. Cap at three categories where
  // possible; split a fourth onto a second chart rather than reach for #4.
  series: [
    { key: "pine",    stroke: colors.pine.hex,    dot: colors.pine.hex    },
    { key: "rust",    stroke: colors.rust.hex,    dot: colors.rust.hex    },
    { key: "glacier", stroke: colors.glacier.hex, dot: colors.glacier.hex },
    { key: "sand",    stroke: colors.sand.hex,    dot: colors.sand.hex    },
    { key: "carbon",  stroke: colors.carbon.hex,  dot: colors.carbon.hex  },
  ] as const,
  axis:  { stroke: "var(--ink)",      width: 1 },
  grid:  { stroke: "var(--rule)",     width: 1, dash: "2 4" },
  dot:   { radius: 5, strokeWidth: 2, strokeColor: "var(--canvas)" },
  line:  { strokeWidth: 2 },
  background: "transparent",
  types: [
    { key: "line",    label: "Line",            use: "Score over time, prices across seasons." },
    { key: "area",    label: "Area",            use: "A line emphasised — one series, filled below." },
    { key: "bar",     label: "Bar",             use: "Discrete comparisons — resort scores side by side." },
    { key: "stacked", label: "Stacked bar",     use: "Share-of-whole — provider mix per resort." },
    { key: "scatter", label: "Scatter",         use: "Two dimensions — cost vs. sustainability." },
    { key: "radar",   label: "Radar",           use: "The 8-pillar resort score, at a glance." },
  ] as const,
} as const;

// -------------------------------------------------------------------------
// MOTION — art direction for animated data pieces. The reference is the
// "Anatomy" sheet: numbered strata that lie flat as one sheet, fold into an
// oblique stack, get swept by a playhead, and fold back. Eight seconds, on a
// loop, framed 4:5 for export.
//
// JS-only tokens (canvas reads them directly). Durations in seconds, angles
// in degrees, stroke widths in CSS px on the 1080-wide frame, opacities 0–1.
// Colours are never here: a motion piece reads --canvas / --ink / --rule /
// --accent at draw time so it follows light, dark and system, and takes its
// one emphasis colour from dataviz.series. Fonts come from the next/font
// variables (--font-vollkorn, --font-archivo, --font-geist-mono).
// Rendered at /motion/resorts; documented in the Motion chapter.
// -------------------------------------------------------------------------
export const motion = {
  frame:  { w: 1080, h: 1350 },                       // 4:5 portrait — the export size
  loop:   8,                                          // one journey, seconds
  morph:  1.6,                                        // sheet ⇄ stack fold, seconds
  drawIn: 1.2,                                        // hairlines and marks appear, seconds
  ease:   { name: "power2.inOut", css: "cubic-bezier(0.45, 0, 0.55, 1)" },
  view: {
    oblique: { shear: 0.42, squash: 0.3 },            // the strata view: x shear per unit depth, y squash
    isoAxis: 30,                                      // the 30° axes, for any true isometric variant
  },
  lean:   60,                                         // leader angle from the horizontal, degrees
  stroke: {
    line:   1,                                        // routes, bars, borders
    rule:   0.5,                                      // plane edges, cells, grids
    leader: 0.75,                                     // dashed leaders
    leaderDash: [6, 5],
    gridDash:   [2, 4],
  },
  opacity: {
    cells: 0.03, grid: 0.3, rules: 0.55, leaders: 0.7, marks: 0.9, playhead: 0.75,
  },
  strata: [
    { n: "01", key: "space",    title: "space",    sub: "by longitude and latitude" },
    { n: "02", key: "altitude", title: "altitude", sub: "base to peak, metres" },
    { n: "03", key: "size",     title: "size",     sub: "pisted terrain, km" },
  ],
  export: {
    sizes: { 1080: [1080, 1350], 1440: [1440, 1800], 2160: [2160, 2700] },
    fps: 30,
    mimes: [
      "video/mp4;codecs=avc1.640028",
      "video/mp4;codecs=avc1.4d0028",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm",
    ],
  },
} as const;

// Voice — the three-line brand ladder; the brand mark pairs with it on splash.
export const voice = {
  ladder: ["Share gear", "Buy less", "Ride more"],
  manifesto:
    "We connect riders to low carbon methods, in the protection of natural habitats harnessing the power of the outdoor community.",
  tagline: "Share gear. Buy less. Ride more.",
} as const;
