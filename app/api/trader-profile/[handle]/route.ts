// app/api/trader-profile/[handle]/route.ts
// ============================================================================
// Public lookup: returns a trader profile + their earned certificates IF the
// trader has set is_public = true. No auth required.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = (params.handle || '').trim().toLowerCase();
    if (!handle || handle.length < 2 || handle.length > 32 || !/^[a-z0-9_-]+$/.test(handle)) {
      return NextResponse.json({ found: false, error: 'Invalid handle' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Find the trader profile (case-insensitive lookup).
    // We can't use eq() with LOWER() so we filter via ilike with no wildcards.
    const { data: profiles } = await supabase
      .from('trader_profiles')
      .select('user_email, trader_name, public_handle, bio, is_public')
      .ilike('public_handle', handle)
      .eq('is_public', true)
      .limit(1);

    const profile = profiles?.[0];
    if (!profile) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    // Pull certs and lesson completion count.
    const [certsRes, completionsRes] = await Promise.all([
      supabase
        .from('level_certificates')
        .select('cert_code, level_id, issued_at')
        .eq('user_email', profile.user_email)
        .order('issued_at', { ascending: true }),
      supabase
        .from('lesson_completions')
        .select('lesson_id', { count: 'exact', head: true })
        .eq('user_email', profile.user_email),
    ]);

    return NextResponse.json({
      found: true,
      profile: {
        handle: profile.public_handle,
        trader_name: profile.trader_name,
        bio: profile.bio,
      },
      certificates: certsRes.data || [],
      lessonsCompleted: completionsRes.count || 0,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ found: false, error: msg }, { status: 500 });
  }
}
