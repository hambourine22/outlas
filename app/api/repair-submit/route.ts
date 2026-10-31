import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import {
  insertRepairSubmission,
  checkRepairSubmissionRateLimit,
  hashIpForRateLimit,
} from "@/app/lib/repair-submissions";

// POST /api/repair-submit
// Accepts multipart/form-data with fields: shopName, address, email,
// (optional) website, socialUrl, description, and up to 3 files under
// the "media" field. Validates, uploads media to Vercel Blob, writes a
// pending row to repair_submissions, returns { ok: true, id }.
//
// Server-only validation is the source of truth; client validation is
// a UX nicety, not a security boundary.

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 3;
const MAX_DESCRIPTION = 200;
const MAX_TEXT = 300; // for any single short text field
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "video/mp4", "video/quicktime"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

type ErrorPayload = { ok: false; error: string; field?: string };

function err(status: number, error: string, field?: string): NextResponse<ErrorPayload> {
  return NextResponse.json({ ok: false, error, field } as const, { status });
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return err(503, "Uploads aren't live yet. Please email us at hamish@hamishduncan.com instead.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return err(400, "Couldn't read the submission.");
  }

  const shopName = asText(form.get("shopName"));
  const address = asText(form.get("address"));
  const email = asText(form.get("email"));
  const website = asText(form.get("website"));
  const socialUrl = asText(form.get("socialUrl"));
  const description = asText(form.get("description"));

  if (!shopName) return err(400, "This one is needed.", "shopName");
  if (!address) return err(400, "This one is needed.", "address");
  if (!email) return err(400, "This one is needed.", "email");

  if (shopName.length > MAX_TEXT) return err(400, "Shop name is too long.", "shopName");
  if (address.length > MAX_TEXT) return err(400, "Address is too long.", "address");
  if (!EMAIL_RE.test(email)) return err(400, "That doesn't look like an email.", "email");
  if (website && !URL_RE.test(website)) return err(400, "Website must be a full https:// URL.", "website");
  if (socialUrl && !URL_RE.test(socialUrl)) return err(400, "Social link must be a full https:// URL.", "socialUrl");
  if (description && description.length > MAX_DESCRIPTION) {
    return err(400, `Description is longer than ${MAX_DESCRIPTION} characters.`, "description");
  }

  // Rate limit — one submission per 5 minutes per IP (daily-salted hash).
  const ip = ipFromRequest(request);
  const ipHash = hashIpForRateLimit(ip);
  const rate = await checkRepairSubmissionRateLimit(ipHash);
  if (!rate.ok) {
    return err(
      429,
      `Too fast — try again in about ${Math.ceil(rate.retryInSeconds / 60)} minute(s).`,
    );
  }

  // Media — up to 3 files, validated server-side regardless of what
  // the browser dropped from the batch client-side.
  const files = form.getAll("media").filter((f): f is File => f instanceof File);
  if (files.length > MAX_FILES) {
    return err(400, `Only ${MAX_FILES} files per submission.`);
  }

  const mediaUrls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue; // empty file inputs
    if (file.size > MAX_FILE_BYTES) {
      return err(400, "A file is over 10MB. Try smaller ones.");
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return err(400, "Only JPG, PNG, MP4 or MOV.");
    }
    const safeName = sanitiseFilename(file.name);
    const timestamp = Date.now();
    const key = `repair-submissions/${timestamp}/${safeName}`;
    try {
      const { url } = await put(key, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: true,
      });
      mediaUrls.push(url);
    } catch (e) {
      console.error("blob upload failed", e);
      return err(500, "Couldn't save your file. Try again, or email us direct at hamish@hamishduncan.com.");
    }
  }

  try {
    const { id } = await insertRepairSubmission(
      {
        shopName,
        address,
        email,
        website: website || undefined,
        socialUrl: socialUrl || undefined,
        description: description || undefined,
        mediaUrls,
      },
      ipHash,
    );
    return NextResponse.json({ ok: true, id } as const, { status: 201 });
  } catch (e) {
    console.error("insert repair submission failed", e);
    return err(500, "Something broke. Try again, or email us direct at hamish@hamishduncan.com.");
  }
}

function asText(v: FormDataEntryValue | null): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function ipFromRequest(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-vercel-forwarded-for") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

function sanitiseFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return base || "upload";
}
