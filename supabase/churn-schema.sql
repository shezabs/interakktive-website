-- ============================================================
-- Phase 2 schema additions: churn reason capture
-- Run in Supabase SQL Editor
-- ============================================================

-- Table to record why users cancelled
-- One row per cancellation event — we keep them forever for analysis
CREATE TABLE IF NOT EXISTS churn_reasons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,                         -- nullable in case user already deleted
  user_email      TEXT NOT NULL,                -- snapshot, not FK
  subscription_id UUID,                         -- nullable, not FK (subs may be deleted later)
  plan            TEXT NOT NULL,                -- plan at time of cancellation
  billing         TEXT NOT NULL,                -- monthly/annual at time of cancellation
  reason_code     TEXT NOT NULL,                -- enum-like: too_expensive / not_using / found_competitor / missing_feature / tech_issues / other
  reason_text     TEXT,                         -- free text elaboration
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_churn_reasons_created_at ON churn_reasons (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_churn_reasons_code       ON churn_reasons (reason_code);
CREATE INDEX IF NOT EXISTS idx_churn_reasons_plan       ON churn_reasons (plan);

-- RLS: only admins can read; the cancel flow inserts via service role
ALTER TABLE churn_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read churn reasons" ON churn_reasons;
CREATE POLICY "Admins can read churn reasons" ON churn_reasons
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'shezabmediaworxltd@gmail.com',
      'mustafamoinmirza@icloud.com'
    )
  );

-- Users can insert their own cancellation reason (called from the customer-facing cancel flow)
DROP POLICY IF EXISTS "Users insert own churn reason" ON churn_reasons;
CREATE POLICY "Users insert own churn reason" ON churn_reasons
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR auth.jwt() ->> 'email' = user_email
  );

-- ============================================================
-- Verification:
--   SELECT * FROM churn_reasons LIMIT 0;   -- should return schema
--   SELECT COUNT(*) FROM churn_reasons;    -- 0 initially
-- ============================================================
