'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Users, CreditCard, FileText, Home, Settings, BarChart3, BookOpen, DollarSign, LogOut, Search } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { useAdmin } from '../admin-context';

const TABS = [
  { href: '/admin',               label: 'Overview',      icon: Home,        exact: true  },
  { href: '/admin/revenue',       label: 'Revenue',       icon: DollarSign,  exact: false },
  { href: '/admin/users',         label: 'Users',         icon: Users,       exact: false },
  { href: '/admin/subscriptions', label: 'Subs',          icon: CreditCard,  exact: false },
  { href: '/admin/prop',          label: 'Prop',          icon: BarChart3,   exact: false },
  { href: '/admin/academy',       label: 'Academy',       icon: BookOpen,    exact: false },
  { href: '/admin/audit',         label: 'Audit',         icon: FileText,    exact: false },
  { href: '/admin/settings',      label: 'Settings',      icon: Settings,    exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOwner } = useAdmin();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Trigger command palette via custom event that CommandPalette listens for
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('admin-open-search'));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent hidden sm:inline">
                ADMIN
              </span>
              {user && (
                <span className={`hidden md:inline text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isOwner
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  {user.role}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openSearch}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10 text-gray-500">⌘K</kbd>
            </button>
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors hidden lg:block"
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
