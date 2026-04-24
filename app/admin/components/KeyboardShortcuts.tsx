'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global admin keyboard shortcuts.
 *
 * Registered shortcuts:
 *   g o     → Overview
 *   g r     → Revenue
 *   g u     → Users
 *   g s     → Subscriptions
 *   g p     → Prop
 *   g a     → Academy
 *   g l     → Audit Log
 *   g t     → Settings (se-T-tings)
 *   /       → Focus search (triggers command palette)
 *   ?       → Show this shortcut help
 *
 * The "g X" sequence is triggered by pressing "g", then within 800ms pressing the second key.
 * This mirrors Gmail / GitHub / Linear shortcut conventions.
 */

const SHORTCUTS = [
  { keys: 'g o', label: 'Go to Overview' },
  { keys: 'g r', label: 'Go to Revenue' },
  { keys: 'g u', label: 'Go to Users' },
  { keys: 'g s', label: 'Go to Subscriptions' },
  { keys: 'g p', label: 'Go to Prop' },
  { keys: 'g a', label: 'Go to Academy' },
  { keys: 'g l', label: 'Go to Audit Log' },
  { keys: 'g t', label: 'Go to Settings' },
  { keys: '/',   label: 'Open search (same as ⌘K)' },
  { keys: '?',   label: 'Show this help menu' },
  { keys: 'Esc', label: 'Close modals or search' },
];

const ROUTE_MAP: Record<string, string> = {
  o: '/admin',
  r: '/admin/revenue',
  u: '/admin/users',
  s: '/admin/subscriptions',
  p: '/admin/prop',
  a: '/admin/academy',
  l: '/admin/audit',
  t: '/admin/settings',
};

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    let gActive = false;
    let gTimer: NodeJS.Timeout | null = null;

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // "?" opens help (Shift+/ on most layouts)
      if (e.key === '?' && !gActive) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // "/" triggers search (emit the same custom event the search button uses)
      if (e.key === '/' && !gActive) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('admin-open-search'));
        return;
      }

      // Escape closes help
      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false);
        return;
      }

      // "g" starts a sequence
      if (e.key === 'g' && !gActive) {
        gActive = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gActive = false;
        }, 800);
        return;
      }

      // Second key of "g X" sequence
      if (gActive) {
        const route = ROUTE_MAP[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          router.push(route);
        }
        gActive = false;
        if (gTimer) clearTimeout(gTimer);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [router, helpOpen]);

  return (
    <AnimatePresence>
      {helpOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHelpOpen(false)}
            className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[75] w-full max-w-md p-4"
          >
            <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Command className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">Keyboard shortcuts</h2>
                </div>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
                {SHORTCUTS.map((s) => (
                  <div key={s.keys} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-gray-400">{s.label}</span>
                    <div className="flex gap-1">
                      {s.keys.split(' ').map((k, i) => (
                        <kbd
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300"
                        >{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
