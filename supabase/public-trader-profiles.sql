-- ============================================================
-- ATLAS Trader Profiles — Public Handle + Visibility
-- Run this once in the Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================

-- Add columns to trader_profiles for public profile pages.
ALTER TABLE trader_profiles
  ADD COLUMN IF NOT EXISTS public_handle TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Public handle must be unique (case-insensitive). Indexed for fast lookup.
-- We use a partial unique index so multiple users can have NULL handles.
CREATE UNIQUE INDEX IF NOT EXISTS idx_trader_profiles_public_handle_lower
  ON trader_profiles (LOWER(public_handle))
  WHERE public_handle IS NOT NULL;

-- Anonymous read policy for trader_profiles when is_public = true.
-- (Existing policies remain — owners can still read/write their own.)
DROP POLICY IF EXISTS "Anyone reads public trader_profiles" ON trader_profiles;
CREATE POLICY "Anyone reads public trader_profiles" ON trader_profiles
  FOR SELECT
  USING (is_public = true);

-- Anonymous read policy for level_certificates when the profile is public.
-- Lets the public profile page show the trader's earned certs.
DROP POLICY IF EXISTS "Anyone reads certs of public traders" ON level_certificates;
CREATE POLICY "Anyone reads certs of public traders" ON level_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trader_profiles tp
      WHERE tp.user_email = level_certificates.user_email
        AND tp.is_public = true
    )
  );
