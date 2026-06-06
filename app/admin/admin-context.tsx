'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminFetch } from './lib-client';

// Mirror of Capability type from admin-auth.ts — keep in sync.
// Client-side capability checks are a UX convenience (hide buttons).
// Server-side checks are the real enforcement.
export type Capability =
  | 'user.view' | 'user.edit_tv_username' | 'user.resend_verification' | 'user.ban' | 'user.delete'
  | 'sub.view' | 'sub.edit_notes' | 'sub.mark_tv_invite' | 'sub.reset_swap' | 'sub.grant_comp'
  | 'sub.change_plan' | 'sub.change_indicators' | 'sub.extend_period' | 'sub.cancel_period_end'
  | 'sub.cancel_immediate' | 'sub.reactivate' | 'sub.delete_record' | 'sub.refund' | 'sub.stripe_sync'
  | 'prop.view' | 'prop.delete_account'
  | 'audit.view' | 'audit.export'
  | 'settings.view' | 'settings.change_own_password' | 'settings.change_other_password';

export type AdminRole = 'owner' | 'operator';

const OPERATOR_CAPS = new Set<Capability>([
  'user.view', 'sub.view', 'prop.view', 'audit.view', 'settings.view',
  'audit.export',
  'user.edit_tv_username', 'user.resend_verification',
  'sub.edit_notes', 'sub.mark_tv_invite', 'sub.reset_swap', 'sub.grant_comp',
  'sub.change_indicators', 'sub.extend_period', 'sub.reactivate',
  'settings.change_own_password',
]);

interface AdminUser {
  email: string;
  role: AdminRole;
}

interface AdminContextValue {
  user: AdminUser | null;
  loading: boolean;
  can: (capability: Capability) => boolean;
  isOwner: boolean;
  isOperator: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  user: null,
  loading: true,
  can: () => false,
  isOwner: false,
  isOperator: false,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUser({ email: d.email, role: d.role }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const can = (capability: Capability): boolean => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return OPERATOR_CAPS.has(capability);
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        loading,
        can,
        isOwner: user?.role === 'owner',
        isOperator: user?.role === 'operator',
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

/**
 * Hook for accessing admin context.
 * Example:
 *   const { can, isOperator } = useAdmin();
 *   if (!can('user.delete')) return null;
 */
export function useAdmin(): AdminContextValue {
  return useContext(AdminContext);
}
