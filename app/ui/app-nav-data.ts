import type { Chapter, Group } from "@/app/design-system/nav-data";
import { getAllStories } from "@/app/content/stories";

// Primary route-level navigation for the Oütlas app. Each item is a
// Chapter with an href — the Sidebar renders them as route links and
// uses the current pathname (not scroll position) to pick the active row.
//
// The Stories group is built from the registry so adding a new piece
// in app/content/stories/registry.ts automatically wires it in here.

const stories = getAllStories();

const EXPLORE: Chapter[] = [
  { n: "01", slug: "map",     title: "Map",     group: "explore", href: "/" },
  { n: "02", slug: "stories", title: "Stories", group: "explore", href: "/stories" },
];

const STORY_CHAPTERS: Chapter[] = stories.map((s, i) => ({
  n: String(i + 1).padStart(2, "0"),
  slug: `story-${s.slug}`,
  title: s.title,
  group: "stories",
  href: s.href,
}));

const MARKETPLACE: Chapter[] = [
  { n: "01", slug: "rentals", title: "Rentals", group: "marketplace", href: "/rentals" },
  { n: "02", slug: "repairs", title: "Repairs", group: "marketplace", href: "/repairs" },
  { n: "03", slug: "guides",  title: "Guides",  group: "marketplace", href: "/guides"  },
];

const SYSTEM: Chapter[] = [
  { n: "01", slug: "ds", title: "Design System", group: "system", href: "/design-system" },
];

export const APP_CHAPTERS: Chapter[] = [
  ...EXPLORE,
  ...STORY_CHAPTERS,
  ...MARKETPLACE,
  ...SYSTEM,
];

export const APP_GROUPS: Group[] = [
  { key: "explore",     label: "Explore"     },
  { key: "stories",     label: "Stories"     },
  { key: "marketplace", label: "Marketplace" },
  { key: "system",      label: "System"      },
];
