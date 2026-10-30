"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CHAPTERS, GROUPS, type Chapter } from "./nav-data";

/* -------------------------------------------------------------------------
 * TopBar — brand mark, product chip, utility links, theme switcher.
 * TwelveLabs-style docs chrome, Oütlas-skinned.
 * ---------------------------------------------------------------------- */
export function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-6 border-b border-rule bg-canvas/90 px-4 py-3 backdrop-blur-sm md:px-6"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/mark/U_green.png"
            alt="Oütlas"
            width={904}
            height={1314}
            priority
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/brand/mark/U_white.png"
            alt="Oütlas"
            width={904}
            height={1314}
            priority
            className="hidden h-6 w-auto dark:block"
          />
          <span className="font-display text-sm text-ink">Oütlas</span>
        </Link>
        <span className="chip">v2</span>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <SearchStub />
      </div>

      <nav className="flex items-center gap-2">
        <a
          href="https://github.com/hambourine22/outlas"
          target="_blank"
          rel="noreferrer"
          className="chip hidden md:inline-flex"
        >
          GitHub →
        </a>
        <a
          href="https://outlas.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="chip hidden md:inline-flex"
        >
          Live site →
        </a>
        <ThemeSwitcher />
      </nav>
    </header>
  );
}

function SearchStub() {
  return (
    <label className="flex w-full max-w-md items-center gap-2 border border-rule bg-canvas-raised px-3 py-1.5 text-ink-muted">
      <SearchIcon />
      <input
        type="search"
        placeholder="Search the system"
        aria-label="Search"
        className="w-full bg-transparent font-ui text-sm outline-none placeholder:text-ink-faint"
      />
      <span className="chip">/</span>
    </label>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Sidebar — grouped primary navigation. Groups are flat sections with a
 * micro label; items are text + optional caret for an expandable child
 * group. Active state driven by scroll-spy on the chapter anchor IDs.
 * ---------------------------------------------------------------------- */
export function Sidebar() {
  const activeSlug = useActiveSection(CHAPTERS.map((c) => c.slug));

  return (
    <aside
      className="hidden h-[calc(100dvh-57px)] shrink-0 overflow-y-auto border-r border-rule bg-canvas lg:block lg:w-64"
      aria-label="Design system navigation"
    >
      <nav className="space-y-10 px-4 py-8">
        {GROUPS.map((g) => (
          <section key={g.key}>
            <h3 className="label text-ink-faint">{g.label}</h3>
            <ul className="mt-3 space-y-1">
              {CHAPTERS.filter((c) => c.group === g.key).map((c) => (
                <SidebarItem key={c.slug} chapter={c} active={c.slug === activeSlug} />
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ chapter, active }: { chapter: Chapter; active: boolean }) {
  return (
    <li>
      <a
        href={`#${chapter.slug}`}
        aria-current={active ? "location" : undefined}
        className={[
          "flex items-center gap-3 border-l px-3 py-2 font-ui text-sm transition-colors",
          active
            ? "border-accent text-ink"
            : "border-transparent text-ink-muted hover:border-rule hover:text-ink",
        ].join(" ")}
      >
        <span className="font-mono text-xs text-ink-faint">{chapter.n}</span>
        <span>{chapter.title}</span>
      </a>
    </li>
  );
}

/* -------------------------------------------------------------------------
 * OnThisPage — right rail outline for the current page.
 * ---------------------------------------------------------------------- */
export function OnThisPage() {
  const activeSlug = useActiveSection(CHAPTERS.map((c) => c.slug));

  return (
    <aside
      className="sticky top-[57px] hidden h-[calc(100dvh-57px)] w-56 shrink-0 overflow-y-auto border-l border-rule bg-canvas xl:block"
      aria-label="On this page"
    >
      <nav className="px-6 py-8">
        <h3 className="label text-ink-faint">On this page</h3>
        <ul className="mt-3 space-y-1">
          {CHAPTERS.map((c) => (
            <li key={c.slug}>
              <a
                href={`#${c.slug}`}
                className={[
                  "block py-1.5 font-ui text-xs transition-colors",
                  c.slug === activeSlug
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                {c.n} · {c.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

/* ------------------------------------------------------------------
 * Scroll-spy. Watches section anchors by id and returns the slug of
 * whichever is nearest the top of the viewport.
 * ---------------------------------------------------------------- */
function useActiveSection(slugs: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(undefined);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).id;
          setActive(id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const s of slugs) {
      const el = document.getElementById(s);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [slugs]);
  return active;
}
