// ==========================================================================
// SUPABASE CLIENT — browser-side, cookie-based via @supabase/ssr
// ==========================================================================
// This replaces the localStorage-only createClient with createBrowserClient,
// which writes the session to cookies. Middleware can then read the session
// server-side, enabling proper route protection.
//
// Backwards compatible: all existing code that imports `supabase` from this
// file keeps working unchanged. The API surface is identical — only the
// session storage changes from localStorage to cookies.
//
// If you need a server-side client (route handlers, server components),
// import from './supabase-server' instead — NOT this file.
// ==========================================================================

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client — reused across the app.
// Safe to import from any 'use client' component.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types (unchanged from before)
export interface User {
  id: string;
  email: string;
  created_at: string;
  tradingview_username?: string;
}

export interface ProAccessRequest {
  id: string;
  user_id: string;
  user_email: string;
  tradingview_username: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  page_views: number;
}
