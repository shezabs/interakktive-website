import { NextRequest, NextResponse } from 'next/server';
import { notifySwap } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tradingviewUsername, oldIndicators, newIndicators } = body;

    console.log(`🔄 Swap: ${email} — ${oldIndicators.join(',')} → ${newIndicators.join(',')}`);

    await notifySwap({ email, tradingviewUsername, oldIndicators, newIndicators });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Swap notification error:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
