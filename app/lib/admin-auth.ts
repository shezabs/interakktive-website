import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Single source of truth for the admin allowlist.
// Must match middleware.ts exactly. If you edit one, edit both.
export const ADMIN_EMAILS = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

/**
 * Returns the signed-in admin's email if they pass the allowlist check,
 * otherwise returns null. API routes should call this and 401 on null.
 *
 * Defence in depth: even though middleware also checks this, API routes
 * can be called directly and must not trust the middleware alone.
 */
export async function getAdminEmail(): Promise<string | null> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const email = user.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) return null;

    return email;
  } catch (err) {
    console.error('getAdminEmail error:', err);
    return null;
  }
}

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS. Only ever call this AFTER verifying the caller is an admin.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey);
}

export interface AuditLogEntry {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: any;
  after?: any;
  ipAddress?: string | null;
}

/**
 * Writes a row to admin_audit_log. Failures are logged but do not throw —
 * we never want an audit log failure to block an admin action.
 */
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
    if (error) {
      console.error('Audit log write failed:', error);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}

/**
 * Extract IP address from the request headers.
 * Vercel sets x-forwarded-for; fallback to x-real-ip.
 */
export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}
