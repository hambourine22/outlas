import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  readSubmissionEnv,
  isPreviewMode,
  ALLOWED_MEDIA_MIME,
  MAX_MEDIA_BYTES,
  type SubmissionPayload,
} from "@/app/lib/server/submission";
import { putToBlob } from "@/app/lib/server/blob";
import { createAirtableRecord, airtableRecordLink } from "@/app/lib/server/airtable";
import { sendResendEmail } from "@/app/lib/server/resend";
import { isRateLimited, markSubmission } from "@/app/lib/server/rate-limit";
import { hashIpForAudit } from "@/app/lib/server/ip-hash";

// POST /api/rentals/submit — accepts multipart/form-data with the six
// fields plus honeypot and optional media. Orchestrates:
//   1. honeypot + rate-limit short-circuits
//   2. required-field validation
//   3. media validation (MIME + size)
//   4. Blob upload (when media + secret present)
//   5. Airtable record create (when secrets present)
//   6. Resend notification email (best-effort — failure is logged, not fatal)
//
// Returns 200 { ok: true, id } on success, 202 { ok: true, preview: true }
// in preview mode, 400 for validation, 413 for size, 415 for MIME, 429 for
// rate limit. Honeypot hits always return a cheerful 200 fake-success so
// the bot thinks it worked.

export const runtime = "nodejs";          // Vercel Blob + large bodies need Node
export const dynamic = "force-dynamic";   // never cache a submission endpoint
export const maxDuration = 60;             // allow slow 50MB uploads

const SUCCESS_REDIRECT = "/rentals/submit/success";

export async function POST(req: NextRequest) {
  const wantsHtml = (req.headers.get("accept") || "").includes("text/html");
  const baseUrl = new URL(req.url);

  const ip = resolveIp(req);
  const ct = req.headers.get("content-type") || "";
  if (!ct.toLowerCase().startsWith("multipart/form-data")) {
    return respond(wantsHtml, 400, { ok: false, error: "expected multipart/form-data" });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respond(wantsHtml, 400, { ok: false, error: "malformed form data" });
  }

  // Honeypot — bots fill this; real users never see it. Fake success.
  const honeypot = String(form.get("website_url_2") || "").trim();
  if (honeypot) {
    return respond(wantsHtml, 200, { ok: true, honeypot: true }, { name: "there", baseUrl });
  }

  // Required fields
  const name = String(form.get("name") || "").trim();
  const resorts = String(form.get("resorts") || "").trim();
  const description = String(form.get("description") || "").trim();
  const social = String(form.get("social") || "").trim() || undefined;
  const website = String(form.get("website") || "").trim() || undefined;

  const missing: string[] = [];
  if (!name)        missing.push("name");
  if (!resorts)     missing.push("resorts");
  if (!description) missing.push("description");
  if (missing.length) {
    return respond(wantsHtml, 400, { ok: false, error: "missing required fields", fields: missing }, { baseUrl });
  }

  // Rate limit AFTER required-field check so a user who typo'd their shop
  // name and submitted empty doesn't eat their 10-minute cooldown.
  if (isRateLimited(ip)) {
    return respond(wantsHtml, 429, { ok: false, error: "rate_limited" }, { baseUrl });
  }

  // Media (optional)
  const media = form.get("media") as File | null;
  const hasMedia = !!media && media.size > 0;
  if (hasMedia && media) {
    if (!ALLOWED_MEDIA_MIME.has(media.type)) {
      return respond(wantsHtml, 415, { ok: false, error: "media_type", mime: media.type }, { baseUrl });
    }
    if (media.size > MAX_MEDIA_BYTES) {
      return respond(wantsHtml, 413, { ok: false, error: "media_size", bytes: media.size }, { baseUrl });
    }
  }

  // ---- Env check — preview mode when any required secret is missing ----
  const env = readSubmissionEnv();
  const preview = isPreviewMode(env, hasMedia);

  const payload: SubmissionPayload = { name, resorts, description, social, website };

  // --- Blob upload (if media + token) ---
  if (hasMedia && media && !preview && env.blobToken) {
    try {
      const ext = extensionFor(media.type);
      const pathname = `rental-submissions/${randomBytes(12).toString("hex")}${ext}`;
      const put = await putToBlob({
        token: env.blobToken,
        pathname,
        mime: media.type,
        body: media,
      });
      payload.media_url = put.url;
      payload.media_mime = media.type;
    } catch (err) {
      console.error("[rentals/submit] blob upload failed", err);
      return respond(wantsHtml, 502, { ok: false, error: "upload_failed" }, { baseUrl });
    }
  }

  // --- Preview mode short-circuit ---
  if (preview) {
    markSubmission(ip);
    console.info("[rentals/submit] PREVIEW submission (not stored):", {
      ...payload,
      bytes: media?.size,
      mime: media?.type,
    });
    return respond(wantsHtml, 202, { ok: true, preview: true }, { name, baseUrl });
  }

  // --- Airtable write ---
  let recordId: string;
  try {
    const now = new Date();
    const rec = await createAirtableRecord({
      token: env.airtableToken!,
      baseId: env.airtableBaseId!,
      tableName: env.airtableTableName!,
      fields: {
        name,
        resorts,
        description,
        social: social || "",
        website: website || "",
        media_url: payload.media_url || "",
        media_mime: payload.media_mime || "",
        submitted_at: now.toISOString(),
        ip_hash: hashIpForAudit(ip),
        status: "pending",
        approved_slug: "",
      },
    });
    recordId = rec.id;
  } catch (err) {
    console.error("[rentals/submit] airtable write failed", err);
    return respond(wantsHtml, 502, { ok: false, error: "store_failed" }, { baseUrl });
  }

  markSubmission(ip);

  // --- Resend email (best-effort — failure is logged, not fatal) ---
  if (env.resendKey && env.notifyEmail) {
    const link = airtableRecordLink(env.airtableBaseId!, env.airtableTableName!, recordId);
    const emailText =
      `${name} just submitted their shop.\n\n` +
      `Resorts:   ${resorts}\n` +
      `Shop:      ${description}\n` +
      `Social:    ${social || "—"}\n` +
      `Website:   ${website || "—"}\n` +
      `Media:     ${payload.media_url || "none"}\n\n` +
      `Open in Airtable: ${link}\n\n` +
      `(Replying to this email does nothing — the shop didn't share contact details yet. ` +
      `The social or website link above is your way back to them.)\n`;
    try {
      await sendResendEmail({
        apiKey: env.resendKey,
        from: "Oütlas <hello@outlas.cc>",
        to: env.notifyEmail,
        subject: `New rental submission — ${name}`,
        text: emailText,
      });
    } catch (err) {
      console.error("[rentals/submit] notification email failed (non-fatal)", err);
    }
  }

  return respond(wantsHtml, 200, { ok: true, id: recordId }, { name, baseUrl });
}

/* ---------- helpers ---------- */

function respond(
  wantsHtml: boolean,
  status: number,
  body: Record<string, unknown>,
  context?: { name?: string; baseUrl?: URL },
): Response {
  // No-JS clients (browser native POST with Accept: text/html) get a 303
  // redirect to the success page carrying `?name=…` so SubmissionSuccess
  // can echo the shop's name. Non-success states also redirect so the
  // browser lands on a readable error page rather than a JSON blob.
  if (wantsHtml && context?.baseUrl) {
    const name = encodeURIComponent(context.name || "");
    if (status >= 200 && status < 400 && body.ok) {
      const url = new URL(SUCCESS_REDIRECT, context.baseUrl);
      url.searchParams.set("name", name);
      if (body.preview) url.searchParams.set("preview", "1");
      return NextResponse.redirect(url, { status: 303 });
    }
    const url = new URL(SUCCESS_REDIRECT, context.baseUrl);
    const errorCode = typeof body.error === "string" ? body.error : "unknown";
    url.searchParams.set("error", errorCode);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.json(body, { status });
}

function resolveIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":      return ".jpg";
    case "image/png":       return ".png";
    case "image/webp":      return ".webp";
    case "video/mp4":       return ".mp4";
    case "video/quicktime": return ".mov";
    default:                return "";
  }
}
