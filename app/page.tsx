import Map from "./ui/mapbox/map";
import { AppShell } from "./ui/AppShell";
import { getMapData } from "./content/map";

// Home needs live data from Vercel Postgres and must not be prerendered at
// build time — otherwise the build fails on any deploy without POSTGRES_URL.
export const dynamic = "force-dynamic";

export default async function Home(): Promise<JSX.Element> {
  // getMapData() tries Postgres and falls back to the typed content layer.
  // Guides come from the content layer either way until the DB schema is
  // extended to carry them.
  const { resorts, rentals, repairs, guides } = await getMapData();
  return (
    <AppShell>
      <Map resorts={resorts} rentals={rentals} repairs={repairs} guides={guides} />
    </AppShell>
  );
}