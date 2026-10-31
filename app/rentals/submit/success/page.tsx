import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "We've got it — Oütlas",
  description: "Thanks — your rental shop submission is in the queue for review.",
};

// Server-rendered success page. Shown either after a no-JS native form
// POST (the API route 303-redirects browsers with Accept: text/html here)
// or when someone bookmarks the URL. The client success state in
// RentalSubmitForm covers the JS-enabled path without a redirect so the
// user keeps their place.

export default function RentalsSubmitSuccess({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const name = decodeMaybe(searchParams.name);
  const preview = !!searchParams.preview;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  return (
    <section data-surface="rental" className="min-h-[calc(100dvh-56px)] bg-canvas text-ink">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 md:px-6 md:pt-16">
        {error ? (
          <>
            <h1 className="font-display text-display-2 leading-tight">
              Something broke.
            </h1>
            <p className="mt-4 font-ui text-sm leading-relaxed text-ink-muted">
              {messageFor(error)}
            </p>
            <Link
              href="/rentals/submit"
              className="mt-6 inline-flex items-center gap-1.5 font-ui text-sm text-ink underline-offset-4 hover:underline"
            >
              Back to the form →
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-display-2 leading-tight">We&rsquo;ve got it.</h1>
            <p className="mt-4 font-ui text-sm leading-relaxed text-ink-muted">
              {name ? `Thanks, ${name}. ` : "Thanks. "}
              Hamish will review your listing within a week.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 font-ui text-sm text-ink underline-offset-4 hover:underline"
            >
              Return to the map →
            </Link>
            {preview && (
              <p className="micro mt-6 text-ink-faint">
                Preview mode — form is wired up but your submission wasn&rsquo;t stored yet. Secrets land soon.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function decodeMaybe(v: string | string[] | undefined): string {
  if (!v) return "";
  if (Array.isArray(v)) return decodeURIComponent(v[0] ?? "");
  return decodeURIComponent(v);
}

function messageFor(code: string): string {
  switch (code) {
    case "rate_limited":
      return "We've had a submission from this network very recently. Try again in a few minutes.";
    case "media_type":
      return "That file type isn't supported. Try JPG, PNG, WEBP, MP4 or MOV.";
    case "media_size":
      return "That file was too big. Keep it under 50 MB — compress or crop and try again.";
    case "upload_failed":
    case "store_failed":
      return "Something broke between here and us. Nothing was saved. Try again, or email hello@outlas.cc.";
    default:
      return "Something broke between here and us. Nothing was saved. Try again, or email hello@outlas.cc.";
  }
}
