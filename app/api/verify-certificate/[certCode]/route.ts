// app/api/verify-certificate/[certCode]/route.ts
// ============================================================================
// Public certificate verification. Anyone with the cert_code can verify.
// Uses the service-role key so we can read level_certificates without an
// auth session (verification is meant to be public).
//
// Returns minimal info — trader_name, level_id, issued_at — never the
// owner's email or any other PII.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic — never cache verification responses.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { certCode: string } }
) {
  try {
    const certCode = (params.certCode || '').trim();
    if (!certCode || certCode.length < 6 || certCode.length > 32) {
      return NextResponse.json({ valid: false, error: 'Invalid certificate code' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('level_certificates')
      .select('cert_code, level_id, trader_name, issued_at')
      .eq('cert_code', certCode)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ valid: false, error: 'Verification service unavailable' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        cert_code: data.cert_code,
        level_id: data.level_id,
        trader_name: data.trader_name,
        issued_at: data.issued_at,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}
