import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
  last_active: string;
  indicators_viewed: string[];
}
