import type { Metadata } from "next";
import { AppShell } from "@/app/ui/AppShell";
import { getMapData } from "@/app/content/map";
import { motion } from "@/app/lib/design-system";
import ResortsMotion, { type MotionResort } from "./ResortsMotion";

export const metadata: Metadata = {
  title: "Anatomy of a mountain — Oütlas",
  description:
    "100 resorts drawn three ways: where they are, how high they go, how much there is to ride. An eight-second loop built from the content layer and the design tokens.",
};

// Reads the content layer (Postgres first, typed arrays as the fallback), so
// it must not be prerendered at build time — same rule as the home map.
export const dynamic = "force-dynamic";

// Extract only what the piece draws. Altitude = peak and base (peak − vertical),
// size = pisted terrain and lift count, space = longitude and latitude.
function extract(resorts: Awaited<ReturnType<typeof getMapData>>["resorts"]): MotionResort[] {
  return resorts
    .filter((r) => typeof r.peak_m === "number" && typeof r.terrain_km === "number")
    .map((r) => ({
      name: r.name,
      country: r.country,
      lon: r.long,
      lat: r.lat,
      peak: r.peak_m as number,
      base: Math.max(0, (r.peak_m as number) - (r.vertical_m ?? 0)),
      terrain: r.terrain_km as number,
      lifts: r.lifts ?? 0,
    }));
}

export default async function ResortsMotionPage() {
  const { resorts } = await getMapData();
  const rows = extract(resorts);

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-56px)] bg-canvas text-ink">
        <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
          <header className="border-b border-rule pb-8">
            <span className="label text-ink-faint">Explore · Motion</span>
            <h1 className="mt-3 font-display text-display-2 leading-tight text-ink">
              Anatomy of a mountain
            </h1>
            <p className="mt-4 max-w-2xl font-ui text-base leading-relaxed text-ink-muted">
              {rows.length} resorts drawn three ways — where they are, how high they
              go, how much there is to ride. Three strata lie flat as one sheet, fold
              into a stack, get read west to east by a playhead, and fold back.
              {" "}{motion.loop} seconds, on a loop. Framed {motion.frame.w} × {motion.frame.h} for export.
            </p>
          </header>

          <div className="mx-auto mt-10 max-w-2xl">
            <ResortsMotion resorts={rows} />
          </div>

          <dl className="mt-12 grid gap-6 border-t border-rule pt-8 font-ui text-sm md:grid-cols-3">
            <div>
              <dt className="label text-ink-faint">Numbers</dt>
              <dd className="mt-2 text-ink-muted">
                <code className="font-mono text-ink">app/content/map/resorts.ts</code> through the
                content facade — peak, vertical drop, pisted terrain, lifts, longitude, latitude. Nothing is typed into the piece.
              </dd>
            </div>
            <div>
              <dt className="label text-ink-faint">Timing &amp; frame</dt>
              <dd className="mt-2 text-ink-muted">
                <code className="font-mono text-ink">motion</code> in{" "}
                <code className="font-mono text-ink">app/lib/design-system.ts</code> — loop, fold, ease, view angles, stroke weights, opacities, export sizes.
              </dd>
            </div>
            <div>
              <dt className="label text-ink-faint">Colour &amp; type</dt>
              <dd className="mt-2 text-ink-muted">
                The semantic tokens, read at draw time — so it follows light, dark and system — with one emphasis from the dataviz series. Vollkorn, Archivo Narrow and Geist Mono via <code className="font-mono text-ink">next/font</code>.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
