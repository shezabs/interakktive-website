import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/admin-auth';
import { notifyAffiliateApplication } from '@/app/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allowed enum values — must match what the form sends and what the DB CHECK constraints / display expect.
const AUDIENCE_SIZES = ['under_500', '500_5k', '5k_50k', '50k_500k', '500k_plus'];
const NICHES = ['forex', 'crypto', 'indices', 'commodities', 'mixed', 'educational', 'other'];

interface ApplyBody {
  fullName?: string;
  email?: string;
  tvUsername?: string;
  promotionUrls?: string;
  audienceSize?: string;
  niche?: string;
  pitch?: string;
  hp?: string;      // honeypot — should always be empty
  agreed?: boolean; // user ticked "I confirm I'm an active paying customer..."
}

export async function POST(req: NextRequest) {
  let body: ApplyBody;
  try {
    body = (await req.json()) as ApplyBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Honeypot — silently 200 OK if filled (bots think they succeeded) ──
  if (body.hp && body.hp.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // ── Field validation ──
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const tvUsername = body.tvUsername ? String(body.tvUsername).trim() : null;
  const promotionUrls = String(body.promotionUrls || '').trim();
  const audienceSize = String(body.audienceSize || '').trim();
  const niche = String(body.niche || '').trim();
  const pitch = String(body.pitch || '').trim();
  const agreed = Boolean(body.agreed);

  if (!fullName || fullName.length < 2 || fullName.length > 120) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!promotionUrls || promotionUrls.length < 5) {
    return NextResponse.json({ error: 'Please tell us where you would promote.' }, { status: 400 });
  }
  if (!AUDIENCE_SIZES.includes(audienceSize)) {
    return NextResponse.json({ error: 'Please pick an audience size.' }, { status: 400 });
  }
  if (!NICHES.includes(niche)) {
    return NextResponse.json({ error: 'Please pick a niche.' }, { status: 400 });
  }
  if (!pitch || pitch.length < 100 || pitch.length > 600) {
    return NextResponse.json({ error: 'Your pitch should be 100–600 characters.' }, { status: 400 });
  }
  if (!agreed) {
    return NextResponse.json({ error: 'Please confirm the eligibility statement.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ── Verify applicant is an active paying customer ──
  // We treat "active" + "cancelling" both as eligible — a cancelling customer
  // is still inside their paid period until current_period_end. "past_due" is NOT
  // eligible (their card has failed).
  const { data: subs, error: subErr } = await supabase
    .from('subscriptions')
    .select('plan, status, user_id, tradingview_username')
    .eq('user_email', email);

  if (subErr) {
    console.error('affiliate-apply: subscription lookup failed', subErr);
    return NextResponse.json({ error: 'Something went wrong. Please try again or email support@interakktive.com.' }, { status: 500 });
  }

  const eligibleSub = (subs || []).find(
    (s) => s.status === 'active' || s.status === 'cancelling'
  );

  if (!eligibleSub) {
    return NextResponse.json({
      error: 'We could not find an active Interakktive subscription for this email. The affiliate program is open to active paying customers only.',
      code: 'NOT_CUSTOMER',
    }, { status: 403 });
  }

  // ── Anti-spam: one pending application per email at a time ──
  const { data: existingPending } = await supabase
    .from('affiliate_applications')
    .select('id, status')
    .eq('email', email)
    .in('status', ['pending'])
    .limit(1);

  if (existingPending && existingPending.length > 0) {
    return NextResponse.json({
      error: 'We already have a pending application from this email. We will get back to you within 48 hours.',
      code: 'DUPLICATE',
    }, { status: 409 });
  }

  // ── Insert application ──
  const { data: inserted, error: insertErr } = await supabase
    .from('affiliate_applications')
    .insert({
      user_id: eligibleSub.user_id || null,
      email,
      full_name: fullName,
      tv_username: tvUsername || eligibleSub.tradingview_username || null,
      promotion_urls: promotionUrls,
      audience_size: audienceSize,
      niche,
      pitch,
      status: 'pending',
      customer_plan: eligibleSub.plan,
      customer_status: eligibleSub.status,
    })
    .select('id')
    .single();

  if (insertErr || !inserted) {
    console.error('affiliate-apply: insert failed', insertErr);
    return NextResponse.json({ error: 'Could not save your application. Please try again.' }, { status: 500 });
  }

  // ── Send emails (admin + applicant) ──
  try {
    await notifyAffiliateApplication({
      email,
      fullName,
      tvUsername: tvUsername || eligibleSub.tradingview_username || null,
      promotionUrls,
      audienceSize,
      niche,
      pitch,
      customerPlan: eligibleSub.plan,
      customerStatus: eligibleSub.status,
      applicationId: inserted.id,
    });
  } catch (emailErr) {
    // Email failure is non-fatal — application is in DB, we just log
    console.error('affiliate-apply: email send failed (non-fatal)', emailErr);
  }

  return NextResponse.json({ ok: true, applicationId: inserted.id });
}
