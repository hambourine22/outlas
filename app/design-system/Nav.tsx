"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CHAPTERS, GROUPS, type Chapter } from "./nav-data";

/* -------------------------------------------------------------------------
 * NavProvider — shared drawer open/close state between TopBar and Sidebar.
 * Wrap the page in <NavProvider> so the hamburger can toggle the sidebar.
 * ---------------------------------------------------------------------- */
type NavState = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
};

const NavCtx = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Dismiss on Escape and lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <NavCtx.Provider value={{ drawerOpen, setDrawerOpen, toggleDrawer, closeDrawer }}>
      {children}
    </NavCtx.Provider>
  );
}

function useNav() {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return ctx;
}

/* -------------------------------------------------------------------------
 * TopBar — brand mark, product chip, utility links, theme switcher.
 * On narrow viewports a hamburger replaces the search field and toggles
 * the sidebar drawer.
 * ---------------------------------------------------------------------- */
export function TopBar() {
  const { drawerOpen, toggleDrawer } = useNav();
  return (
    <header
      className="sticky top-0 z-40 border-b border-rule bg-canvas/90 backdrop-blur-sm"
      role="banner"
    >
      <div className="relative flex h-14 items-center justify-between gap-3 px-3 md:gap-6 md:px-6">
        {/* Left: hamburger (below lg) + wordmark + version chip */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
            aria-controls="design-system-sidebar"
            onClick={toggleDrawer}
            className="flex h-9 w-9 items-center justify-center border border-rule text-ink lg:hidden"
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link
            href="/"
            className="font-display text-sm text-ink"
            aria-label="Oütlas home"
          >
            Oütlas
          </Link>
          <span className="chip hidden sm:inline-flex">v2 · Design System</span>
        </div>

        {/* Center medallion — absolute-positioned Ü in a white circle that
          * straddles the bottom border, 50% above / 50% below the nav line.
          * The circle's own fill acts as the semi-circular extension of the
          * nav background. */}
        <LogoMedallion />

        {/* Right: utility chips (md+) + theme switcher */}
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
      </div>
    </header>
  );
}

function LogoMedallion() {
  return (
    <Link
      href="/"
      aria-label="Oütlas home"
      className="pointer-events-auto absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full border border-rule bg-snow"
        aria-hidden
      >
        {/* Ü mark is always pine so it reads on the snow medallion in either
          * theme. No dark-mode swap needed. */}
        <Image
          src="/brand/mark/U_green.png"
          alt=""
          width={904}
          height={1314}
          priority
          className="h-8 w-auto"
        />
      </span>
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Sidebar — grouped primary navigation.
 * - At lg+: static inline rail, 240px wide.
 * - Below lg: fixed drawer that slides in from the left, with a
 *   backdrop. Dismisses on Escape, on backdrop click, and on item click.
 * ---------------------------------------------------------------------- */
export function Sidebar() {
  const { drawerOpen, closeDrawer } = useNav();
  const activeSlug = useActiveSection(CHAPTERS.map((c) => c.slug));

  return (
    <>
      {/* Backdrop — only renders when the drawer is open, below lg. */}
      <div
        onClick={closeDrawer}
        aria-hidden
        className={[
          "fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        id="design-system-sidebar"
        aria-label="Design system navigation"
        aria-hidden={!drawerOpen}
        className={[
          // Shared
          "overflow-y-auto border-r border-rule bg-canvas",
          // Below lg: fixed drawer
          "fixed inset-y-0 left-0 z-30 w-72 pt-16 transition-transform duration-200 ease-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          // lg+: static inline rail
          "lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100dvh-57px)] lg:w-64 lg:translate-x-0 lg:pt-0",
        ].join(" ")}
      >
        <nav className="space-y-10 px-4 py-8">
          {GROUPS.map((g) => (
            <section key={g.key}>
              <h3 className="label text-ink-faint">{g.label}</h3>
              <ul className="mt-3 space-y-1">
                {CHAPTERS.filter((c) => c.group === g.key).map((c) => (
                  <SidebarItem
                    key={c.slug}
                    chapter={c}
                    active={c.slug === activeSlug}
                    onNavigate={closeDrawer}
                  />
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({
  chapter,
  active,
  onNavigate,
}: {
  chapter: Chapter;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <li>
      <a
        href={`#${chapter.slug}`}
        onClick={onNavigate}
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
      className="sticky top-14 hidden h-[calc(100dvh-57px)] w-56 shrink-0 overflow-y-auto border-l border-rule bg-canvas xl:block"
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
