// ==========================================================================
// AUTH CALLBACK — exchanges OAuth code for a session and writes cookies
// ==========================================================================
// Critical: this MUST use createServerClient with cookie write hooks,
// otherwise the session cookie is never set on the response and the
// dashboard redirect loops back to /signin.
//
// Symptom of the bug this fixes:
//   Google sign-in → "Welcome Back" briefly → bounced back to /signin
// ==========================================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendSignupWelcomeEmail } from '@/app/lib/email';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Build the redirect response up front so we can attach Set-Cookie headers to it.
  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Write to BOTH the request cookie store (for any downstream reads
            // in this same handler) and the redirect response (so the browser
            // gets the Set-Cookie header).
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // cookieStore is read-only in some contexts — fall through
            }
            redirectResponse.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // no-op
            }
            redirectResponse.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth code exchange failed:', error.message);
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

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

  return redirectResponse;
}
