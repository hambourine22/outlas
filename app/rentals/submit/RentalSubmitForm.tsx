"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FileDropZone, type FileDropZoneState } from "./FileDropZone";

type FormState =
  | { kind: "editing"; errors: Partial<Record<FieldKey, string>>; banner?: string }
  | { kind: "submitting"; progress: number; progressStep: 0 | 25 | 50 | 75 | 100 }
  | { kind: "submitted"; name: string; preview: boolean };

type FieldKey = "name" | "resorts" | "description" | "social" | "website";

const FIELDS: Array<{
  key: FieldKey;
  label: string;
  placeholder: string;
  help?: string;
  errorEmpty: string;
  type: "text" | "textarea";
  maxLength: number;
  required: boolean;
}> = [
  { key: "name",        label: "Shop name",             placeholder: "e.g. Zero G", errorEmpty: "Shop needs a name.",                                                      type: "text",     maxLength: 80,  required: true },
  { key: "resorts",     label: "Resorts you serve",     placeholder: "e.g. Chamonix, Val d'Isère",    help: "Comma-separate if more than one.",                             errorEmpty: "Name at least one resort.",                                                 type: "text",     maxLength: 160, required: true },
  { key: "description", label: "One line about the shop", placeholder: "e.g. Freeride-focused rental on Rue Joseph Vallot.", help: "Keep it to one sentence — we'll edit lightly before publishing.", errorEmpty: "Give us a short line.", type: "textarea", maxLength: 200, required: true },
  { key: "social",      label: "Social handle or link", placeholder: "e.g. instagram.com/zerogchamonix", help: "Instagram, TikTok, YouTube — one is fine.",                      errorEmpty: "Looks off — paste the full link.",                                          type: "text",     maxLength: 160, required: false },
  { key: "website",     label: "Website",               placeholder: "e.g. zerog-chamonix.com",                                                                              errorEmpty: "Looks off — paste the full link.",                                          type: "text",     maxLength: 160, required: false },
];

export function RentalSubmitForm() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "", resorts: "", description: "", social: "", website: "",
  });
  const [media, setMedia] = useState<FileDropZoneState>({ kind: "default" });
  const [form, setForm] = useState<FormState>({ kind: "editing", errors: {} });
  const liveRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const requiredFilled = useMemo(
    () => !!values.name.trim() && !!values.resorts.trim() && !!values.description.trim(),
    [values],
  );

  function handleChange(k: FieldKey, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (form.kind === "editing" && form.errors[k]) {
      setForm({ ...form, errors: { ...form.errors, [k]: undefined } });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.kind !== "editing") return;

    // Required-field validation
    const errors: Partial<Record<FieldKey, string>> = {};
    for (const f of FIELDS) {
      if (f.required && !values[f.key].trim()) errors[f.key] = f.errorEmpty;
    }
    if (Object.keys(errors).length) {
      setForm({ kind: "editing", errors });
      return;
    }

    // Media state can't be invalid at submit — if it's invalid the inline
    // error clears the field already. Only pass filled or default through.
    const mediaFile = media.kind === "filled" ? media.file : null;

    // Build FormData and submit via XHR for upload progress
    const fd = new FormData();
    for (const k of Object.keys(values) as FieldKey[]) {
      fd.set(k, values[k].trim());
    }
    fd.set("website_url_2", ""); // honeypot — real users never touch it
    if (mediaFile) fd.set("media", mediaFile);

    setForm({ kind: "submitting", progress: 0, progressStep: 0 });

    try {
      const result = await uploadWithProgress("/api/rentals/submit", fd, (pct) => {
        setForm((prev) => {
          if (prev.kind !== "submitting") return prev;
          const next = Math.max(prev.progress, pct);
          const steps = [0, 25, 50, 75, 100] as const;
          const step = steps.reduce((acc, s) => (next >= s ? s : acc), 0 as 0 | 25 | 50 | 75 | 100);
          if (step !== prev.progressStep && liveRef.current) {
            liveRef.current.textContent =
              step === 100
                ? "Upload complete"
                : `Uploading ${mediaFile?.name ?? "submission"}, ${step}%`;
          }
          return { ...prev, progress: next, progressStep: step };
        });
      });

      if (result.status === 429) {
        setForm({
          kind: "editing",
          errors: {},
          banner: "We've had a submission from this network very recently. Try again in a few minutes.",
        });
        return;
      }
      if (result.status === 413) {
        setForm({ kind: "editing", errors: {}, banner: "That file was too big. Keep it under 50 MB." });
        return;
      }
      if (result.status === 415) {
        setForm({ kind: "editing", errors: {}, banner: "That file type isn't supported. Try JPG, PNG, WEBP, MP4 or MOV." });
        return;
      }
      if (result.status >= 500) {
        setForm({
          kind: "editing",
          errors: {},
          banner: "Something broke between here and us. Nothing was saved. Try Submit again, or email hello@outlas.cc.",
        });
        return;
      }

      const body = result.body as { ok?: boolean; preview?: boolean };
      if (!body?.ok) {
        setForm({
          kind: "editing",
          errors: {},
          banner: "Submit didn't go through. Try again, or email hello@outlas.cc.",
        });
        return;
      }
      setForm({ kind: "submitted", name: values.name.trim(), preview: !!body.preview });
    } catch {
      setForm({
        kind: "editing",
        errors: {},
        banner: "Took too long. Nothing was saved. Try Submit again when you're on a stronger signal.",
      });
    }
  }

  // ---- Submitted state ----
  if (form.kind === "submitted") {
    return <SuccessPanel name={form.name} preview={form.preview} />;
  }

  const submitting = form.kind === "submitting";
  const banner = form.kind === "editing" ? form.banner : undefined;
  const errors = form.kind === "editing" ? form.errors : {};

  return (
    <form
      action="/api/rentals/submit"
      method="post"
      encType="multipart/form-data"
      noValidate
      onSubmit={handleSubmit}
      className="space-y-10"
    >
      {banner && (
        <div
          role="alert"
          aria-live="assertive"
          className="border border-[var(--rule-strong)] bg-[var(--row-hover)] px-4 py-3 font-ui text-sm text-ink"
        >
          {banner}
        </div>
      )}

      {/* Honeypot — off-screen, keyboard-skipped, no autocomplete */}
      <input
        type="text"
        name="website_url_2"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="sr-only"
        onChange={() => {/* bots fill; real users never see */}}
      />

      <fieldset className="space-y-6">
        <legend className="label text-ink-faint">About the shop</legend>
        {FIELDS.map((f) => (
          <Field
            key={f.key}
            id={`${uid}-${f.key}`}
            field={f}
            value={values[f.key]}
            error={errors[f.key]}
            onChange={(v) => handleChange(f.key, v)}
            disabled={submitting}
          />
        ))}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="label text-ink-faint">One picture or clip</legend>
        <FileDropZone
          value={media}
          onChange={setMedia}
          busy={submitting}
          errorId={`${uid}-media-error`}
          describedById={`${uid}-media-help`}
        />
        {submitting && (
          <div className="mt-2">
            <div
              className="h-1 w-full overflow-hidden border border-rule bg-canvas-raised"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={form.progress}
              aria-label="Upload progress"
            >
              <div
                className="h-full bg-ink motion-safe:transition-[width] motion-safe:duration-150"
                style={{ width: `${form.progress}%` }}
              />
            </div>
            <div ref={liveRef} aria-live="polite" className="sr-only" />
          </div>
        )}
      </fieldset>

      <div className="sticky bottom-0 -mx-4 border-t border-rule bg-canvas/95 px-4 py-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0">
        <button
          type="submit"
          disabled={submitting || !requiredFilled}
          aria-disabled={submitting || !requiredFilled || undefined}
          aria-busy={submitting || undefined}
          className={[
            "label inline-flex min-h-[44px] items-center justify-center border px-6 py-3 transition-colors",
            submitting || !requiredFilled
              ? "border-rule bg-canvas-raised text-ink-faint"
              : "border-ink bg-ink text-canvas hover:bg-[var(--accent)] hover:border-[var(--accent)]",
          ].join(" ")}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id, field, value, error, onChange, disabled,
}: {
  id: string;
  field: (typeof FIELDS)[number];
  value: string;
  error?: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const common = {
    id,
    name: field.key,
    value,
    maxLength: field.maxLength,
    disabled,
    required: field.required || undefined,
    placeholder: field.placeholder,
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": [field.help ? helpId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    className: [
      "block w-full border bg-canvas px-3 py-3 font-ui text-sm text-ink placeholder:text-ink-faint",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0",
      error ? "border-[var(--rule-strong)]" : "border-rule",
      disabled ? "opacity-60" : "",
    ].join(" "),
  };
  return (
    <div>
      <label htmlFor={id} className="label text-ink">
        {field.label}
      </label>
      <div className="mt-2">
        {field.type === "textarea" ? (
          <textarea {...common} rows={2} />
        ) : (
          <input {...common} type="text" autoComplete={field.key === "name" ? "organization" : "off"} />
        )}
      </div>
      {field.help && !error && (
        <p id={helpId} className="mt-1.5 font-ui text-xs text-ink-muted">
          {field.help}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 font-ui text-xs text-[color:rgb(var(--brand-rust))]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessPanel({ name, preview }: { name: string; preview: boolean }) {
  return (
    <div data-surface="rental" className="min-h-[400px]">
      <h2 className="font-display text-display-2 leading-tight">We&rsquo;ve got it.</h2>
      <p className="mt-3 font-ui text-sm leading-relaxed text-ink-muted">
        Thanks, {name}. Hamish will review your listing within a week.
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
    </div>
  );
}

/* -----------------------------------------------------------------------
 * uploadWithProgress — thin XHR wrapper so we can report upload progress
 * to the UI. fetch() doesn't expose body upload progress yet. XHR does.
 * ----------------------------------------------------------------------- */
function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (pct: number) => void,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) onProgress(Math.round((evt.loaded / evt.total) * 100));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.ontimeout = () => reject(new Error("timeout"));
    xhr.onload = () => {
      // Treat anything with a JSON body as the server's say — status 2xx or not.
      let parsed: unknown = null;
      try { parsed = JSON.parse(xhr.responseText); } catch { /* leave null */ }
      resolve({ status: xhr.status, body: parsed });
    };
    xhr.send(body);
  });
}
