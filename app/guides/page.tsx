import type { Metadata } from "next";
import { IndexPage } from "@/app/ui/IndexPage";
import { ProviderTable } from "@/app/ui/ProviderTable";
import { getMapData } from "@/app/content/map";

export const metadata: Metadata = {
  title: "Guides — Oütlas",
  description:
    "Mountain guides registered with Oütlas across Scotland. Human expertise in the Oütlas provider taxonomy.",
};

export const dynamic = "force-dynamic";

export default async function GuidesIndex() {
  const { guides } = await getMapData();
  const rows = guides.map((g) => ({
    key: g.item_id || g.slug,
    title: g.name,
    region: g.regions || "Scotland",
    summary: g.bio,
    fields: [
      { label: "Disciplines", value: g.disciplines || "—" },
      { label: "Languages",   value: g.languages || "—" },
      { label: "Day rate",    value: g.rate_per_day || "—" },
      { label: "Phone",       value: g.phone || "—" },
    ],
  }));
  return (
    <IndexPage
      eyebrow="Marketplace · Guides"
      title="Guides"
      dek="Mountain guides registered with Oütlas across Scotland. Human expertise in the brand's provider taxonomy — sand pins on the map."
    >
      <ProviderTable
        category="guides"
        rows={rows}
        empty="No guides listed yet in this region."
      />
    </IndexPage>
  );
}
