import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendSignupWelcomeEmail } from '@/app/lib/email';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Send welcome email for first-time sign-ups (Google OAuth or email confirmation)
    if (data?.user) {
      const user = data.user;
      const createdAt = new Date(user.created_at).getTime();
      const now = Date.now();
      // 5-minute window — OAuth redirects can take time
      const isNewUser = (now - createdAt) < 300000;

      // Check if we already sent a welcome email (stored in user metadata)
      const alreadyWelcomed = user.user_metadata?.welcome_email_sent === true;

      if (isNewUser && !alreadyWelcomed && user.email) {
        try {
          await sendSignupWelcomeEmail({
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
          });

          // Mark that we sent the welcome email so we don't send it again on next login
          await supabase.auth.updateUser({
            data: { welcome_email_sent: true },
          });
        } catch (err) {
          console.error('Failed to send signup welcome email:', err);
        }
      }
    }
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
