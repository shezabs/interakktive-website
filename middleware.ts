import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

// Admin allowlist — adding a new admin means editing this constant and redeploying.
// Intentional: keeps the admin set small and auditable, no sneaky DB writes to grant access.
const ADMIN_EMAILS = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

export async function middleware(req: NextRequest) {
  // Only run on /admin/* routes. API routes enforce admin separately via requireAdmin().
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Not signed in → bounce to signin with a return URL
  if (!session?.user?.email) {
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Signed in but not an admin → bounce to home. No error message on purpose —
  // we don't want to leak the existence of admin routes to regular users.
  if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
