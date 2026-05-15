// ==========================================================================
// ADMIN AUTH + ROLE SYSTEM
// ==========================================================================
// Two roles:
//   - Owner:    full access (Shezab)
//   - Operator: view + limited write (Mustafa)
//
// Role is determined by which constant list the admin's email appears in.
// Actions that require Owner privileges call requireOwner() at the top and
// 403 if the caller is an Operator.
// ==========================================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from './supabase-server';

// ── ROLE DEFINITIONS ──
// To add a new admin: add their email to one of these lists and redeploy.
// The middleware allowlist is derived from these — keep in sync with
// middleware.ts if you copy this constant there.

export const OWNER_EMAILS = [
  'shezabmediaworxltd@gmail.com',
] as const;

export const OPERATOR_EMAILS = [
  'mustafamoinmirza@icloud.com',
] as const;

// Combined allowlist — used by middleware
export const ADMIN_EMAILS = [...OWNER_EMAILS, ...OPERATOR_EMAILS] as const;

export type AdminRole = 'owner' | 'operator';

/**
 * Returns the role for a given admin email, or null if not an admin.
 */
export function getRoleForEmail(email: string): AdminRole | null {
  const normalised = email.toLowerCase();
  if ((OWNER_EMAILS as readonly string[]).includes(normalised)) return 'owner';
  if ((OPERATOR_EMAILS as readonly string[]).includes(normalised)) return 'operator';
  return null;
}

// ── CAPABILITY MATRIX ──
// What each role can do. Operators have a stricter list.
// ALL admin actions should be checked against this via `can(role, capability)`.

export type Capability =
  // Users tab
  | 'user.view'
  | 'user.edit_tv_username'
  | 'user.resend_verification'
  | 'user.ban'
  | 'user.delete'
  // Subscriptions tab
  | 'sub.view'
  | 'sub.edit_notes'
  | 'sub.mark_tv_invite'
  | 'sub.reset_swap'
  | 'sub.grant_comp'
  | 'sub.change_plan'
  | 'sub.change_indicators'
  | 'sub.extend_period'
  | 'sub.cancel_period_end'
  | 'sub.cancel_immediate'
  | 'sub.reactivate'
  | 'sub.delete_record'
  | 'sub.refund'
  | 'sub.stripe_sync'
  // Prop tab
  | 'prop.view'
  | 'prop.delete_account'
  // Audit tab
  | 'audit.view'
  | 'audit.export'
  // Settings
  | 'settings.view'
  | 'settings.change_own_password'
  | 'settings.change_other_password'
  // Affiliate program
  | 'affiliate.view'
  | 'affiliate.review';

const OPERATOR_CAPS: ReadonlySet<Capability> = new Set<Capability>([
  // Read everywhere
  'user.view', 'sub.view', 'prop.view', 'audit.view', 'settings.view',
  'audit.export',
  // Limited user edits
  'user.edit_tv_username',
  'user.resend_verification',
  // Limited sub edits — can help customers but not destroy data or issue refunds
  'sub.edit_notes',
  'sub.mark_tv_invite',
  'sub.reset_swap',
  'sub.grant_comp',
  'sub.change_indicators',
  'sub.extend_period',
  'sub.reactivate',
  // Own password only
  'settings.change_own_password',
  // Affiliate program — Mustafa can review applications too
  'affiliate.view',
  'affiliate.review',
]);

/**
 * Check whether a role has permission for a capability.
 * Owner has everything. Operator has the subset defined above.
 */
export function can(role: AdminRole | null, capability: Capability): boolean {
  if (role === 'owner') return true;
  if (role === 'operator') return OPERATOR_CAPS.has(capability);
  return false;
}

// ── AUTH HELPERS ──

/**
 * Returns { email, role } if the caller is an admin, else null.
 * Prefer this over getAdminEmail() for new code since you get the role too.
 */
export async function getAdminContext(): Promise<{ email: string; role: AdminRole } | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;
    const email = user.email.toLowerCase();
    const role = getRoleForEmail(email);
    if (!role) return null;
    return { email, role };
  } catch (err) {
    console.error('getAdminContext error:', err);
    return null;
  }
}

/**
 * Returns the current admin's email if they pass the allowlist, else null.
 * Legacy signature — use getAdminContext() for new code.
 */
export async function getAdminEmail(_req?: NextRequest): Promise<string | null> {
  const ctx = await getAdminContext();
  return ctx?.email || null;
}

/**
 * Checks that the current caller has a specific capability.
 * Returns a tuple: [ok, adminEmail, role]. If !ok, route should 401/403.
 */
export async function requireCapability(
  capability: Capability
): Promise<{ ok: true; email: string; role: AdminRole } | { ok: false; status: 401 | 403 }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, status: 401 };
  if (!can(ctx.role, capability)) return { ok: false, status: 403 };
  return { ok: true, email: ctx.email, role: ctx.role };
}

// ── SERVICE-ROLE CLIENT ──

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey);
}

// ── AUDIT LOG ──

export interface AuditLogEntry {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: any;
  after?: any;
  ipAddress?: string | null;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('admin_audit_log').insert({
      admin_email: entry.adminEmail,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      before_data: entry.before ?? null,
      after_data: entry.after ?? null,
      ip_address: entry.ipAddress ?? null,
    });
    if (error) console.error('Audit log write failed:', error);
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}

export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}
