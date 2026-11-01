"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFade, useSlideIn } from "@/app/ui/motion/panels";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { CHAPTERS, GROUPS, type Chapter, type Group } from "./nav-data";

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
 * TopBar — right-handed.
 * Left:   brand typemark (+ Design System chip on that route).
 * Centre: medallion.
 * Right:  theme switcher then the hamburger, as a single pair of controls
 *         that live where the sidebar drawer now swings in from.
 * ---------------------------------------------------------------------- */
export function TopBar() {
  const { drawerOpen, toggleDrawer } = useNav();
  const pathname = usePathname();
  // Only the Design System route carries its "v2 · Design System" chip —
  // on app routes it would read awkwardly.
  const isDesignSystem = pathname?.startsWith("/design-system") ?? false;
  return (
    <header
      className="sticky top-0 z-40 border-b border-rule bg-[var(--chrome-bg)] backdrop-blur-sm"
      role="banner"
    >
      <div className="relative flex h-14 items-center justify-between gap-3 px-3 md:gap-6 md:px-6">
        {/* Left: brand typemark + version chip */}
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Oütlas home" className="flex items-center">
            {/* Pine typemark on snow in light; snow typemark on carbon in
              * dark. Theme-match utilities handle System mode too. */}
            <Image
              src="/brand/logotype/logotype_green.png"
              alt="Oütlas"
              width={2213}
              height={478}
              priority
              className="theme-light-only h-5 w-auto"
            />
            <Image
              src="/brand/logotype/logotype_white.png"
              alt=""
              aria-hidden
              width={2213}
              height={478}
              priority
              className="theme-dark-only h-5 w-auto"
            />
          </Link>
          {isDesignSystem && (
            <span className="chip hidden sm:inline-flex">v2 · Design System</span>
          )}
        </div>

        {/* Center medallion — absolute-positioned Ü in a white circle that
          * straddles the bottom border, 50% above / 50% below the nav line.
          * The circle's own fill acts as the semi-circular extension of the
          * nav background. */}
        <LogoMedallion />

        {/* Right: theme switcher + sidebar handle. The hamburger lives on
          * the right so the handle is on the same side as the drawer it
          * opens. GitHub + Live site chips moved into the drawer itself. */}
        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          <button
            type="button"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
            aria-controls="design-system-sidebar"
            onClick={toggleDrawer}
            className="flex h-9 w-9 items-center justify-center border border-rule text-ink transition-colors hover:bg-[var(--row-hover)]"
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
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
      {/* Rule: the medallion Ü ALWAYS matches the typemark colour.
       * Pine on pine (light), snow on snow (dark). The medallion fill
       * meanwhile tracks --canvas so the semi-circle reads as a
       * continuous extension of the nav background. */}
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full border border-rule bg-canvas"
        aria-hidden
      >
        <Image
          src="/brand/mark/U_green.png"
          alt=""
          width={904}
          height={1314}
          priority
          className="theme-light-only h-8 w-auto"
        />
        <Image
          src="/brand/mark/U_white.png"
          alt=""
          aria-hidden
          width={904}
          height={1314}
          priority
          className="theme-dark-only h-8 w-auto"
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

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Sidebar — right-handed drawer.
 * One behaviour at every breakpoint: a fixed drawer that slides in from
 * the right, driven by the single TopBar hamburger. Dismisses on Escape,
 * on backdrop click, and on item click. Utility links (GitHub, Live site)
 * live in a footer section so they share the drawer with the groups.
 * ---------------------------------------------------------------------- */
export function Sidebar({
  chapters = CHAPTERS,
  groups = GROUPS,
}: {
  chapters?: Chapter[];
  groups?: Group[];
} = {}) {
  const { drawerOpen, closeDrawer } = useNav();
  const pathname = usePathname();
  // Anchor-mode chapters feed scroll-spy; route-mode fall back to pathname.
  const anchorSlugs = chapters.filter((c) => !c.href).map((c) => c.slug);
  const spiedSlug = useActiveSection(anchorSlugs);
  const activeSlug =
    spiedSlug ??
    chapters.find((c) => c.href && c.href === pathname)?.slug;

  // Slide and scrim run on GSAP with the shared panel motion (quart in-out,
  // motion.panel), not CSS transitions. The translate-x-full and opacity-0
  // classes are only the server-rendered closed state.
  const scrimRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  useFade(scrimRef, drawerOpen);
  useSlideIn(drawerRef, drawerOpen);

  return (
    <>
      {/* Backdrop — fades with the drawer; hidden (no clicks) when closed. */}
      <div
        ref={scrimRef}
        onClick={closeDrawer}
        aria-hidden
        className="invisible fixed inset-0 z-30 bg-[var(--scrim)] opacity-0 backdrop-blur-sm"
      />

      <aside
        ref={drawerRef}
        id="design-system-sidebar"
        aria-label="Primary navigation"
        aria-hidden={!drawerOpen}
        // Right-handed: anchored to the right edge, left-border hairline,
        // slides out to the right when hidden.
        className="fixed inset-y-0 right-0 z-30 flex w-72 translate-x-full flex-col overflow-y-auto border-l border-rule bg-canvas pt-16"
      >
        <nav className="flex-1 space-y-2 px-3 py-6">
          {groups.map((g) => (
            <SidebarGroup
              key={g.key}
              group={g}
              chapters={chapters.filter((c) => c.group === g.key)}
              activeSlug={activeSlug}
              onNavigate={closeDrawer}
            />
          ))}
        </nav>

        <UtilityLinks onNavigate={closeDrawer} />
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------
 * UtilityLinks — the GitHub + Live site rows that previously lived as
 * chips in the TopBar. Rendered as a hairline-separated footer inside the
 * drawer, matching the SidebarItem visual language.
 * ---------------------------------------------------------------------- */
function UtilityLinks({ onNavigate }: { onNavigate: () => void }) {
  const links: { label: string; href: string }[] = [
    { label: "GitHub",    href: "https://github.com/hambourine22/outlas" },
    { label: "Live site", href: "https://outlas.vercel.app" },
  ];
  return (
    <section className="border-t border-rule px-3 py-4" aria-label="External links">
      <h3 className="label px-3 pb-2 text-ink-faint">Links</h3>
      <ul className="space-y-0.5">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              className="flex items-center justify-between gap-3 rounded-sm px-3 py-2 font-ui text-sm text-ink-muted transition-colors hover:bg-[var(--row-hover)] hover:text-ink"
            >
              <span>{l.label}</span>
              <ExternalIcon />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * SidebarGroup — collapsible section à la TwelveLabs docs. The group that
 * contains the current chapter auto-expands as the scroll-spy picks it up;
 * the user can toggle any group open or shut at will.
 * ---------------------------------------------------------------------- */
function SidebarGroup({
  group,
  chapters,
  activeSlug,
  onNavigate,
}: {
  group: Group;
  chapters: Chapter[];
  activeSlug: string | undefined;
  onNavigate: () => void;
}) {
  const containsActive = !!activeSlug && chapters.some((c) => c.slug === activeSlug);
  const [open, setOpen] = useState(containsActive);

  // Follow scroll-spy: when a chapter in this group becomes current, pop
  // the group open. We never auto-close — once the user opens a group,
  // leave it that way.
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const panelId = `sidebar-group-${group.key}`;
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={[
          "label flex w-full items-center justify-between rounded-sm px-3 py-2 transition-colors",
          "text-ink-faint hover:bg-[var(--row-hover)] hover:text-ink",
          containsActive ? "text-ink" : "",
        ].join(" ")}
      >
        <span>{group.label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <ul id={panelId} className="mt-1 space-y-0.5">
          {chapters.map((c) => (
            <SidebarItem
              key={c.slug}
              chapter={c}
              active={c.slug === activeSlug}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[
        "shrink-0 transition-transform duration-150",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const className = [
    // Light-tint block treatment, à la TwelveLabs docs: no left bar,
    // just a subtle wash on hover and a slightly stronger wash when
    // the chapter is current. The row-tint tokens flip ink colour
    // per theme (carbon on snow, snow on carbon) so one class works
    // in light, dark and system modes.
    "flex items-center gap-3 rounded-sm px-3 py-2 font-ui text-sm transition-colors",
    active
      ? "bg-[var(--row-active)] text-ink"
      : "text-ink-muted hover:bg-[var(--row-hover)] hover:text-ink",
  ].join(" ");
  const children = (
    <>
      <span className="font-mono text-xs text-ink-faint">{chapter.n}</span>
      <span>{chapter.title}</span>
    </>
  );
  return (
    <li>
      {chapter.href ? (
        <Link
          href={chapter.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={className}
        >
          {children}
        </Link>
      ) : (
        <a
          href={`#${chapter.slug}`}
          onClick={onNavigate}
          aria-current={active ? "location" : undefined}
          className={className}
        >
          {children}
        </a>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------
 * OnThisPage — right rail outline for the current page.
 * ---------------------------------------------------------------------- */
export function OnThisPage({ chapters = CHAPTERS }: { chapters?: Chapter[] } = {}) {
  // Only chapters without href participate in scroll-spy; route-level
  // chapters shouldn't appear in an "on this page" rail at all, so filter.
  const anchorChapters = chapters.filter((c) => !c.href);
  const activeSlug = useActiveSection(anchorChapters.map((c) => c.slug));
  if (anchorChapters.length === 0) return null;

  return (
    <aside
      className="sticky top-14 hidden h-[calc(100dvh-57px)] w-56 shrink-0 overflow-y-auto border-l border-rule bg-canvas xl:block"
      aria-label="On this page"
    >
      <nav className="px-6 py-8">
        <h3 className="label text-ink-faint">On this page</h3>
        <ul className="mt-3 space-y-1">
          {anchorChapters.map((c) => (
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
