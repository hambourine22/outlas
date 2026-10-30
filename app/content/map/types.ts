import type {
  Resorts,
  Rentals,
  Repairs,
} from "@/app/definitions/mapboxDefinitions";

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
  resorts: "#2F5349", // pine — product destination
  rentals: "#ADCFD3", // glacier — service provider
  repairs: "#B04B50", // rust — parts manufacturer
  guides:  "#FFF6C3", // sand — human expertise
};

export const CATEGORY_LABEL: Record<MapCategory, string> = {
  resorts: "Resorts",
  rentals: "Rentals",
  repairs: "Repairs",
  guides:  "Guides",
};
