import { CATEGORY_COLOUR, type MapCategory } from "@/app/content/map/types";

/* -----------------------------------------------------------------
 * ProviderTable — editorial rows for a list of providers (rentals,
 * repairs or guides). Keeps the brand pin colour next to each row so
 * the index visually ties to the map legend and the pins on the home
 * route. One table, four kinds of records — pass the category + row
 * data and shape it with the `fields` prop.
 * ---------------------------------------------------------------- */
type Row = {
  key: string;
  title: string;
  region: string;
  summary: string;
  fields: { label: string; value: string }[];
};

export function ProviderTable({
  category,
  rows,
  empty,
}: {
  category: MapCategory;
  rows: Row[];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="border border-rule bg-canvas-raised p-8 font-ui text-sm text-ink-muted">
        {empty}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {rows.map((r, i) => (
        <li key={r.key} className="py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
            <div className="flex items-center gap-3 md:w-28 md:flex-col md:items-start">
              <span className="font-mono text-sm text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full border"
                style={{
                  backgroundColor: CATEGORY_COLOUR[category],
                  borderColor: "rgba(30,30,30,0.4)",
                }}
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="label text-ink-faint">{r.region}</span>
              </div>
              <h2 className="mt-3 font-display text-title leading-tight">
                {r.title}
              </h2>
              <p className="mt-3 max-w-2xl font-ui text-base leading-relaxed text-ink-muted">
                {r.summary}
              </p>
            </div>
            <dl className="shrink-0 space-y-3 font-ui text-xs md:w-56">
              {r.fields.map((f) => (
                <div key={f.label}>
                  <dt className="label text-ink-faint">{f.label}</dt>
                  <dd className="mt-1 text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
