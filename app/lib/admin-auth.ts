import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Single source of truth for the admin allowlist.
// Must match the list in app/admin/layout.tsx (client guard).
export const ADMIN_EMAILS = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

/**
 * Returns the signed-in admin's email if they pass the allowlist check,
 * otherwise returns null. API routes should call this and 401 on null.
 *
 * Reads the user's access token from the Authorization: Bearer header.
 * The client (admin pages) is responsible for attaching this header to
 * every fetch() call to /api/admin/*.
 */
export async function getAdminEmail(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return null;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;

    // Validate the token by asking Supabase who owns it
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) return null;

    const email = data.user.email.toLowerCase();
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
 * Writes a row to admin_audit_log. Failures are logged but do not throw.
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
