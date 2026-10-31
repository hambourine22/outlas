"use client";

import { useRef, useState, type FormEvent } from "react";

// Client-side submission form for repair shops. Fields and copy per the
// spec at docs/specs/repair-shop-submission.md. The API route at
// /api/repair-submit is the source of truth for validation; this
// component mirrors the common rules for a quick-feedback UX.

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 3;
const MAX_DESCRIPTION = 200;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "video/mp4", "video/quicktime"]);

type FieldErrors = Partial<Record<"shopName" | "address" | "email" | "website" | "socialUrl" | "description", string>>;

type MediaItem = {
  file: File;
  previewUrl: string | null;
  error: string | null;
};

export default function SubmitForm() {
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  function pickFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const next: MediaItem[] = [];
    const slotsLeft = MAX_FILES - media.length;
    for (const file of incoming.slice(0, slotsLeft)) {
      let error: string | null = null;
      if (!ALLOWED_MIME.has(file.type)) error = "Only JPG, PNG, MP4 or MOV.";
      else if (file.size > MAX_FILE_BYTES) error = "That file's over 10MB. Try a smaller one.";
      const previewUrl = file.type.startsWith("image/") && !error ? URL.createObjectURL(file) : null;
      next.push({ file, previewUrl, error });
    }
    setMedia((prev) => [...prev, ...next]);
  }

  function removeMedia(idx: number) {
    setMedia((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!shopName.trim()) e.shopName = "This one is needed.";
    if (!address.trim()) e.address = "This one is needed.";
    if (!email.trim()) e.email = "This one is needed.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "That doesn't look like an email.";
    if (website && !/^https?:\/\/.+/i.test(website)) e.website = "Must start with https://";
    if (socialUrl && !/^https?:\/\/.+/i.test(socialUrl)) e.socialUrl = "Must start with https://";
    if (description.length > MAX_DESCRIPTION) e.description = `Max ${MAX_DESCRIPTION} characters.`;
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Focus the first invalid field
      const first = Object.keys(nextErrors)[0];
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
      return;
    }

    const okFiles = media.filter((m) => !m.error);
    const fd = new FormData();
    fd.append("shopName", shopName.trim());
    fd.append("address", address.trim());
    fd.append("email", email.trim());
    if (website.trim()) fd.append("website", website.trim());
    if (socialUrl.trim()) fd.append("socialUrl", socialUrl.trim());
    if (description.trim()) fd.append("description", description.trim());
    for (const m of okFiles) fd.append("media", m.file);

    setSubmitting(true);
    try {
      const res = await fetch("/api/repair-submit", { method: "POST", body: fd });
      const body = (await res.json().catch(() => null)) as
        | { ok: true; id: number }
        | { ok: false; error: string; field?: string }
        | null;
      if (!res.ok || !body || body.ok === false) {
        if (body && body.ok === false) {
          if (body.field) {
            setErrors({ [body.field]: body.error } as FieldErrors);
            const el = formRef.current?.querySelector<HTMLElement>(`[name="${body.field}"]`);
            el?.focus();
          } else {
            setFormError(body.error);
          }
        } else {
          setFormError("Something broke. Try again, or email us direct at hamish@hamishduncan.com.");
        }
        return;
      }
      setSuccessEmail(email.trim());
    } catch {
      setFormError("Something broke. Try again, or email us direct at hamish@hamishduncan.com.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successEmail) {
    return (
      <section className="mt-10 border-t border-rule pt-10" aria-live="polite">
        <h2 className="font-display text-display-2 leading-tight text-ink">Thanks.</h2>
        <p className="mt-4 max-w-xl font-ui text-base leading-relaxed text-ink-muted">
          We&apos;ll be in touch at <span className="text-ink">{successEmail}</span> once we&apos;ve had a look.
          Usually within a week.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 font-ui text-sm text-ink underline-offset-4 hover:underline"
        >
          Back to the map →
        </a>
      </section>
    );
  }

  const descriptionLeft = Math.max(0, MAX_DESCRIPTION - description.length);
  const canAddMore = media.length < MAX_FILES;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mt-8 space-y-6"
      noValidate
      aria-busy={submitting}
    >
      {formError && (
        <div
          role="alert"
          className="border border-rule bg-canvas-raised p-4 font-ui text-sm text-ink"
        >
          {formError}
        </div>
      )}

      <Field label="Shop name" name="shopName" required error={errors.shopName}>
        <input
          type="text"
          name="shopName"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          autoComplete="organization"
          required
          aria-invalid={!!errors.shopName}
          className={inputClass(!!errors.shopName)}
        />
      </Field>

      <Field label="Address or town" name="address" required error={errors.address}>
        <input
          type="text"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="street-address"
          required
          aria-invalid={!!errors.address}
          className={inputClass(!!errors.address)}
        />
      </Field>

      <Field label="Website" name="website" error={errors.website} helper="Optional">
        <input
          type="url"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://your-shop.com"
          autoComplete="url"
          aria-invalid={!!errors.website}
          className={inputClass(!!errors.website)}
        />
      </Field>

      <Field label="Social media link" name="socialUrl" error={errors.socialUrl} helper="Optional">
        <input
          type="url"
          name="socialUrl"
          value={socialUrl}
          onChange={(e) => setSocialUrl(e.target.value)}
          placeholder="https://instagram.com/your-shop"
          aria-invalid={!!errors.socialUrl}
          className={inputClass(!!errors.socialUrl)}
        />
      </Field>

      <Field
        label="Tell us about your shop"
        name="description"
        error={errors.description}
        helper={`Optional · ${descriptionLeft} characters left`}
      >
        <textarea
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
          aria-invalid={!!errors.description}
          className={inputClass(!!errors.description) + " resize-y"}
        />
      </Field>

      <Field
        label="Email for follow-up"
        name="email"
        required
        error={errors.email}
        helper="We'll only use this to confirm your listing."
      >
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={!!errors.email}
          className={inputClass(!!errors.email)}
        />
      </Field>

      {/* Upload zone */}
      <fieldset>
        <legend className="label text-ink-muted">Media</legend>
        <p className="mt-1 font-ui text-xs text-ink-faint">
          Drop photos or video (up to {MAX_FILES}). JPG · PNG · MP4 · MOV · 10MB each.
        </p>
        <label
          className={[
            "mt-3 flex min-h-[7rem] cursor-pointer items-center justify-center border border-dashed border-[var(--rule-strong)] px-4 py-6 text-center font-ui text-sm text-ink-muted transition-colors",
            canAddMore ? "hover:bg-[var(--row-hover)]" : "cursor-not-allowed opacity-60",
          ].join(" ")}
          onDrop={(e) => {
            e.preventDefault();
            if (canAddMore) pickFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,video/mp4,video/quicktime"
            className="sr-only"
            onChange={(e) => pickFiles(e.target.files)}
            disabled={!canAddMore}
          />
          <span>
            {canAddMore
              ? "Drop files or click to choose"
              : `${MAX_FILES} files selected — remove one to add another`}
          </span>
        </label>

        {media.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {media.map((m, i) => (
              <li
                key={`${m.file.name}-${i}`}
                className="border border-rule bg-canvas-raised p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-ui text-xs text-ink">{m.file.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                      {Math.round(m.file.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    aria-label={`Remove ${m.file.name}`}
                    className="font-ui text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Remove
                  </button>
                </div>
                {m.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.previewUrl}
                    alt=""
                    className="mt-2 aspect-video w-full object-cover"
                  />
                )}
                {m.error && (
                  <p className="mt-2 font-ui text-xs text-ink-muted">{m.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="border-t border-rule pt-6">
        <button
          type="submit"
          disabled={submitting}
          className={[
            "inline-flex w-full items-center justify-center border border-rule bg-ink px-6 py-3 font-ui text-sm uppercase tracking-wide text-canvas transition-colors sm:w-auto",
            submitting ? "opacity-70" : "hover:bg-[var(--accent)] hover:text-canvas",
          ].join(" ")}
        >
          {submitting ? "Sharing…" : "Share with Oütlas"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  helper,
  error,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const describedBy = [helper ? `${name}-helper` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={name} className="label text-ink-muted">
        {label}
        {required && <span aria-hidden className="ml-1 text-ink-faint">· required</span>}
      </label>
      <div className="mt-2" aria-describedby={describedBy || undefined}>
        {children}
      </div>
      {helper && !error && (
        <p id={`${name}-helper`} className="mt-1 font-ui text-xs text-ink-faint">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 font-ui text-xs text-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "block w-full border bg-canvas-raised px-3 py-2 font-ui text-sm text-ink placeholder:text-ink-faint",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
    hasError ? "border-[var(--rule-strong)]" : "border-rule",
  ].join(" ");
}
