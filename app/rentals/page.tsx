import type { Metadata } from "next";
import { IndexPage } from "@/app/ui/IndexPage";
import { ProviderTable } from "@/app/ui/ProviderTable";
import { getMapData } from "@/app/content/map";

export const metadata: Metadata = {
  title: "Rentals — Oütlas",
  description:
    "Oütlas-aligned rental shops across Scotland. Service providers in the Oütlas provider taxonomy.",
};

export const dynamic = "force-dynamic";

export default async function RentalsIndex() {
  const { rentals } = await getMapData();
  const rows = rentals.map((r) => ({
    key: r.item_id || r.slug,
    title: r.name,
    region: r.regions || "Scotland",
    summary: r.resort_description || r.gear_for_rent,
    fields: [
      { label: "Gear",    value: r.gear_for_rent || "—" },
      { label: "Phone",   value: r.phone_number || "—" },
      { label: "Address", value: r.resort_Address || "—" },
    ],
  }));
  return (
    <IndexPage
      eyebrow="Marketplace · Rentals"
      title="Rentals"
      dek="Rental shops registered with Oütlas across Scotland. Service providers in the brand's provider taxonomy — glacier pins on the map."
    >
      <ProviderTable
        category="rentals"
        rows={rows}
        empty="No rentals listed yet in this region."
      />
    </IndexPage>
  );
}
