import "server-only";

// Shared types + env helpers for the rental-submission flow.
// Nothing in this module ever reaches the client (server-only enforces it).

export type SubmissionPayload = {
  name: string;
  resorts: string;
  description: string;
  social?: string;
  website?: string;
  media_url?: string;
  media_mime?: string;
};

export type SubmissionEnv = {
  airtableToken?: string;
  airtableBaseId?: string;
  airtableTableName?: string;
  blobToken?: string;
  resendKey?: string;
  notifyEmail?: string;
};

export function readSubmissionEnv(): SubmissionEnv {
  return {
    airtableToken:     process.env.AIRTABLE_TOKEN,
    airtableBaseId:    process.env.AIRTABLE_BASE_ID,
    airtableTableName: process.env.AIRTABLE_TABLE_NAME || "rental_submissions",
    blobToken:         process.env.BLOB_READ_WRITE_TOKEN,
    resendKey:         process.env.RESEND_API_KEY,
    notifyEmail:       process.env.OUTLAS_NOTIFY_EMAIL,
  };
}

// Preview mode = any required secret is missing. Media is optional so blob
// secret only matters if media was uploaded; email is a non-blocking notify
// so a missing Resend key doesn't flip us into preview, we just skip email.
export function isPreviewMode(env: SubmissionEnv, hasMedia: boolean): boolean {
  if (!env.airtableToken || !env.airtableBaseId) return true;
  if (hasMedia && !env.blobToken) return true;
  return false;
}

// Allowed media MIME types per the spec. The server does its own sniff on
// top of the Content-Type header; this list is the whitelist.
export const ALLOWED_MEDIA_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
]);

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024; // 50 MB
