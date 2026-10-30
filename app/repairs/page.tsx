import type { Metadata } from "next";
import { IndexPage } from "@/app/ui/IndexPage";
import { ProviderTable } from "@/app/ui/ProviderTable";
import { getMapData } from "@/app/content/map";

export const metadata: Metadata = {
  title: "Repairs — Oütlas",
  description:
    "Oütlas-aligned repair workshops across Scotland. Parts manufacturers in the Oütlas provider taxonomy.",
};

export const dynamic = "force-dynamic";

export default async function RepairsIndex() {
  const { repairs } = await getMapData();
  const rows = repairs.map((r) => ({
    key: r.item_id || r.slug,
    title: r.name,
    region: r.regions || "Scotland",
    summary: r.repair_address,
    fields: [
      { label: "Phone",   value: r.repair_phone || "—" },
      { label: "Hours",   value: r.opening_times || "—" },
      { label: "Website", value: r.repair_website || "—" },
    ],
  }));
  return (
    <IndexPage
      eyebrow="Marketplace · Repairs"
      title="Repairs"
      dek="Repair workshops registered with Oütlas across Scotland. Parts manufacturers in the brand's provider taxonomy — rust pins on the map."
    >
      <ProviderTable
        category="repairs"
        rows={rows}
        empty="No repairs listed yet in this region."
      />
    </IndexPage>
  );
}
