"use client";

import { NavProvider, TopBar, Sidebar } from "@/app/design-system/Nav";
import { APP_CHAPTERS, APP_GROUPS } from "./app-nav-data";

/* -------------------------------------------------------------------------
 * AppShell — wraps a route in the shared Oütlas chrome. Mounts the TopBar
 * (brand typemark, medallion, theme switcher) and the Sidebar drawer with
 * the APP-level nav (route links, not in-page anchors). Content is given
 * full-bleed treatment — a page can still opt into its own padding, grid
 * or background via its own markup.
 * ---------------------------------------------------------------------- */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <div className="min-h-dvh bg-canvas text-ink">
        <TopBar />
        <Sidebar chapters={APP_CHAPTERS} groups={APP_GROUPS} />
        <main className="min-w-0">{children}</main>
      </div>
    </NavProvider>
  );
}
