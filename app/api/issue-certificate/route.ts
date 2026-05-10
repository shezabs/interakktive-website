// app/api/issue-certificate/route.ts
// ============================================================================
// Issues a level certificate to the current user, IF every live lesson in that
// level has a completion record. Idempotent: re-issuing returns the existing
// cert. Trader name resolution order:
//   1) trader_profiles.trader_name (user-set override)
//   2) auth.users.raw_user_meta_data.full_name (Google OAuth name)
//   3) auth.users.raw_user_meta_data.name (alternative OAuth field)
//   4) email username portion (e.g. 'ahmedafridi619')
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { liveLessonIdsForLevel } from '@/app/lib/academy-helpers';
import { academyCourses } from '@/app/lib/academy-data';

function getServerClient() {
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

function generateCertCode(levelId: string): string {
  // e.g. ATLAS-L1-A3F8K2X9
  const m = levelId.match(/level-(\d+)/);
  const lvl = m ? `L${m[1]}` : 'LX';
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
  return `ATLAS-${lvl}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const { levelId } = await req.json() as { levelId: string };

    if (!levelId || !academyCourses.find(c => c.id === levelId)) {
      return NextResponse.json({ error: 'Invalid levelId' }, { status: 400 });
    }

    const supabase = getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }
    const userEmail = user.email;

    // Already issued? Return it.
    const { data: existing } = await supabase
      .from('level_certificates')
      .select('cert_code, trader_name, issued_at, level_id')
      .eq('user_email', userEmail)
      .eq('level_id', levelId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ certificate: existing, alreadyIssued: true });
    }

    // Check completion: every live lesson in the level must have a completion row.
    const requiredLessonIds = liveLessonIdsForLevel(levelId);
    if (requiredLessonIds.length === 0) {
      return NextResponse.json({ error: 'Level has no live lessons yet' }, { status: 400 });
    }

    const { data: completions } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_email', userEmail)
      .eq('level_id', levelId);

    const completedSet = new Set((completions || []).map((c: { lesson_id: string }) => c.lesson_id));
    const allDone = requiredLessonIds.every(id => completedSet.has(id));
    if (!allDone) {
      const missing = requiredLessonIds.filter(id => !completedSet.has(id));
      return NextResponse.json(
        { error: 'Level not yet complete', missingCount: missing.length, requiredCount: requiredLessonIds.length },
        { status: 400 }
      );
    }

    // Resolve trader name.
    const { data: profile } = await supabase
      .from('trader_profiles')
      .select('trader_name')
      .eq('user_email', userEmail)
      .maybeSingle();

    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const traderName = (
      (profile?.trader_name as string | undefined) ||
      (typeof meta.full_name === 'string' ? meta.full_name : undefined) ||
      (typeof meta.name === 'string' ? meta.name : undefined) ||
      (userEmail.split('@')[0] || 'Trader')
    ).toString().trim();

    // Issue the cert.
    const certCode = generateCertCode(levelId);
    const { data: inserted, error: insertError } = await supabase
      .from('level_certificates')
      .insert({
        user_email: userEmail,
        level_id: levelId,
        trader_name: traderName,
        cert_code: certCode,
      })
      .select('cert_code, trader_name, issued_at, level_id')
      .single();

    if (insertError) {
      // Race: someone inserted between our maybeSingle() and insert. Re-read.
      const { data: raceWinner } = await supabase
        .from('level_certificates')
        .select('cert_code, trader_name, issued_at, level_id')
        .eq('user_email', userEmail)
        .eq('level_id', levelId)
        .maybeSingle();
      if (raceWinner) {
        return NextResponse.json({ certificate: raceWinner, alreadyIssued: true });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ certificate: inserted, alreadyIssued: false });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
