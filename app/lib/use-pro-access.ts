// app/lib/use-pro-access.ts
// ============================================================================
// usePro Access — single source of truth for "is the current user a paying
// subscriber?" Used by Academy index + lesson gate. Any active/cancelling
// subscription on any tier (Starter/Advantage/Elite) counts as paying.
//
// Admin allowlist (see admin-emails.ts) bypasses the subscription check so
// founders/operators can review the full Academy without buying a plan.
// Admins also get isAdmin: true so the UI can show an "Admin Access" badge.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { isAdminEmail } from './admin-emails';

export type ProAccessState = 'loading' | 'paying' | 'not-paying';

export function useProAccess(): { state: ProAccessState; email: string | null; isAdmin: boolean } {
  const [state, setState] = useState<ProAccessState>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user?.email) {
          setEmail(null);
          setIsAdmin(false);
          setState('not-paying');
          return;
        }

        setEmail(user.email);

        // Admin bypass — full Academy access without a subscription.
        if (isAdminEmail(user.email)) {
          setIsAdmin(true);
          setState('paying');
          return;
        }
        setIsAdmin(false);

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_email', user.email)
          .in('status', ['active', 'cancelling'])
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        setState(sub ? 'paying' : 'not-paying');
      } catch {
        if (cancelled) return;
        setState('not-paying');
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  return { state, email, isAdmin };
}
