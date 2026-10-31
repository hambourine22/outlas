import type { Metadata } from "next";
import { RentalSubmitForm } from "./RentalSubmitForm";

export const metadata: Metadata = {
  title: "List your rental shop — Oütlas",
  description:
    "Share where you are, what you rent, and one picture or clip. We'll be in touch within a week.",
};

export default function RentalsSubmitPage() {
  return (
    <section data-surface="rental" className="min-h-[calc(100dvh-56px)] bg-canvas text-ink">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 md:px-6 md:pt-16">
        <header>
          <span className="label text-ink-faint">Join · List your shop</span>
          <h1 className="mt-3 font-display text-display-2 leading-tight">
            List your rental shop.
          </h1>
          <p className="mt-4 max-w-xl font-ui text-sm leading-relaxed text-ink-muted">
            Share where you are, what you rent, and one picture or clip. We&rsquo;ll
            be in touch within a week.
          </p>
        </header>

        <div className="mt-10 border-t border-rule pt-8">
          <RentalSubmitForm />
        </div>
      </div>
    </section>
  );
}
