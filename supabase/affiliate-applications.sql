-- =====================================================================
-- AFFILIATE APPLICATIONS — Phase 1 (application pipeline only)
-- =====================================================================
-- Tracks public affiliate program applications submitted via /affiliates.
-- Only existing paying customers (verified server-side) can submit.
-- Status lifecycle: pending → approved | rejected | withdrawn
-- Admin reviews via /admin/affiliates tab.
-- =====================================================================

CREATE TABLE IF NOT EXISTS affiliate_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email           text NOT NULL,
  full_name       text NOT NULL,
  tv_username     text,
  promotion_urls  text NOT NULL,           -- multi-line free text; URLs they'll promote on
  audience_size   text NOT NULL,           -- 'under_500' | '500_5k' | '5k_50k' | '50k_500k' | '500k_plus'
  niche           text NOT NULL,           -- 'forex' | 'crypto' | 'indices' | 'commodities' | 'mixed' | 'educational' | 'other'
  pitch           text NOT NULL,           -- 100-500 char short pitch
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  reviewed_by     text,                    -- admin email that decided
  admin_notes     text,                    -- internal-only notes from reviewer
  -- snapshot of subscription state at submit time (for audit)
  customer_plan   text,
  customer_status text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_apps_status ON affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_email  ON affiliate_applications(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_submitted ON affiliate_applications(submitted_at DESC);

-- updated_at auto-bump trigger (same pattern as other tables)
CREATE OR REPLACE FUNCTION affiliate_apps_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_affiliate_apps_updated_at ON affiliate_applications;
CREATE TRIGGER trg_affiliate_apps_updated_at
  BEFORE UPDATE ON affiliate_applications
  FOR EACH ROW EXECUTE FUNCTION affiliate_apps_set_updated_at();

-- =====================================================================
-- RLS — public can INSERT (validated server-side), nobody can SELECT/UPDATE
-- All reads + writes happen via service-role API routes (admin or apply).
-- =====================================================================
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS affiliate_apps_insert_own ON affiliate_applications;
CREATE POLICY affiliate_apps_insert_own ON affiliate_applications
  FOR INSERT
  WITH CHECK (false);  -- All inserts go through service-role server route

DROP POLICY IF EXISTS affiliate_apps_select_own ON affiliate_applications;
CREATE POLICY affiliate_apps_select_own ON affiliate_applications
  FOR SELECT
  USING (false);       -- All reads go through admin service-role route

-- =====================================================================
-- DONE
-- Run once in Supabase SQL editor.
-- =====================================================================
