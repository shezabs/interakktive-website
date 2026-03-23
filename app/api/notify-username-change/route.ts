import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, oldUsername, newUsername, plan } = body;

    // Log the change (always visible in Vercel Function Logs)
    console.log('=== TV USERNAME CHANGE ===');
    console.log(`User Email: ${email}`);
    console.log(`Old Username: ${oldUsername}`);
    console.log(`New Username: ${newUsername}`);
    console.log(`Plan: ${plan}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('ACTION REQUIRED: Update TradingView access — revoke old, grant new.');
    console.log('==========================');

    // TODO: Send email notification when email service is configured
    // For now, this is logged to Vercel Function Logs
    // Go to Vercel → your project → Logs → filter "TV USERNAME CHANGE"

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Username change notification error:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
