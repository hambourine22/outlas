import type { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit your shop — Oütlas",
  description:
    "A one-page submission form for repair shops to join the Oütlas map. Share your basics, a photo or two, and we'll be in touch.",
};

export default function RepairSubmitPage() {
  return (
    <main
      data-surface="repair"
      className="min-h-[calc(100dvh-56px)] bg-canvas text-ink"
    >
      <div className="mx-auto max-w-2xl px-6 py-12 md:px-10 md:py-16 lg:py-20">
        {/* Header */}
        <div className="border-b border-rule pb-8">
          <span className="label text-ink-faint">Marketplace · Submission</span>
          <h1 className="mt-3 font-display text-display-2 leading-tight text-ink">
            Submit your shop
          </h1>
          <p className="mt-4 max-w-xl font-ui text-base leading-relaxed text-ink-muted">
            Oütlas is built from the ground up by shops like yours. Share your basics
            and we&apos;ll add you to the map.
          </p>
        </div>

        <SubmitForm />
      </div>
    </main>
  );
}
