// app/api/admin-reset-academy/route.ts
// ============================================================================
// Resets the calling admin's Academy progress.
// - Deletes ALL lesson_completions rows for this user
// - Deletes ALL level_certificates rows for this user
// - Leaves trader_profiles untouched (handle/name/public toggle stay)
//
// SECURITY:
//   - Only callable by users whose auth.email is in ADMIN_EMAILS.
//   - Server-side check via getUser() (anon-key server client, reads cookie).
//   - DELETE uses the service-role client (RLS has no DELETE policy on these
//     tables, so anon-key DELETE silently fails with 0 rows).
//   - Even with service-role, deletion is scoped to the caller's email — we
//     never accept an email parameter from the request body.
// ============================================================================

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isAdminEmail } from '@/app/lib/admin-emails';

export const dynamic = 'force-dynamic';

function getAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey);
}

export async function POST() {
  try {
    // 1) Identify the caller via their auth cookie.
    const authClient = getAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }
    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }
    const userEmail = user.email; // pinned to the authenticated email — never trust body.

    // 2) Use service-role client for DELETE (no DELETE policy in RLS).
    const admin = getAdminClient();
    const [completionsRes, certsRes] = await Promise.all([
      admin.from('lesson_completions').delete().eq('user_email', userEmail),
      admin.from('level_certificates').delete().eq('user_email', userEmail),
    ]);

    if (completionsRes.error || certsRes.error) {
      return NextResponse.json(
        { error: 'Reset partially failed', details: { completions: completionsRes.error?.message, certs: certsRes.error?.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: userEmail,
      message: 'Academy progress reset.',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

