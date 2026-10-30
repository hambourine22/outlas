import Link from "next/link";
import Map from "./ui/mapbox/map";
import { AppShell } from "./ui/AppShell";
import { fetchResorts, fetchRentals, fetchRepairs } from "./lib/data";

// Home needs live data from Vercel Postgres and must not be prerendered at
// build time — otherwise the build fails on any deploy without POSTGRES_URL.
export const dynamic = "force-dynamic";

export default async function Home(): Promise<JSX.Element> {
  // Degrade gracefully: if Postgres is unreachable (no env, no connection),
  // render a landing shell with a link into /design-system instead of 500.
  let body: JSX.Element;
  try {
    const [resorts, rentals, repairs] = await Promise.all([
      fetchResorts(),
      fetchRentals(),
      fetchRepairs(),
    ]);
    body = <Map resorts={resorts} rentals={rentals} repairs={repairs} />;
  } catch {
    body = <LandingShell />;
  }
  return <AppShell>{body}</AppShell>;
}

function LandingShell() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-57px)] max-w-4xl flex-col justify-between px-6 py-20 md:px-10 md:py-28">
      <header>
        <span className="label text-ink-muted">Oütlas</span>
      </header>
      <section className="space-y-10">
        <h1 className="font-display text-display-1 leading-[1.02]">
          Share gear.
          <br />
          Buy less.
          <br />
          Ride more.
        </h1>
        <p className="max-w-xl font-ui text-base leading-relaxed text-ink-muted">
          We connect riders to low carbon methods, in the protection of
          natural habitats, harnessing the power of the outdoor community.
        </p>
        <Link href="/design-system" className="chip">
          View the design system
        </Link>
      </section>
      <footer className="font-ui text-xs text-ink-faint">
        The map is unavailable in this deploy (no database connected).
        Visit <Link href="/design-system" className="underline">/design-system</Link>.
      </footer>
    </div>
  );
}