import Link from "next/link";
import type { Metadata } from "next";
import { IndexPage } from "@/app/ui/IndexPage";
import { getAllStories } from "@/app/content/stories";

export const metadata: Metadata = {
  title: "Stories — Oütlas",
  description:
    "Editorial pieces from the Oütlas community — long-form guides, interviews and essays from riders, guides and makers.",
};

export default function StoriesIndex() {
  const stories = getAllStories();
  return (
    <IndexPage
      eyebrow="Oütlas Stories"
      title="Share gear. Buy less. Ride more. Read deeper."
      dek="Long-form guides, interviews and essays from riders, guides and makers in the Oütlas community. Interactive where it earns it, editorial everywhere else."
      surface="story"
    >
      <ul className="divide-y divide-rule border-y border-rule">
        {stories.map((s, i) => (
          <li key={s.slug}>
            <Link
              href={s.href}
              className="group flex flex-col gap-6 py-10 transition-colors hover:bg-[var(--row-hover)] md:flex-row md:items-start md:gap-10"
            >
              <span className="font-mono text-sm text-ink-faint md:w-20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {s.series && <span className="chip">{s.series}</span>}
                  <span className="micro text-ink-faint">{s.season}</span>
                </div>
                <h2 className="mt-4 font-display text-display-2 leading-tight transition-colors group-hover:text-ink">
                  {s.title}
                </h2>
                <p className="mt-3 max-w-2xl font-ui text-base leading-relaxed text-ink-muted">
                  {s.dek}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 font-ui text-xs text-ink-muted md:w-40 md:text-right">
                <div>{s.byline}</div>
                <div className="mt-1 text-ink-faint">{s.readTime}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </IndexPage>
  );
}
