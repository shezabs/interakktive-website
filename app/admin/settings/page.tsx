'use client';
import { adminFetch } from '../lib-client';

import { useEffect, useState } from 'react';
import { Shield, Key, CheckCircle2, AlertTriangle, UserPlus } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

export default function AdminSettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const handlePasswordChange = async () => {
    setPwMessage(null);

    // Client-side validation
    if (newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const res = await adminFetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');

      setPwMessage({ type: 'success', text: 'Password updated. Use your new password next time you sign in.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Your admin account.</p>
      </div>

      {/* Account info */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Your account</h2>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white font-semibold">{userEmail || 'Loading...'}</p>
              <p className="text-xs text-gray-500">Admin access granted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Change password</h2>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Updates only YOUR account password. Minimum 8 characters.
              You'll stay signed in on this device after changing — your next sign-in elsewhere uses the new password.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                autoComplete="new-password"
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordChange(); }}
              />
            </div>
          </div>

          {pwMessage && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              pwMessage.type === 'success'
                ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {pwMessage.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{pwMessage.text}</span>
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={pwLoading || !newPassword || !confirmPassword}
            className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pwLoading ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </section>

      {/* Admin access info */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Admin access</h2>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400 space-y-2">
              <p>
                Admin access is granted to a hardcoded list of emails in the codebase —
                not something that can be added from this UI. This is intentional: it keeps
                the admin set small, auditable, and impossible to grant accidentally via the database.
              </p>
              <p>
                To add a new admin: they sign up on the site with their email, then the admin email
                allowlist in the code is updated and redeployed. The list lives in
                <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-amber-400 font-mono text-xs">app/lib/admin-auth.ts</code>,
                <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-amber-400 font-mono text-xs">middleware.ts</code>,
                and the RLS policy on <code className="px-1.5 py-0.5 mx-1 rounded bg-white/5 text-amber-400 font-mono text-xs">admin_audit_log</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
