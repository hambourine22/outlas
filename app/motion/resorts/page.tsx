import type { Metadata } from "next";
import { AppShell } from "@/app/ui/AppShell";
import { getMapData } from "@/app/content/map";
import { motion, anatomy } from "@/app/lib/design-system";
import AnatomyMotion, { type AnatomyResort } from "./AnatomyMotion";

export const metadata: Metadata = {
  title: "Anatomy of a resort — Oütlas",
  description:
    "One contoured shape per resort: height is altitude, the ink band is what you can ski, width is how much there is, the rungs are lifts. One mountain reshaping into the next.",
};

// Reads the content layer (Postgres first, typed arrays as the fallback), so
// it must not be prerendered at build time — same rule as the home map.
export const dynamic = "force-dynamic";

// Extract only what the mountain form draws. A resort without mountain stats
// (a snowdome, a cable park) is not a mountain — it waits for its own form.
function extract(resorts: Awaited<ReturnType<typeof getMapData>>["resorts"]): { rows: AnatomyResort[]; skipped: number } {
  const rows: AnatomyResort[] = [];
  let skipped = 0;
  for (const r of resorts) {
    if (typeof r.peak_m !== "number" || typeof r.vertical_m !== "number" || typeof r.terrain_km !== "number") { skipped++; continue; }
    rows.push({
      name: r.name,
      slug: r.slug,
      country: r.country,
      peak: r.peak_m,
      base: Math.max(0, r.peak_m - r.vertical_m),
      terrain: r.terrain_km,
      lifts: r.lifts ?? 0,
      snowfall: r.snowfall_cm,
    });
  }
  return { rows, skipped };
}

export default async function AnatomyPage() {
  const { resorts } = await getMapData();
  const { rows, skipped } = extract(resorts);
  const reserved = anatomy.encodings.filter((e) => e.status === "reserved").map((e) => e.kind);

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-56px)] bg-canvas text-ink">
        <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
          <header className="border-b border-rule pb-8">
            <span className="label text-ink-faint">Explore · Motion</span>
            <h1 className="mt-3 font-display text-display-2 leading-tight text-ink">
              Anatomy of a resort
            </h1>
            <p className="mt-4 max-w-2xl font-ui text-base leading-relaxed text-ink-muted">
              One shape per resort, drawn the same way for all of them so they compare at a
              glance: height is altitude, the ink band is what you can ski, width is how much
              there is, the rungs are lifts. {rows.length} mountains, each holding for{" "}
              {motion.anatomy.dwell} s and reshaping into the next over {motion.anatomy.morph} s.
              {skipped > 0 && (
                <> {skipped} resorts without a mountain — the snowdomes and cable parks — wait for their own form ({reserved.join(", ")} are reserved).</>
              )}
            </p>
          </header>

          <div className="mx-auto mt-10 max-w-2xl">
            <AnatomyMotion resorts={rows} />
          </div>

          <dl className="mt-12 grid gap-6 border-t border-rule pt-8 font-ui text-sm md:grid-cols-3">
            <div>
              <dt className="label text-ink-faint">Numbers</dt>
              <dd className="mt-2 text-ink-muted">
                <code className="font-mono text-ink">app/content/map/resorts.ts</code> through the content facade — peak, vertical drop, pisted terrain, lifts, snowfall. Nothing is typed into the piece.
              </dd>
            </div>
            <div>
              <dt className="label text-ink-faint">Shape</dt>
              <dd className="mt-2 text-ink-muted">
                <code className="font-mono text-ink">anatomy</code> tokens + <code className="font-mono text-ink">app/lib/anatomy.ts</code> — fixed domains ({anatomy.domain.altitude} m · {anatomy.domain.terrain} km), contours every {anatomy.contour} m, one geometry shared with the SVG primitive on the design-system page.
              </dd>
            </div>
            <div>
              <dt className="label text-ink-faint">Colour, type, timing</dt>
              <dd className="mt-2 text-ink-muted">
                Semantic tokens read at draw time — light, dark and system — with the lift line in the accent. Vollkorn, Archivo Narrow, Geist Mono via <code className="font-mono text-ink">next/font</code>. Frame, dwell, morph, ease and export sizes from <code className="font-mono text-ink">motion</code>.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
