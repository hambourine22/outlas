import { STORIES, type Story } from "./registry";

/* -----------------------------------------------------------------
 * Facade for the stories registry. Pages import from here, never
 * from registry.ts directly. If we move stories to Postgres, Sanity
 * or Airtable later, only this file changes.
 * ---------------------------------------------------------------- */

export type { Story, StorySurface, StoryStatus } from "./registry";

export function getAllStories(): Story[] {
  return STORIES.filter((s) => s.status === "published").sort(
    (a, b) => (a.publishedAt > b.publishedAt ? -1 : 1),
  );
}

export function getStoryBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

export function getStoryNeighbours(slug: string): {
  previous: Story | null;
  next: Story | null;
} {
  const published = getAllStories();
  const index = published.findIndex((s) => s.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? published[index - 1] : null,
    next: index < published.length - 1 ? published[index + 1] : null,
  };
}
