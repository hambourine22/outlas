import { AppShell } from "./AppShell";

/* -----------------------------------------------------------------
 * IndexPage — the editorial list layout used by /stories,
 * /rentals, /repairs and /guides. Hero band at the top (eyebrow +
 * display title + dek) and a tabular / card body underneath. Keeps
 * every category consistent so adding a new one is a single file.
 * ---------------------------------------------------------------- */
export function IndexPage({
  eyebrow,
  title,
  dek,
  surface,
  children,
}: {
  eyebrow: string;
  title: string;
  dek: string;
  surface?: "story" | "manifest" | "rental" | "repair" | "carbon";
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <article>
        <section
          data-surface={surface}
          className={surface ? "bg-canvas" : ""}
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
            <div className="flex items-center gap-3">
              <span className="chip">{eyebrow}</span>
            </div>
            <h1 className="mt-8 font-display leading-[0.95] tracking-[-0.02em] text-[clamp(2.5rem,6vw,5rem)]">
              {title}
            </h1>
            <p className="mt-8 max-w-2xl font-ui text-base leading-relaxed text-ink-muted">
              {dek}
            </p>
          </div>
        </section>
        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
            {children}
          </div>
        </section>
      </article>
    </AppShell>
  );
}
