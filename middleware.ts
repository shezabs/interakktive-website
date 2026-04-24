// ==========================================================================
// MIDDLEWARE — server-side admin route protection
// ==========================================================================
// Runs BEFORE the admin page or API route is reached. Non-admins are
// redirected at the edge — they never see the admin URL load.
//
// This works because the browser supabase client (app/lib/supabase.ts) now
// uses @supabase/ssr which writes the session to cookies, not localStorage.
// ==========================================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAILS = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

export async function middleware(req: NextRequest) {
  // Only run on /admin/* and /api/admin/* routes
  const path = req.nextUrl.pathname;
  const isAdminPage = path.startsWith('/admin');
  const isAdminApi = path.startsWith('/api/admin');
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  // Build a response we can attach cookies to if needed
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  const isAdmin = email && ADMIN_EMAILS.includes(email);

  // Not signed in
  if (!user?.email) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to signin with a return URL
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('next', path);
    return NextResponse.redirect(signinUrl);
  }

  // Signed in but not an admin
  if (!isAdmin) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Quietly bounce to home — don't confirm /admin exists
    return NextResponse.redirect(new URL('/', req.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
