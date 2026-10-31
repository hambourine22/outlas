import "server-only";

import { sql } from "@vercel/postgres";
import { createHash } from "node:crypto";

// Server-only module — carries DB access and the rate-limit helper. Never
// import this from a client component; Next's `server-only` package fails
// the build if it ever lands in a client bundle.

const RATE_LIMIT_WINDOW_MIN = 5;

export type RepairSubmissionInput = {
  shopName: string;
  address: string;
  email: string;
  website?: string;
  socialUrl?: string;
  description?: string;
  mediaUrls: string[];
};

export type RateLimitResult = { ok: true } | { ok: false; retryInSeconds: number };

export async function insertRepairSubmission(
  input: RepairSubmissionInput,
  ipHash: string,
): Promise<{ id: number }> {
  const result = await sql<{ id: number }>`
    INSERT INTO repair_submissions
      (shop_name, address, email, website, social_url, description, media_urls, ip_hash)
    VALUES
      (${input.shopName},
       ${input.address},
       ${input.email},
       ${input.website ?? null},
       ${input.socialUrl ?? null},
       ${input.description ?? null},
       ${JSON.stringify(input.mediaUrls)}::jsonb,
       ${ipHash})
    RETURNING id
  `;
  return { id: result.rows[0].id };
}

// A single-IP rate limit — one submission per 5 minutes. Trades some
// correctness for simplicity (hashed daily so Hamish never stores a raw IP,
// but the hash changes at UTC midnight so a bad actor could re-post then).
// Good enough for v1 — upgrade to a sliding window in a follow-up.
export async function checkRepairSubmissionRateLimit(ipHash: string): Promise<RateLimitResult> {
  const result = await sql<{ submitted_at: string }>`
    SELECT submitted_at FROM repair_submissions
    WHERE ip_hash = ${ipHash}
      AND submitted_at > NOW() - INTERVAL '${RATE_LIMIT_WINDOW_MIN} minutes'
    ORDER BY submitted_at DESC
    LIMIT 1
  `;
  if (result.rows.length === 0) return { ok: true };
  const lastMs = new Date(result.rows[0].submitted_at).getTime();
  const retryInSeconds = Math.max(
    0,
    Math.ceil((lastMs + RATE_LIMIT_WINDOW_MIN * 60_000 - Date.now()) / 1000),
  );
  return { ok: false, retryInSeconds };
}

export function hashIpForRateLimit(ip: string): string {
  // Daily salt — same IP produces the same hash within a UTC day, different
  // hashes across days. Keeps raw IPs out of the database entirely.
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return createHash("sha256").update(`${ip}|${day}|outlas`).digest("hex");
}
