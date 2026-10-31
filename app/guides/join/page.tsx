import type { Metadata } from "next";
import { AppShell } from "@/app/ui/AppShell";
import GuideApplyForm from "./GuideApplyForm";

export const metadata: Metadata = {
  title: "Join as a guide — Oütlas",
  description:
    "Mountain guides submit a short pitch, how to find them and a photo or two. Oütlas reviews every application by hand.",
};

// Server component — editorial header + the client form below. No data
// read from the DB on load; the server action owns writes. Wrapped in the
// AppShell so the route carries the TopBar + sidebar like every other page
// (AppShell supplies <main>, so the page body is a <div>).

export default function JoinAsGuidePage() {
  return (
    <AppShell>
    <div className="min-h-[calc(100dvh-56px)] bg-canvas">
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-12 md:px-10 md:pt-20">
        <span className="label text-ink-faint">Join · Guides</span>
        <h1 className="mt-4 font-display text-display-1 leading-tight text-ink">
          Join as a guide
        </h1>
        <p className="mt-6 max-w-prose font-ui text-base leading-relaxed text-ink-muted">
          Oütlas is where riders find the people who know a mountain better than they do.
          If that&apos;s you — a bureau, an alpine school, an individual IFMGA guide, a
          splitboard specialist or a season-long snow-safety instructor — this is the way in.
          A short pitch, where to find you, and a photo or two. We review every application
          by hand and come back within a week.
        </p>

        <div className="mt-10 border-t border-rule pt-10">
          <GuideApplyForm />
        </div>
      </section>
    </div>
    </AppShell>
  );
}
