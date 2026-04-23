-- ============================================================
-- ADMIN PANEL — Schema additions
-- Run this in the Supabase SQL Editor BEFORE deploying the admin panel code
-- ============================================================

-- 1. Add two columns to the existing subscriptions table
--    tv_invite_sent: admin marks this TRUE once they've manually granted
--      TradingView access to the user (replaces the "did I do this yet?" memory problem)
--    admin_notes:    free-text field for admin-only annotations
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS tv_invite_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_notes    TEXT;

-- 2. Create the audit log table
--    Every admin mutation writes a row here with before/after snapshots
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,           -- e.g. 'subscription.cancel', 'user.delete', 'subscription.grant_comp'
  target_type TEXT NOT NULL,           -- 'user', 'subscription', etc.
  target_id   TEXT,                    -- the id of the row being changed (string to handle both uuids and text ids)
  before_data JSONB,                   -- snapshot of the row BEFORE the change (null for creates)
  after_data  JSONB,                   -- snapshot of the row AFTER the change (null for deletes)
  ip_address  TEXT,                    -- optional, captured from request headers
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast filtering by admin, action, and date
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin      ON admin_audit_log (admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action     ON admin_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target     ON admin_audit_log (target_type, target_id);

-- ============================================================
-- ROW LEVEL SECURITY for admin_audit_log
-- Only admin emails can read; only service role can write
-- (Service role bypasses RLS entirely, so the write policy is
-- actually enforced at the application layer via requireAdmin().)
-- ============================================================

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow read access for the two admin emails only
DROP POLICY IF EXISTS "Admins can read audit log" ON admin_audit_log;
CREATE POLICY "Admins can read audit log" ON admin_audit_log
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'shezabmediaworxltd@gmail.com',
      'mustafamoinmirza@icloud.com'
    )
  );

-- No INSERT/UPDATE/DELETE policy — only the service role key (used in /api/admin/*)
-- can write to this table. That's intentional. No user, not even admins,
-- should be able to write the audit log directly from the browser.

-- ============================================================
-- VERIFICATION
-- ============================================================
-- After running this, verify with:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'subscriptions'
--     AND column_name IN ('tv_invite_sent', 'admin_notes');
--   -- Expected: 2 rows
--
--   SELECT COUNT(*) FROM admin_audit_log;
--   -- Expected: 0 (empty table, ready to receive writes)
