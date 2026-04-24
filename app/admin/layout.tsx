'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import AdminNav from './components/AdminNav';
import CommandPalette from './components/CommandPalette';

// Must match ADMIN_EMAILS in app/lib/admin-auth.ts
const ADMIN_EMAILS = [
  'shezabmediaworxltd@gmail.com',
  'mustafamoinmirza@icloud.com',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'authorised' | 'denied'>('checking');

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;

      if (!user?.email) {
        router.replace(`/signin?next=${encodeURIComponent('/admin')}`);
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setState('denied');
        router.replace('/');
        return;
      }

      setState('authorised');
    };

    check();
    return () => { active = false; };
  }, [router]);

  if (state === 'checking' || state === 'denied') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}
      >
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <AdminNav />
      <CommandPalette />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {children}
      </main>
    </div>
  );
}
