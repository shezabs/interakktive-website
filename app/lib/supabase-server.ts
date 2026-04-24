// ==========================================================================
// SUPABASE SERVER CLIENT — for route handlers and server components
// ==========================================================================
// Reads session from cookies. Use this in:
//   - app/api/**/route.ts           (route handlers)
//   - app/**/page.tsx (without 'use client')  (server components)
//
// Do NOT import this from a client component — it calls next/headers cookies()
// which is only available on the server.
// ==========================================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Returns a Supabase client tied to the current request's cookies.
 * Safe to call from any server context (route handlers, server components).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // In Next.js 14 route handlers, cookies() is read-only by default.
          // We swallow the error — route handlers don't need to set cookies
          // for our use case (we only read the session for authorisation).
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // no-op: cookies() returns a read-only store in some server contexts
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // no-op
          }
        },
      },
    }
  );
}
