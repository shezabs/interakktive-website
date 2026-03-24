import { NextRequest, NextResponse } from 'next/server';
import { notifySwap, sendSwapEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tradingviewUsername, oldIndicators, newIndicators, nextSwapDate } = body;

    console.log(`🔄 Swap: ${email} — ${oldIndicators.join(',')} → ${newIndicators.join(',')}`);

    // Admin notification
    await notifySwap({ email, tradingviewUsername, oldIndicators, newIndicators });
    
    // Customer confirmation
    await sendSwapEmail({ email, newIndicators, nextSwapDate: nextSwapDate || '' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Swap notification error:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
