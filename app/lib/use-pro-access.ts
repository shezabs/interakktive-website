// app/lib/use-pro-access.ts
// ============================================================================
// usePro Access — single source of truth for "is the current user a paying
// subscriber?" Used by Academy index + lesson gate. Any active/cancelling
// subscription on any tier (Starter/Advantage/Elite) counts as paying.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type ProAccessState = 'loading' | 'paying' | 'not-paying';

export function useProAccess(): { state: ProAccessState; email: string | null } {
  const [state, setState] = useState<ProAccessState>('loading');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user?.email) {
          setEmail(null);
          setState('not-paying');
          return;
        }

        setEmail(user.email);

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

  return { state, email };
}
