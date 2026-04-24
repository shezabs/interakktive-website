'use client';

// ==========================================================================
// adminFetch — DEPRECATED but kept for backwards compat
// ==========================================================================
// Phase 3A switched admin auth from Bearer tokens to cookie sessions.
// Cookies are sent automatically by the browser on same-origin fetch,
// so adminFetch no longer needs to attach an Authorization header.
//
// This is now a thin wrapper around fetch() with default Content-Type for
// JSON bodies. New code should just use fetch() directly; existing callers
// keep working unchanged.
// ==========================================================================

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  // Ensure cookies are included even across subdomains (same-origin by default, but be explicit)
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
}
