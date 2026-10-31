-- Migration 001 — guide_submissions
-- Run against production Postgres with:
--   psql $POSTGRES_URL -f scripts/migrations/001_guide_submissions.sql
-- Or paste into the Vercel Postgres dashboard "Query" tab.
--
-- Idempotent: safe to run twice.

CREATE TABLE IF NOT EXISTS guide_submissions (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT       NOT NULL,
  email         TEXT       NOT NULL,
  pitch         TEXT       NOT NULL,       -- 3-sentence self-pitch, max 400 chars (enforced in app)
  disciplines   TEXT       NOT NULL,       -- comma-separated subset of the ACTIVITIES enum
  regions       TEXT,
  website       TEXT,
  instagram     TEXT,                      -- handle without @, or full URL
  youtube       TEXT,
  media_urls    JSONB      NOT NULL DEFAULT '[]'::jsonb,  -- array of Vercel Blob URLs
  ip_hash       TEXT,                      -- SHA-256 of IP + daily salt — for rate limit, not for lookup
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  status        TEXT       NOT NULL DEFAULT 'pending'  -- pending | approved | rejected
);

-- Rate-limit lookup — "did this IP post in the last 5 minutes?"
CREATE INDEX IF NOT EXISTS idx_guide_submissions_ip_time
  ON guide_submissions (ip_hash, submitted_at DESC);

-- Review queue — "show me pending submissions newest first"
CREATE INDEX IF NOT EXISTS idx_guide_submissions_status_time
  ON guide_submissions (status, submitted_at DESC);
