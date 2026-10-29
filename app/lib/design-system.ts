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
    // display sizes (clamp = fluid between min and max viewport)
    display1: { size: "clamp(2.5rem, 5vw + 1rem, 4.5rem)", line: "1.05", tracking: "-0.015em" },
    display2: { size: "clamp(2rem, 3.5vw + 1rem, 3.25rem)", line: "1.1", tracking: "-0.01em" },
    title:    { size: "1.75rem", line: "1.15", tracking: "-0.005em" },
    section:  { size: "1.25rem", line: "1.25", tracking: "0" },
    body:     { size: "1rem",    line: "1.55", tracking: "0" },
    small:    { size: "0.875rem", line: "1.45", tracking: "0" },
    // UI labels — Archivo Narrow, all-caps
    label:    { size: "0.75rem", line: "1", tracking: "0.08em", transform: "uppercase" },
    micro:    { size: "0.6875rem", line: "1", tracking: "0.1em", transform: "uppercase" },
  },
} as const;

// Spacing scale — 4px base; 8pt grid for layout; sparse but opinionated.
export const spacing = {
  0: "0",
  0.5: "0.125rem",   // 2
  1: "0.25rem",      // 4
  2: "0.5rem",       // 8
  3: "0.75rem",      // 12
  4: "1rem",         // 16
  6: "1.5rem",       // 24
  8: "2rem",         // 32
  10: "2.5rem",      // 40
  12: "3rem",        // 48
  16: "4rem",        // 64
  20: "5rem",        // 80
  24: "6rem",        // 96
  32: "8rem",        // 128
} as const;

export const radii = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  pill: "9999px",
  card: "1.25rem",   // used on resort cards and story cards
} as const;

export const shadows = {
  none: "none",
  resting: "0 1px 2px rgb(30 30 30 / 0.06)",
  lifted:  "0 8px 24px -8px rgb(30 30 30 / 0.18)",
  modal:   "0 32px 64px -16px rgb(30 30 30 / 0.28)",
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

// Voice — the three-line brand ladder; the brand mark pairs with it on splash.
export const voice = {
  ladder: ["Share gear", "Buy less", "Ride more"],
  manifesto:
    "We connect riders to low carbon methods, in the protection of natural habitats harnessing the power of the outdoor community.",
  tagline: "Share gear. Buy less. Ride more.",
} as const;
