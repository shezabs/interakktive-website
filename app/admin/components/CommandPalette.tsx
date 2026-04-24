'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, CreditCard, BarChart3, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminFetch } from '../lib-client';

interface SearchResult {
  type: 'user' | 'subscription' | 'prop_account' | 'audit';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  matchField: string;
}

const TYPE_ICONS = {
  user: User,
  subscription: CreditCard,
  prop_account: BarChart3,
  audit: FileText,
};

const TYPE_LABELS = {
  user: 'User',
  subscription: 'Subscription',
  prop_account: 'Prop account',
  audit: 'Audit entry',
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Global hotkey — Cmd+K / Ctrl+K, plus a custom event so nav button can open it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('admin-open-search', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('admin-open-search', openHandler);
    };
  }, [open]);

  // Focus input when opening + reset state
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await adminFetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!data.error) {
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const navigate = useCallback((result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  }, [router]);

  // Arrow-key navigation in results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[70] w-full max-w-xl px-4"
          >
            <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search users, subscriptions, prop accounts..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                <kbd className="text-[10px] text-gray-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {query.length < 2 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Searches: emails, TV usernames, sub IDs, Stripe IDs, prop account names, admin actions
                    </p>
                  </div>
                ) : results.length === 0 && !loading ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No matches for "{query}"
                  </div>
                ) : (
                  <div className="py-1">
                    {results.map((r, i) => {
                      const Icon = TYPE_ICONS[r.type];
                      const selected = i === selectedIndex;
                      return (
                        <button
                          key={`${r.type}-${r.id}`}
                          onClick={() => navigate(r)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected ? 'bg-amber-500/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            selected ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${selected ? 'text-white' : 'text-gray-300'}`}>
                              {r.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                          </div>
                          <span className="shrink-0 text-[10px] uppercase tracking-wider text-gray-600">
                            {TYPE_LABELS[r.type]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/5 text-[10px] text-gray-500">
                <div className="flex gap-3">
                  <span><kbd className="bg-white/5 border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
                  <span><kbd className="bg-white/5 border border-white/10 rounded px-1">↵</kbd> open</span>
                </div>
                <span>
                  <kbd className="bg-white/5 border border-white/10 rounded px-1">⌘K</kbd> to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
