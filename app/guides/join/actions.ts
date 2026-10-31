"use server";

import { sql } from "@vercel/postgres";
import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { ACTIVITIES, type Activity } from "@/app/content/map/types";

// Server action for the Guides apply form. Validates fields, honeypot-
// checks for bots, rate-limits by IP hash (5 min window), uploads up to
// three media files to Vercel Blob, and inserts a row into
// guide_submissions. See docs/specs/guides-apply-form.md for the full
// contract and scripts/migrations/001_guide_submissions.sql for the table.

const MAX_MEDIA_FILES = 3;
const MAX_FILE_BYTES  = 25 * 1024 * 1024; // 25 MB per file
const MAX_PITCH_CHARS = 400;
const RATE_WINDOW_MIN = 5;

const ACTIVITY_SET = new Set<string>(ACTIVITIES);

export type SubmissionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

export async function submitGuideApplication(
  _prev: SubmissionResult | null,
  formData: FormData,
): Promise<SubmissionResult> {
  const errors: Record<string, string> = {};

  // --- Honeypot — the field is hidden off-screen and labelled as a
  // decoy. Any value here means a bot filled it. Fail silently so the
  // bot thinks it worked.
  if (String(formData.get("website_extra") || "").trim() !== "") {
    return { ok: true };
  }

  const name    = String(formData.get("name")    || "").trim();
  const email   = String(formData.get("email")   || "").trim();
  const pitch   = String(formData.get("pitch")   || "").trim();
  const regions = String(formData.get("regions") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const youtube   = String(formData.get("youtube")   || "").trim();

  if (name.length < 2 || name.length > 120) errors.name = "Please enter your name.";
  if (!isEmail(email))                       errors.email = "A real email, please — it's how we come back to you.";
  if (pitch.length < 20)                     errors.pitch = "A sentence or two more about you.";
  if (pitch.length > MAX_PITCH_CHARS)        errors.pitch = `Keep it under ${MAX_PITCH_CHARS} characters.`;

  const disciplines = formData.getAll("disciplines").map(String).filter((s) => ACTIVITY_SET.has(s));
  if (disciplines.length === 0) errors.disciplines = "Pick at least one discipline.";

  const mediaFiles = formData.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);
  if (mediaFiles.length > MAX_MEDIA_FILES) errors.media = `Up to ${MAX_MEDIA_FILES} files, please.`;
  for (const f of mediaFiles) {
    if (f.size > MAX_FILE_BYTES) {
      errors.media = `Each file under 25 MB — "${f.name}" is larger.`;
      break;
    }
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      errors.media = "Images and video only.";
      break;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // --- Rate limit — hash IP + today's date so the stored value can't be
  // used to re-identify the submitter later, and expires each day.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = new Date().toISOString().slice(0, 10);
  const ipHash = crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");

  try {
    const recent = await sql<{ count: number }>`
      SELECT COUNT(*)::int AS count FROM guide_submissions
      WHERE ip_hash = ${ipHash}
      AND submitted_at > NOW() - INTERVAL '${RATE_WINDOW_MIN} minutes'
    `;
    if ((recent.rows[0]?.count ?? 0) > 0) {
      return { ok: false, errors: { form: "You've just submitted — give it a few minutes before trying again." } };
    }
  } catch (err) {
    // Table may not exist yet in dev; treat rate-limit check as pass but
    // log for ops. Real failures surface below on INSERT.
    console.warn("Rate-limit check skipped:", err);
  }

  // --- Media → Vercel Blob (public URLs; see brief for retention).
  const mediaUrls: string[] = [];
  for (const file of mediaFiles) {
    const key = `guides/apply/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    try {
      const blob = await put(key, file, { access: "public", addRandomSuffix: false });
      mediaUrls.push(blob.url);
    } catch (err) {
      console.error("Blob upload failed:", err);
      return { ok: false, errors: { form: "Your files didn't upload — try again, or submit without them." } };
    }
  }

  // --- Insert the submission.
  try {
    await sql`
      INSERT INTO guide_submissions
        (name, email, pitch, disciplines, regions, website, instagram, youtube, media_urls, ip_hash)
      VALUES
        (${name}, ${email}, ${pitch}, ${disciplines.join(",")},
         ${regions || null}, ${website || null}, ${instagram || null}, ${youtube || null},
         ${JSON.stringify(mediaUrls)}::jsonb, ${ipHash})
    `;
  } catch (err) {
    console.error("Guide submission INSERT failed:", err);
    return { ok: false, errors: { form: "Something stopped the submission landing — try once more in a minute." } };
  }

  return { ok: true };
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-80);
}

export { ACTIVITIES };
export type { Activity };
