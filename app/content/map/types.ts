import type {
  Resorts,
  Rentals,
  Repairs,
} from "@/app/definitions/mapboxDefinitions";
import { mapPins } from "@/app/lib/design-system";

// Curated activity enum. Max 10 — intentionally short so the preview panel
// stays legible and the data layer stays honest. Added here (not on the
// Resorts type file) because content records and UI primitives both import
// from this module.
export const ACTIVITIES = [
  "ski",
  "snowboard",
  "splitboard",
  "hike",
  "trail-run",
  "bike",
  "climb",
  "kayak",
  "wild-swim",
  "sail",
  "wakeboard",
] as const;
export type Activity = (typeof ACTIVITIES)[number];

export const ACTIVITY_LABEL: Record<Activity, string> = {
  ski:          "Ski",
  snowboard:    "Snowboard",
  splitboard:   "Splitboard",
  hike:         "Hike",
  "trail-run":  "Trail run",
  bike:         "Bike",
  climb:        "Climb",
  kayak:        "Kayak",
  "wild-swim":  "Wild swim",
  sail:         "Sail",
  wakeboard:    "Wakeboard",
};

// Public category tag used by the map, the legend, and any detail panels.
// Each category binds to a brand colour via `CATEGORY_COLOUR`.
export type MapCategory = "resorts" | "rentals" | "repairs" | "guides";

// Guides are a new provider category — mountain / snow guides. Service
// providers in the Oütlas provider taxonomy, with their own pin colour.
export type Guides = {
  name: string;
  slug: string;
  item_id: string;
  disciplines: string;          // comma-separated for now, mirroring the
                                 // existing scalar text fields the DB
                                 // uses on resorts/rentals/repairs.
  languages: string;
  website: string;
  phone: string;
  rate_per_day: string;
  bio: string;
  regions: string;
  image_url: string;
  lat: number;
  long: number;
  status: "published" | "draft";
};

export type MapData = {
  resorts: Resorts[];
  rentals: Rentals[];
  repairs: Repairs[];
  guides: Guides[];
};

// Brand palette → pin colour by category. Pulled from the design system
// so a palette tweak in app/lib/design-system.ts does not need a code
// change on the map layer.
export const CATEGORY_COLOUR: Record<MapCategory, string> = {
  resorts: mapPins.categories.resorts.fill, // pine — product destination
  rentals: mapPins.categories.rentals.fill, // glacier — service provider
  repairs: mapPins.categories.repairs.fill, // rust — parts manufacturer
  guides:  mapPins.categories.guides.fill,  // sand — human expertise
};

// Pins are fill-only (no outline) — see mapPins in design-system.ts. The
// map layer, sidebar key, provider table and placeholder all use
// CATEGORY_COLOUR alone so they stay identical.

export const CATEGORY_LABEL: Record<MapCategory, string> = {
  resorts: "Resorts",
  rentals: "Rentals",
  repairs: "Repairs",
  guides:  "Guides",
};
