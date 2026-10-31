-- Migration 002 — repair_submissions
-- Run against production Postgres with:
--   psql $POSTGRES_URL -f scripts/migrations/002_repair_submissions.sql
-- Or paste into the Vercel Postgres dashboard "Query" tab.
--
-- Idempotent: safe to run twice.

CREATE TABLE IF NOT EXISTS repair_submissions (
  id            BIGSERIAL PRIMARY KEY,
  shop_name     TEXT       NOT NULL,
  address       TEXT       NOT NULL,          -- single-line address or town
  email         TEXT       NOT NULL,          -- moderation reply address — not shown on map
  website       TEXT,                         -- optional, http(s) URL
  social_url    TEXT,                         -- optional, http(s) URL
  description   TEXT,                         -- optional, max 200 chars (enforced in app)
  media_urls    JSONB      NOT NULL DEFAULT '[]'::jsonb,  -- array of Vercel Blob URLs
  ip_hash       TEXT,                         -- SHA-256 of IP + daily salt — for rate limit, not for lookup
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  status        TEXT       NOT NULL DEFAULT 'pending'  -- pending | approved | rejected
);

-- Rate-limit lookup — "did this IP post in the last 5 minutes?"
CREATE INDEX IF NOT EXISTS idx_repair_submissions_ip_time
  ON repair_submissions (ip_hash, submitted_at DESC);

-- Review queue — "show me pending submissions newest first"
CREATE INDEX IF NOT EXISTS idx_repair_submissions_status_time
  ON repair_submissions (status, submitted_at DESC);
