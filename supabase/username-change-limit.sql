-- ============================================================
-- USERNAME CHANGE LIMIT — Schema addition (2026-06-14)
-- Run this in the Supabase SQL Editor BEFORE deploying the
-- one-time username-change-limit feature.
-- ============================================================
--
-- Rule: a subscriber may change their TradingView username themselves
-- ONCE from the dashboard. After that the field locks and they must
-- email support@interakktive.com. An admin can reset the flag from the
-- admin panel to grant another free self-service change.
--
-- username_change_used : FALSE = the free self-service change is still
--                        available; TRUE = used up, dashboard locks the
--                        field and shows the "email support" message.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS username_change_used BOOLEAN NOT NULL DEFAULT FALSE;
