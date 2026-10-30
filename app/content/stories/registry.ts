// Story registry — one row per editorial piece. The /stories index, the
// Sidebar's "Stories" group, breadcrumbs and next/prev navigation all
// read from here. Keep rows in reading order; put the newest at the top.

export type StorySurface = "story" | "manifest" | "rental" | "repair" | "carbon";
export type StoryStatus = "published" | "draft";

export type Story = {
  slug: string;
  title: string;
  dek: string;              // one-line description shown on index and in cards
  byline: string;           // "Words & photos by …"
  readTime: string;         // e.g. "~ 14 minutes"
  season: string;           // publication context — "Winter 25/26"
  series: string | null;    // if part of a series ("Risk Space, no. 1"), else null
  surface: StorySurface;    // which brand surface the hero uses
  tags: string[];           // keywords for cross-linking
  status: StoryStatus;
  publishedAt: string;      // ISO date, used for sorting
  href: string;             // resolved route — "/stories/<slug>"
};

export const STORIES: Story[] = [
  {
    slug: "ski-touring-risk-space",
    title: "Ski Touring & Risk Space",
    dek: "An interactive guide to avalanche risk, the three essentials of ski touring, and a working checklist for assessing snow stability.",
    byline: "Words & photos by Zeger Dox",
    readTime: "~ 14 minutes",
    season: "Winter 25/26",
    series: "Risk Space, no. 1",
    surface: "story",
    tags: ["ski touring", "avalanche", "safety", "backcountry"],
    status: "published",
    publishedAt: "2026-10-30",
    href: "/stories/ski-touring-risk-space",
  },
];
