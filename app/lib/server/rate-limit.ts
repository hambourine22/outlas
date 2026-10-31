import "server-only";

// In-memory per-IP rate limiter. Lossy on cold start — v1 accepts that.
// A single submission per IP per 10 minutes is enough signal for the
// honeypot to catch the trivial bots; serious abuse is a v2 problem.

type Bucket = { lastAt: number };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 5000; // soft cap — LRU-ish eviction below

const buckets = new Map<string, Bucket>();

export function isRateLimited(ip: string, now: number = Date.now()): boolean {
  const b = buckets.get(ip);
  if (!b) return false;
  return now - b.lastAt < WINDOW_MS;
}

export function markSubmission(ip: string, now: number = Date.now()): void {
  // Evict the oldest entry when we hit the cap. Not strictly LRU but good
  // enough for a submission-rate limiter — real-world IPs that keep
  // submitting are the ones we want to remember.
  if (buckets.size >= MAX_ENTRIES) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (oldestKey) buckets.delete(oldestKey);
  }
  buckets.set(ip, { lastAt: now });
}

export function clearRateLimitBuckets_forTests(): void {
  buckets.clear();
}
