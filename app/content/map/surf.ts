/* -----------------------------------------------------------------
 * Surf spots — the first non-mountain kind in the anatomy family. Three
 * curated, approximate records chosen for contrast: a canyon that points
 * at a beach, a gouf a few km off a sandbar coast, a shallow northern reef.
 * Figures are rounded public numbers, not surveys — the UI says "approx".
 *   depth_m    — the offshore bathymetry that shapes the break (canyon /
 *                channel depth), metres below the waterline
 *   coast_km   — the surfable coast, kilometres along the shore
 *   population — the town, people (one rung per 1,000 in the glyph)
 * ---------------------------------------------------------------- */

export type SurfSpot = {
  name: string;
  slug: string;
  country: string;
  lat: number;
  long: number;
  depth_m: number;
  coast_km: number;
  population: number;
  note: string;
};

export const SURF: SurfSpot[] = [
  {
    name: "Nazaré", slug: "nazare", country: "Portugal", lat: 39.6019, long: -9.0706,
    depth_m: 5000, coast_km: 2.5, population: 10000,
    note: "The Nazaré Canyon reaches ~5,000 m and aims at Praia do Norte; parish ≈ 10,000 (2011 census). Approximate.",
  },
  {
    name: "Hossegor", slug: "hossegor", country: "France", lat: 43.665, long: -1.43,
    depth_m: 3000, coast_km: 4, population: 3800,
    note: "The Gouf de Capbreton drops to ~3,000 m within a few km of the sandbars; Soorts-Hossegor ≈ 3,800 (2020). Approximate.",
  },
  {
    name: "Thurso", slug: "thurso", country: "Scotland", lat: 58.5959, long: -3.521,
    depth_m: 80, coast_km: 2, population: 7900,
    note: "The Pentland Firth channel runs ~60–90 m deep off the Thurso East reef; town ≈ 7,900 (2011 census). Approximate.",
  },
];
