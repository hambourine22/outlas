// Story registry — one row per editorial piece. The /stories index, the
// Sidebar's "Stories" group, breadcrumbs and next/prev navigation all
// read from here. Keep rows in reading order; put the newest at the top.

export type StorySurface = "story" | "manifest" | "rental" | "repair" | "carbon";
export type StoryStatus = "published" | "draft";

// Each slot keys a photograph used in the editorial layout. The page
// looks up images by slot — missing slots silently degrade (no broken
// image, no empty figure). To swap in Zeger Dox's or Ortovox's licensed
// shots, drop files at the matching path in public/stories/<slug>/ and
// point `images` at them.
export type StoryImageSlot =
  | "hero"
  | "statistics"
  | "essentials"
  | "checklist"
  | "further";

export type StoryImage = {
  src: string;
  alt: string;
  credit: string;
};

export type Story = {
  slug: string;
  title: string;
  dek: string;              // one-line description shown on index and in cards
  byline: string;           // "Words by …"
  photoCredit: string;      // standalone photography credit line
  readTime: string;         // e.g. "~ 14 minutes"
  season: string;           // publication context — "Winter 25/26"
  series: string | null;    // if part of a series ("Risk Space, no. 1"), else null
  surface: StorySurface;    // which brand surface the hero uses
  tags: string[];           // keywords for cross-linking
  status: StoryStatus;
  publishedAt: string;      // ISO date, used for sorting
  href: string;             // resolved route — "/stories/<slug>"
  images: Partial<Record<StoryImageSlot, StoryImage>>;
};

export const STORIES: Story[] = [
  {
    slug: "ski-touring-risk-space",
    title: "Ski Touring & Risk Space",
    dek: "An interactive guide to avalanche risk, the three essentials of ski touring, and a working checklist for assessing snow stability.",
    byline: "Words by Zeger Dox",
    // Craig Burry's Cairngorms splitboarding set is standing in until Zeger
    // Dox's and Ortovox's licensed images are added to the project. To swap,
    // replace the files in public/stories/ski-touring-risk-space/ and update
    // the credit lines below.
    photoCredit: "Placeholder photography by Craig Burry — Cairngorms splitboarding set, standing in for Zeger Dox / Ortovox",
    readTime: "~ 14 minutes",
    season: "Winter 25/26",
    series: "Risk Space, no. 1",
    surface: "story",
    tags: ["ski touring", "avalanche", "safety", "backcountry"],
    status: "published",
    publishedAt: "2026-10-30",
    href: "/stories/ski-touring-risk-space",
    images: {
      hero: {
        src: "/stories/ski-touring-risk-space/hero.jpg",
        alt: "Splitboarders on the ascent in the Cairngorms, Scotland.",
        credit: "© Craig Burry",
      },
      statistics: {
        src: "/stories/ski-touring-risk-space/statistics.jpg",
        alt: "The crew surveying an avalanche park, Cairngorms.",
        credit: "© Craig Burry",
      },
      essentials: {
        src: "/stories/ski-touring-risk-space/essentials.jpg",
        alt: "Kit laid out at the transition — splitboards, skins and transceivers.",
        credit: "© Craig Burry",
      },
      checklist: {
        src: "/stories/ski-touring-risk-space/checklist.jpg",
        alt: "Route planning map, Cairngorms splitboarding.",
        credit: "© Craig Burry",
      },
      further: {
        src: "/stories/ski-touring-risk-space/further.jpg",
        alt: "Setting up for the descent, Frazer Rennie, Cairngorms.",
        credit: "© Craig Burry",
      },
    },
  },
];
