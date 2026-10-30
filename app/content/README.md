# Content layer

Single source of truth for everything the Oütlas pages render — stories, map entries, provider data. Pages import through this folder's facades, never directly from a backend. When a real database is wired up (Vercel Postgres, Sanity, Airtable, Notion…), swap the facade's implementation and no page component changes.

## Shape

```
app/content/
  stories/
    registry.ts    All stories, ordered. Metadata only — slug, title,
                   dek, hero data, byline, surface, status.
    index.ts       Facade: getAllStories(), getStoryBySlug(), getStoryNeighbours().
  map/
    types.ts       Normalised Pin + category types shared by map, legend, cards.
    resorts.ts     Typed resort records.
    rentals.ts     Typed rental records.
    repairs.ts     Typed repair records.
    guides.ts      Typed guide records (new — service providers).
    index.ts       Facade: getMapData() — tries DB, falls back to typed arrays.
  README.md        This file.
```

## Rules

- Add a new story → add a row to `stories/registry.ts` + the page itself at `app/stories/<slug>/page.tsx`. The Stories index and sidebar pick it up automatically.
- Add a new resort / rental / repair / guide → add a typed record to the right file in `map/`. The home map, legend and detail panels render it.
- Never read from a backend directly in a page. Always go through a facade in this folder.
- Content records are typed. If TypeScript breaks, the content model is drifting from the component contract — fix one or the other, don't cast around it.
