"use client";

import { useActionState, useRef, useState } from "react";
import { ACTIVITIES, ACTIVITY_LABEL, type Activity } from "@/app/content/map/types";
import { submitGuideApplication, type SubmissionResult } from "./actions";

// Guides apply form — client component. All field state is uncontrolled
// via FormData so the browser can validate / autofill naturally; the
// client bits are the character counter, the file-list preview, the
// disciplines checkbox grid and the pending UI the useActionState hook
// provides.

const PITCH_MAX = 400;

export default function GuideApplyForm() {
  const [state, formAction, pending] = useActionState<SubmissionResult | null, FormData>(
    submitGuideApplication,
    null,
  );

  const [pitchCount, setPitchCount] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  if (state?.ok) {
    return <SuccessPanel />;
  }

  const errors = state && !state.ok ? state.errors : {};

  return (
    <form action={formAction} className="space-y-10">
      {/* Honeypot — hidden from assistive tech + off-screen for sighted users. */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px]">
        <label>
          Website (leave blank)
          <input type="text" name="website_extra" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Required group */}
      <fieldset className="space-y-6">
        <legend className="label text-ink-faint">About you</legend>

        <Field label="Name" name="name" required error={errors.name}>
          <input type="text" name="name" required maxLength={120} autoComplete="name" className={inputClass} />
        </Field>

        <Field label="Email" name="email" required error={errors.email}>
          <input type="email" name="email" required autoComplete="email" className={inputClass} />
        </Field>

        <Field
          label="Three sentences on you"
          name="pitch"
          required
          error={errors.pitch}
          hint={`${pitchCount} / ${PITCH_MAX}`}
        >
          <textarea
            name="pitch"
            required
            rows={4}
            maxLength={PITCH_MAX}
            onChange={(e) => setPitchCount(e.target.value.length)}
            className={textareaClass}
            placeholder="Where you work, what you specialise in, why you'd like to be on the map."
          />
        </Field>

        <Field label="Disciplines" name="disciplines" required error={errors.disciplines}>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {ACTIVITIES.map((a: Activity) => (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-2 border border-rule px-3 py-2 font-ui text-sm text-ink transition-colors hover:bg-[var(--row-hover)] has-[:checked]:bg-[var(--row-active)] has-[:checked]:text-ink"
              >
                <input type="checkbox" name="disciplines" value={a} className="h-4 w-4 accent-ink" />
                <span>{ACTIVITY_LABEL[a]}</span>
              </label>
            ))}
          </div>
        </Field>
      </fieldset>

      {/* Optional group */}
      <fieldset className="space-y-6">
        <legend className="label text-ink-faint">Where to find you (optional)</legend>

        <Field label="Regions you guide in" name="regions">
          <input
            type="text"
            name="regions"
            maxLength={200}
            placeholder="Cairngorms, Mt Blanc massif, Hokkaido…"
            className={inputClass}
          />
        </Field>

        <Field label="Website" name="website">
          <input type="url" name="website" placeholder="https://" className={inputClass} />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Instagram" name="instagram">
            <input
              type="text"
              name="instagram"
              placeholder="@handle or full URL"
              className={inputClass}
            />
          </Field>
          <Field label="YouTube" name="youtube">
            <input type="url" name="youtube" placeholder="https://youtube.com/@…" className={inputClass} />
          </Field>
        </div>

        <Field
          label="Photo or video"
          name="media"
          error={errors.media}
          hint="Up to three files · 25 MB each · images or video"
        >
          <input
            ref={mediaInputRef}
            type="file"
            name="media"
            accept="image/*,video/*"
            multiple
            onChange={(e) =>
              setMediaFiles(Array.from(e.target.files ?? []).slice(0, 3))
            }
            className="block w-full font-ui text-sm text-ink file:mr-4 file:cursor-pointer file:border file:border-rule file:bg-canvas-raised file:px-4 file:py-2 file:font-ui file:text-xs file:uppercase file:tracking-wide file:text-ink hover:file:bg-[var(--row-hover)]"
          />
          {mediaFiles.length > 0 && (
            <ul className="mt-3 space-y-1 font-ui text-xs text-ink-muted">
              {mediaFiles.map((f) => (
                <li key={f.name} className="flex items-center justify-between">
                  <span className="truncate">{f.name}</span>
                  <span className="font-mono text-ink-faint">{formatBytes(f.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </fieldset>

      {errors.form && (
        <p
          className="border-l-2 border-rule-strong pl-4 font-ui text-sm text-ink"
          role="alert"
        >
          {errors.form}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-rule pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 font-ui text-sm text-canvas transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send application"}
        </button>
        <span className="font-ui text-xs text-ink-faint">
          We&apos;ll come back to you within a week.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="flex items-baseline justify-between">
        <span className="label text-ink-faint">
          {label}
          {required && <span className="text-ink-muted"> · required</span>}
        </span>
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            {hint}
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-2 font-ui text-xs text-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="border border-rule bg-canvas-raised p-8">
      <h2 className="font-display text-display-2 leading-tight text-ink">Thanks.</h2>
      <p className="mt-4 max-w-prose font-ui text-sm leading-relaxed text-ink-muted">
        Your application landed. We read every one by hand — expect to hear
        back within a week. If you don&apos;t, drop us a line at{" "}
        <a href="mailto:hamish@hamishduncan.com" className="text-ink underline-offset-4 hover:underline">
          hamish@hamishduncan.com
        </a>
        .
      </p>
    </div>
  );
}

const inputClass =
  "w-full border border-rule bg-canvas px-3 py-2 font-ui text-sm text-ink placeholder:text-ink-faint focus-visible:border-rule-strong focus-visible:outline-none";
const textareaClass =
  "w-full border border-rule bg-canvas px-3 py-2 font-ui text-sm leading-relaxed text-ink placeholder:text-ink-faint focus-visible:border-rule-strong focus-visible:outline-none";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
