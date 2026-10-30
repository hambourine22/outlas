import type { Chapter, Group } from "@/app/design-system/nav-data";

// Primary route-level navigation for the Oütlas app. Each item is a
// Chapter with an href — the Sidebar renders them as route links and
// uses the current pathname (not scroll position) to pick the active row.

export const APP_CHAPTERS: Chapter[] = [
  { n: "01", slug: "map",     title: "Map",            group: "explore",     href: "/" },
  { n: "02", slug: "stories", title: "Stories",        group: "explore",     href: "/stories" },
  { n: "03", slug: "ski",     title: "Ski Touring",    group: "explore",     href: "/stories/ski-touring-risk-space" },
  { n: "04", slug: "rentals", title: "Rentals",        group: "marketplace", href: "/rentals" },
  { n: "05", slug: "repairs", title: "Repairs",        group: "marketplace", href: "/repairs" },
  { n: "06", slug: "ds",      title: "Design System",  group: "system",      href: "/design-system" },
];

export const APP_GROUPS: Group[] = [
  { key: "explore",     label: "Explore"     },
  { key: "marketplace", label: "Marketplace" },
  { key: "system",      label: "System"      },
];
