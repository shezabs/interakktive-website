'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Users, CreditCard, FileText, Home, LogOut } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

const TABS = [
  { href: '/admin',               label: 'Overview',      icon: Home,       exact: true  },
  { href: '/admin/users',         label: 'Users',         icon: Users,      exact: false },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, exact: false },
  { href: '/admin/audit',         label: 'Audit Log',     icon: FileText,   exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                ADMIN
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors hidden md:block"
            >
              &larr; Back to site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
