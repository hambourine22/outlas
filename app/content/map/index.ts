import { fetchResorts, fetchRentals, fetchRepairs } from "@/app/lib/data";
import { RESORTS } from "./resorts";
import { RENTALS } from "./rentals";
import { REPAIRS } from "./repairs";
import { GUIDES }  from "./guides";
import type { MapData } from "./types";

export type { Guides, MapCategory, MapData } from "./types";
export { CATEGORY_COLOUR, CATEGORY_LABEL } from "./types";
export { RESORTS } from "./resorts";
export { RENTALS } from "./rentals";
export { REPAIRS } from "./repairs";
export { GUIDES }  from "./guides";

/* -----------------------------------------------------------------
 * getMapData — single entry point for every page / server component
 * that needs resort / rental / repair / guide data. Behaviour:
 *
 *   1. Try Postgres (fetchResorts/Rentals/Repairs). If any returns a
 *      non-empty array, that wins — real data trumps seed data.
 *   2. If Postgres fails outright, or returns empty, fall back to
 *      the typed arrays in this folder.
 *
 * Guides are not in the Postgres schema yet, so they always come from
 * the content layer. When a `guides` table lands, add a fetchGuides()
 * and extend the merge below — the signature stays the same, so
 * callers never change.
 * ---------------------------------------------------------------- */
export async function getMapData(): Promise<MapData> {
  let resorts = RESORTS;
  let rentals = RENTALS;
  let repairs = REPAIRS;
  const guides = GUIDES;

  try {
    const [r1, r2, r3] = await Promise.all([
      fetchResorts(),
      fetchRentals(),
      fetchRepairs(),
    ]);
    if (r1.length) resorts = r1;
    if (r2.length) rentals = r2;
    if (r3.length) repairs = r3;
  } catch {
    // Postgres unreachable — keep seed arrays as-is.
  }

  return { resorts, rentals, repairs, guides };
}
