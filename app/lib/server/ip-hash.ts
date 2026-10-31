import "server-only";
import { createHash } from "crypto";

// SHA-256 of (ip + daily salt). Not raw IP — rate-limit evidence without
// PII at rest. The salt rotates nightly so the hash is only correlatable
// within one day's window.
export function hashIpForAudit(ip: string, salt?: string): string {
  const dailySalt = salt ?? dailySaltFromDate(new Date());
  return createHash("sha256").update(`${ip}:${dailySalt}`).digest("hex");
}

function dailySaltFromDate(d: Date): string {
  // YYYY-MM-DD UTC. A per-process salt would be more private still but
  // breaks correlation across the one process a user actually hits.
  return `outlas-${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
