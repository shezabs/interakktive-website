// Middleware intentionally NOT guarding /admin routes anymore.
//
// Reason: the site's Supabase client stores sessions in localStorage (client-side only),
// not cookies — so middleware can never see the user's session.
//
// Admin auth now happens in two places that DO work:
//  1. Each /admin page's client-side layout guard redirects non-admins.
//  2. Every /api/admin/* route validates the Authorization: Bearer <token> header
//     server-side using the Supabase admin client.
//
// This file exists only so Next.js doesn't complain about a missing middleware
// when other changes reference one. If you want to re-add middleware later,
// ensure the app's client uses @supabase/ssr which writes cookies.

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
