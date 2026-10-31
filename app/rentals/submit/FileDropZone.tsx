"use client";

import { useRef, useState } from "react";

// Five states per the spec:
//   default — dashed hairline drop zone, label-caps prompt
//   filled — thumbnail or filename pill + Change
//   invalid-size — rust-tinted hairline + error copy inline
//   invalid-type — same shape, type-specific copy
//   submitting — upstream owner shows a progress strip; the zone keeps
//                the filename pill with aria-busy
// Submitted state is not drawn here — the form page swaps away entirely.

export type FileDropZoneState =
  | { kind: "default" }
  | { kind: "filled"; file: File; previewUrl?: string }
  | { kind: "invalid-size"; bytes: number }
  | { kind: "invalid-type"; mime: string };

const ALLOWED = [
  "image/jpeg", "image/png", "image/webp",
  "video/mp4", "video/quicktime",
];
const MAX_BYTES = 50 * 1024 * 1024;

export function FileDropZone({
  value,
  onChange,
  busy,
  errorId,
  describedById,
}: {
  value: FileDropZoneState;
  onChange: (next: FileDropZoneState) => void;
  busy?: boolean;
  errorId?: string;
  describedById?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    if (!ALLOWED.includes(f.type)) {
      onChange({ kind: "invalid-type", mime: f.type || "unknown" });
      return;
    }
    if (f.size > MAX_BYTES) {
      onChange({ kind: "invalid-size", bytes: f.size });
      return;
    }
    const previewUrl = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
    onChange({ kind: "filled", file: f, previewUrl });
  }

  const invalid = value.kind === "invalid-size" || value.kind === "invalid-type";
  const label =
    value.kind === "default" || invalid
      ? "Drop a file or tap to pick"
      : "Chosen";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={
          value.kind === "filled"
            ? `Chosen: ${value.file.name}`
            : "Choose a photo or short video to upload"
        }
        aria-invalid={invalid || undefined}
        aria-describedby={[errorId, describedById].filter(Boolean).join(" ") || undefined}
        aria-busy={busy || undefined}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
          if (e.key === "Escape" && value.kind === "filled") {
            e.preventDefault();
            onChange({ kind: "default" });
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className={[
          "flex min-h-[88px] cursor-pointer items-center justify-between gap-4",
          "border px-4 py-4 transition-colors",
          invalid
            ? "border-dashed border-[var(--rule-strong)]"
            : dragOver
              ? "border-solid border-[var(--rule-strong)] bg-[var(--row-active)]"
              : "border-dashed border-rule hover:bg-[var(--row-hover)]",
          busy ? "cursor-progress" : "",
        ].join(" ")}
      >
        {value.kind === "filled" ? (
          <>
            <div className="flex items-center gap-4">
              {value.previewUrl ? (
                // Preview thumbnail — client-only object URL. Not optimised
                // by next/image because it never ships; it's a Blob URL.
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={value.previewUrl}
                  alt=""
                  className="h-14 w-14 border border-rule object-cover"
                />
              ) : (
                <span className="inline-flex h-14 w-14 items-center justify-center border border-rule">
                  <FileGlyph />
                </span>
              )}
              <div className="min-w-0">
                <div className="label text-ink">{label}</div>
                <div className="truncate font-mono text-xs text-ink-muted">
                  {value.file.name}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ kind: "default" });
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="label text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Change
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center border border-rule">
              <UploadGlyph />
            </span>
            <div>
              <div className="label text-ink">{label}</div>
              <div className="mt-1 font-ui text-xs text-ink-muted">
                Photos: JPG, PNG, WEBP · Videos: MP4, MOV · 50 MB cap.
              </div>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          name="media"
          accept={ALLOWED.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {invalid && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 font-ui text-xs text-[color:rgb(var(--brand-rust))]"
        >
          {value.kind === "invalid-size"
            ? `This file is ${formatMB(value.bytes)} MB. Keep it under 50 MB — compress or crop and try again.`
            : "We take photos (JPG · PNG · WEBP) and short videos (MP4 · MOV). Try one of those."}
        </p>
      )}
    </div>
  );
}

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function UploadGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0l-5 5m5-5l5 5M4 20h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h7l4 4v14H7V3zm7 0v4h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
