import { NextRequest, NextResponse } from 'next/server';
import { notifyUsernameChange } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, oldUsername, newUsername, plan } = body;

    // Log the change
    console.log(`✏️ TV Username Change: ${email} — ${oldUsername} → ${newUsername} (${plan})`);

    // Send email notification
    await notifyUsernameChange({ email, oldUsername, newUsername, plan });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Username change notification error:', error);
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
