'use client';

import { supabase } from '@/app/lib/supabase';

/**
 * Wraps fetch() to automatically attach the current user's access token
 * to every admin API call. Use this instead of fetch() for any /api/admin/* call.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
