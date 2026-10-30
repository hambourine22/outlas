// Shared navigation data. The design-system page, Sidebar and OnThisPage
// all read from this single source so the chapter list stays in sync.

export type Chapter = {
  n: string;
  slug: string;
  title: string;
  group: "foundations" | "components" | "data";
};

export const CHAPTERS: Chapter[] = [
  { n: "01", slug: "voice",      title: "Voice",            group: "foundations" },
  { n: "02", slug: "logo",       title: "Logo",             group: "foundations" },
  { n: "03", slug: "palette",    title: "Palette",          group: "foundations" },
  { n: "04", slug: "themes",     title: "Themes",           group: "foundations" },
  { n: "05", slug: "grid",       title: "Grid & Layout",    group: "foundations" },
  { n: "06", slug: "surfaces",   title: "Surfaces",         group: "foundations" },
  { n: "07", slug: "type",       title: "Type",             group: "foundations" },
  { n: "08", slug: "space",      title: "Space & Outline",  group: "components"  },
  { n: "09", slug: "principles", title: "Principles",       group: "components"  },
  { n: "10", slug: "nav",        title: "Navigation",       group: "components"  },
  { n: "11", slug: "providers",  title: "Providers",        group: "components"  },
  { n: "12", slug: "score",      title: "Score Pills",      group: "data"        },
  { n: "13", slug: "map",        title: "Map Legend",       group: "data"        },
  { n: "14", slug: "dataviz",    title: "Data Viz",         group: "data"        },
];

export const GROUPS: { key: Chapter["group"]; label: string }[] = [
  { key: "foundations", label: "Foundations" },
  { key: "components",  label: "Components"  },
  { key: "data",        label: "Data"        },
];
