-- ============================================================
-- ATLAS ACADEMY — Lesson Completions + Level Certificates
-- Run this once in the Supabase SQL Editor.
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS / etc).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Lesson completions (one row per user per lesson)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  lesson_id TEXT NOT NULL,             -- e.g. 'what-is-trading'
  level_id TEXT NOT NULL,              -- e.g. 'level-1-foundations'
  quiz_score INT,                      -- 0-100, optional
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_email, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_email ON lesson_completions (user_email);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_level_id ON lesson_completions (level_id);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Users can read and insert their own completions (matched by email).
DROP POLICY IF EXISTS "Users read own lesson_completions" ON lesson_completions;
CREATE POLICY "Users read own lesson_completions" ON lesson_completions
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users insert own lesson_completions" ON lesson_completions;
CREATE POLICY "Users insert own lesson_completions" ON lesson_completions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- ────────────────────────────────────────────────────────────
-- 2. Level certificates (one row per user per completed level)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS level_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  level_id TEXT NOT NULL,              -- e.g. 'level-1-foundations'
  trader_name TEXT NOT NULL,           -- snapshotted at issue time
  cert_code TEXT NOT NULL UNIQUE,      -- e.g. 'ATLAS-L1-A3F8K2X9'
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_email, level_id)
);

CREATE INDEX IF NOT EXISTS idx_level_certificates_user_email ON level_certificates (user_email);

ALTER TABLE level_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own level_certificates" ON level_certificates;
CREATE POLICY "Users read own level_certificates" ON level_certificates
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users insert own level_certificates" ON level_certificates;
CREATE POLICY "Users insert own level_certificates" ON level_certificates
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- ────────────────────────────────────────────────────────────
-- 3. Trader profile (custom name override for certificate display)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trader_profiles (
  user_email TEXT PRIMARY KEY,
  trader_name TEXT,                    -- nullable; falls back to OAuth name
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trader_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own trader_profile" ON trader_profiles;
CREATE POLICY "Users read own trader_profile" ON trader_profiles
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users insert own trader_profile" ON trader_profiles;
CREATE POLICY "Users insert own trader_profile" ON trader_profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

DROP POLICY IF EXISTS "Users update own trader_profile" ON trader_profiles;
CREATE POLICY "Users update own trader_profile" ON trader_profiles
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
