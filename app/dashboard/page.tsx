'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowRight, User, Crown, LogOut, Crosshair, Eye, Activity, Radio,
  ExternalLink, BookOpen, RefreshCw, Check, AlertCircle, Loader2, ArrowLeftRight, Pencil,
  Award, Download,
} from 'lucide-react';
import { FadeIn, FadeInView, SectionWrapper } from '@/app/components/animations';
import { academyCourses } from '@/app/lib/academy-data';
import { isAdminEmail } from '@/app/lib/admin-emails';

const INDICATORS = [
  { id: 'CIPHER PRO', icon: Crosshair, role: 'Signal Intelligence', color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10', tvUrl: 'https://www.tradingview.com/script/vvf2W2ZG/', docUrl: '/learn/atlas-pro/atlas-cipher-pro' },
  { id: 'PHANTOM PRO', icon: Eye, role: 'Structure Intelligence', color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10', tvUrl: 'https://www.tradingview.com/script/fMZJJ8FQ/', docUrl: '/learn/atlas-pro/atlas-phantom-pro' },
  { id: 'PULSE PRO', icon: Activity, role: 'Momentum Intelligence', color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10', tvUrl: 'https://www.tradingview.com/script/nHfT0sXk/', docUrl: '/learn/atlas-pro/atlas-pulse-pro' },
  { id: 'RADAR PRO', icon: Radio, role: 'Screening Intelligence', color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10', tvUrl: 'https://www.tradingview.com/script/V6tg80MI-Atlas-Radar-Pro-Interakktive/', docUrl: '/learn/atlas-pro/atlas-radar-pro' },
  { id: 'OPTIONS PRO', icon: Activity, role: 'Options Intelligence', color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10', tvUrl: 'https://www.tradingview.com/script/9D3jLsLj-Atlas-Options-Pro-Interakktive/', docUrl: '/learn/atlas-pro/atlas-options-pro' },
];

// Core 4 indicators selectable by Starter and Advantage plans.
// OPTIONS PRO is excluded — it's Elite-only.
const CORE_INDICATORS = INDICATORS.filter(i => i.id !== 'OPTIONS PRO');

interface Subscription {
  id: string;
  plan: 'starter' | 'advantage' | 'elite';
  billing: 'monthly' | 'annual';
  indicators: string[];
  status: string;
  swap_used: boolean;
  swap_reset_date: string | null;
  current_period_end: string | null;
  tradingview_username: string;
}

const PLAN_NAMES: Record<string, string> = { starter: 'Starter', advantage: 'Advantage', elite: 'Elite' };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Swap state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapSelections, setSwapSelections] = useState<string[]>([]);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelReasonText, setCancelReasonText] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // TV username edit state
  const [editingTvUsername, setEditingTvUsername] = useState(false);
  const [newTvUsername, setNewTvUsername] = useState('');
  const [savingTvUsername, setSavingTvUsername] = useState(false);
  const [tvUsernameError, setTvUsernameError] = useState('');
  const [tvUsernameSuccess, setTvUsernameSuccess] = useState(false);

  // Upgrade state
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // TV username prompt state (for users without one)
  const [promptTvUsername, setPromptTvUsername] = useState('');
  const [savingPromptTv, setSavingPromptTv] = useState(false);
  const [promptTvError, setPromptTvError] = useState('');
  const [promptTvSuccess, setPromptTvSuccess] = useState(false);

  // Social profiles state
  const [editingSocials, setEditingSocials] = useState(false);
  const [socialX, setSocialX] = useState('');
  const [socialInsta, setSocialInsta] = useState('');
  const [socialDiscord, setSocialDiscord] = useState('');
  const [savingSocials, setSavingSocials] = useState(false);
  const [socialsSuccess, setSocialsSuccess] = useState(false);

  // Trader name (used on certificates) — overrides the OAuth name if set.
  const [traderName, setTraderName] = useState<string | null>(null);
  const [editingTraderName, setEditingTraderName] = useState(false);
  const [newTraderName, setNewTraderName] = useState('');
  const [savingTraderName, setSavingTraderName] = useState(false);
  const [traderNameSuccess, setTraderNameSuccess] = useState(false);

  // Public profile state (handle + visibility toggle).
  const [publicHandle, setPublicHandle] = useState<string | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [editingHandle, setEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [savingHandle, setSavingHandle] = useState(false);
  const [handleError, setHandleError] = useState('');
  const [handleSuccess, setHandleSuccess] = useState(false);
  const [savingPublicToggle, setSavingPublicToggle] = useState(false);

  // Earned certificates (level_id → cert_code)
  const [earnedCerts, setEarnedCerts] = useState<Array<{ level_id: string; cert_code: string; issued_at: string }>>([]);

  // Admin-only Academy progress reset
  const [adminResetConfirm, setAdminResetConfirm] = useState(false);
  const [adminResetting, setAdminResetting] = useState(false);
  const [adminResetMessage, setAdminResetMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !currentUser) { router.push('/signin'); return; }
        setUser(currentUser);

        // Fetch active/cancelling subscription — try by user_id first, then by email
        let subData = null;
        
        const { data: byUserId } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .in('status', ['active', 'cancelling'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (byUserId) {
          subData = byUserId;
        } else if (currentUser.email) {
          const { data: byEmail } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_email', currentUser.email)
            .in('status', ['active', 'cancelling'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (byEmail) {
            subData = byEmail;
            await supabase
              .from('subscriptions')
              .update({ user_id: currentUser.id })
              .eq('id', byEmail.id);
          }
        }

        if (subData) setSubscription(subData);

        // Load trader profile (name override for certificates) + earned certificates
        try {
          const [profileRes, certsRes] = await Promise.all([
            supabase
              .from('trader_profiles')
              .select('trader_name, public_handle, is_public')
              .eq('user_email', currentUser.email)
              .maybeSingle(),
            supabase
              .from('level_certificates')
              .select('level_id, cert_code, issued_at')
              .eq('user_email', currentUser.email)
              .order('issued_at', { ascending: false }),
          ]);
          if (profileRes.data?.trader_name) setTraderName(profileRes.data.trader_name);
          if (profileRes.data?.public_handle) setPublicHandle(profileRes.data.public_handle);
          if (profileRes.data?.is_public) setIsPublicProfile(true);
          setEarnedCerts(certsRes.data || []);
        } catch {
          // Non-blocking — dashboard renders without certs section if anything fails.
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    if (!cancelReason) {
      setCancelError('Please choose a reason so we can improve.');
      return;
    }
    setCancelling(true);
    setCancelError('');
    try {
      // Step 1: record the reason FIRST (non-blocking — if it fails, cancel still proceeds)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          await fetch('/api/cancel-with-reason', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              subscriptionId: subscription.id,
              reasonCode: cancelReason,
              reasonText: cancelReasonText || null,
            }),
          });
        }
      } catch (reasonErr) {
        // Intentionally swallow — cancellation should still proceed
        console.warn('Failed to record churn reason:', reasonErr);
      }

      // Step 2: actually cancel
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id, action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) { setCancelError(data.error || 'Failed to cancel.'); return; }
      
      // Re-fetch from Supabase to verify the update persisted
      const { data: refreshed } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscription.id)
        .single();
      
      if (refreshed) {
        setSubscription(refreshed);
        if (refreshed.status === 'active') {
          setCancelError('Cancellation may not have saved properly. Please try again or contact support.');
        }
      } else {
        setSubscription(prev => prev ? { ...prev, status: data.status || 'cancelling' } : null);
      }
      setShowCancelConfirm(false);
      setCancelReason('');
      setCancelReasonText('');
    } catch (err) {
      setCancelError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id, action: 'reactivate' }),
      });
      const data = await res.json();
      if (!res.ok) { setCancelError(data.error || 'Failed to reactivate.'); return; }
      
      // Re-fetch from Supabase to verify
      const { data: refreshed } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscription.id)
        .single();
      
      if (refreshed) {
        setSubscription(refreshed);
      } else {
        setSubscription(prev => prev ? { ...prev, status: 'active' } : null);
      }
    } catch (err) {
      setCancelError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSaveTvUsername = async () => {
    if (!newTvUsername.trim()) {
      setTvUsernameError('Please enter a valid TradingView username.');
      return;
    }
    const currentTv = subscription?.tradingview_username || user?.user_metadata?.tradingview_username || '';
    if (newTvUsername.trim() === currentTv) {
      setEditingTvUsername(false);
      return;
    }
    setSavingTvUsername(true);
    setTvUsernameError('');
    setTvUsernameSuccess(false);
    try {
      // Always save to auth metadata
      await supabase.auth.updateUser({
        data: { tradingview_username: newTvUsername.trim() },
      });

      // If they have a subscription, update that too
      if (subscription) {
        const { error: updateErr } = await supabase
          .from('subscriptions')
          .update({
            tradingview_username: newTvUsername.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
        if (updateErr) throw updateErr;

        // Notify admin via API
        await fetch('/api/notify-username-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user!.email,
            oldUsername: subscription.tradingview_username,
            newUsername: newTvUsername.trim(),
            plan: subscription.plan,
          }),
        });

        setSubscription(prev => prev ? { ...prev, tradingview_username: newTvUsername.trim() } : null);
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, tradingview_username: newTvUsername.trim() } } : null);
      setTvUsernameSuccess(true);
      setEditingTvUsername(false);
      setTimeout(() => setTvUsernameSuccess(false), 5000);
    } catch (err: any) {
      setTvUsernameError(err.message || 'Failed to update username.');
    } finally {
      setSavingTvUsername(false);
    }
  };

  // Save the trader name override (used on certificate displays).
  const handleSaveTraderName = async () => {
    const trimmed = newTraderName.trim();
    if (!trimmed || !user?.email) return;
    setSavingTraderName(true);
    try {
      await supabase.from('trader_profiles').upsert(
        { user_email: user.email, trader_name: trimmed, updated_at: new Date().toISOString() },
        { onConflict: 'user_email' }
      );
      setTraderName(trimmed);
      setEditingTraderName(false);
      setTraderNameSuccess(true);
      setTimeout(() => setTraderNameSuccess(false), 4000);
    } catch (err) {
      // Soft fail — user can retry.
    } finally {
      setSavingTraderName(false);
    }
  };

  // Save the public handle (used for /trader/<handle>).
  const handleSaveHandle = async () => {
    setHandleError('');
    const trimmed = newHandle.trim().toLowerCase();
    if (!user?.email) return;
    if (!/^[a-z0-9_-]{2,32}$/.test(trimmed)) {
      setHandleError('Handle must be 2-32 chars: lowercase letters, numbers, dashes, underscores.');
      return;
    }
    setSavingHandle(true);
    try {
      // Check uniqueness first (case-insensitive).
      const { data: existing } = await supabase
        .from('trader_profiles')
        .select('user_email')
        .ilike('public_handle', trimmed)
        .neq('user_email', user.email)
        .maybeSingle();
      if (existing) {
        setHandleError('That handle is taken. Try a different one.');
        setSavingHandle(false);
        return;
      }
      await supabase.from('trader_profiles').upsert(
        { user_email: user.email, public_handle: trimmed, updated_at: new Date().toISOString() },
        { onConflict: 'user_email' }
      );
      setPublicHandle(trimmed);
      setEditingHandle(false);
      setHandleSuccess(true);
      setTimeout(() => setHandleSuccess(false), 4000);
    } catch (err) {
      setHandleError('Could not save handle. Try again.');
    } finally {
      setSavingHandle(false);
    }
  };

  // Toggle public profile visibility.
  const handleTogglePublicProfile = async (next: boolean) => {
    if (!user?.email) return;
    // Can't go public without a handle.
    if (next && !publicHandle) {
      setHandleError('Set a public handle first to enable your public profile.');
      return;
    }
    setSavingPublicToggle(true);
    try {
      await supabase.from('trader_profiles').upsert(
        { user_email: user.email, is_public: next, updated_at: new Date().toISOString() },
        { onConflict: 'user_email' }
      );
      setIsPublicProfile(next);
    } catch (err) {
      // Soft fail.
    } finally {
      setSavingPublicToggle(false);
    }
  };

  // Admin-only: reset the calling user's Academy progress (completions + certs).
  // Server-side validates admin allowlist. trader_profiles is left intact.
  const handleAdminResetAcademy = async () => {
    setAdminResetting(true);
    setAdminResetMessage(null);
    try {
      const res = await fetch('/api/admin-reset-academy', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setAdminResetMessage({ kind: 'err', text: data.error || 'Reset failed.' });
      } else {
        setEarnedCerts([]);
        setAdminResetMessage({ kind: 'ok', text: 'Academy progress reset. Refresh to see changes.' });
        setAdminResetConfirm(false);
      }
    } catch (err) {
      setAdminResetMessage({ kind: 'err', text: 'Network error.' });
    } finally {
      setAdminResetting(false);
    }
  };

  // Auto-reset swap if past swap_reset_date
  // Swap resets monthly — if current date > swap_reset_date, swap becomes available
  useEffect(() => {
    if (!subscription || subscription.plan !== 'advantage' || !subscription.swap_used) return;
    if (!subscription.swap_reset_date) return;
    
    const resetDate = new Date(subscription.swap_reset_date);
    const now = new Date();
    
    if (now >= resetDate) {
      // Swap period has reset — update Supabase and local state
      const nextResetDate = new Date(now);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      
      supabase
        .from('subscriptions')
        .update({
          swap_used: false,
          swap_reset_date: nextResetDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)
        .then(() => {
          setSubscription(prev => prev ? { 
            ...prev, 
            swap_used: false, 
            swap_reset_date: nextResetDate.toISOString() 
          } : null);
        });
    }
  }, [subscription]);

  const canSwap = subscription?.plan === 'advantage' && !subscription?.swap_used;

  // Upgrade state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<'advantage' | 'elite'>('elite');
  const [upgradeSelections, setUpgradeSelections] = useState<string[]>([]);
  const [upgradeBilling, setUpgradeBilling] = useState<'monthly' | 'annual'>('monthly');
  const [isBillingSwitch, setIsBillingSwitch] = useState(false); // Same plan, different billing

  const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
    starter: { monthly: 50, annual: 500 },
    advantage: { monthly: 75, annual: 750 },
    elite: { monthly: 100, annual: 1000 },
  };

  const openUpgradeModal = () => {
    if (!subscription) return;
    
    if (subscription.plan === 'elite' && subscription.billing === 'monthly') {
      // Elite Monthly — only option is billing switch to Annual
      setUpgradeTarget('elite');
      setIsBillingSwitch(true);
      setUpgradeBilling('annual');
      setUpgradeSelections(['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO']);
    } else if (subscription.plan === 'advantage') {
      // Advantage — can switch billing or upgrade to Elite
      setUpgradeTarget('elite');
      setIsBillingSwitch(false);
      setUpgradeBilling(subscription.billing);
      setUpgradeSelections(['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO']);
    } else {
      // Starter — can go to Advantage or Elite
      const target = 'advantage';
      setUpgradeTarget(target);
      setIsBillingSwitch(false);
      setUpgradeBilling(subscription.billing === 'monthly' ? 'annual' : 'monthly');
      setUpgradeSelections([]);
    }
    setUpgradeError('');
    setUpgradeSuccess(false);
    setShowUpgradeModal(true);
  };

  const toggleUpgradeSelection = (id: string) => {
    if (upgradeTarget === 'elite') return;
    setUpgradeSelections(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id]; // Replace the oldest selection
      return [...prev, id];
    });
  };

  const handleUpgrade = async () => {
    if (!subscription) return;
    // Pool of all 5 indicators (Elite gets all). Core 4 are for Starter/Advantage.
    const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];

    // For billing switch (same plan): keep current indicators
    const effectiveTarget = isBillingSwitch ? subscription.plan as 'advantage' | 'elite' : upgradeTarget;
    const newIndicators = effectiveTarget === 'elite' ? allIndicators :
      isBillingSwitch ? subscription.indicators : upgradeSelections;

    if (effectiveTarget === 'advantage' && newIndicators.length !== 2) {
      setUpgradeError('Please select your 2nd indicator.');
      return;
    }

    setUpgrading(true);
    setUpgradeError('');
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          targetPlan: effectiveTarget,
          indicators: newIndicators,
          billing: upgradeBilling,
          isBillingSwitch,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setUpgradeError(data.error || 'Upgrade failed.'); setUpgrading(false); return; }
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      }
    } catch (err) {
      setUpgradeError('Network error. Please try again.');
      setUpgrading(false);
    }
  };

  const openSwapModal = () => {
    setSwapSelections([...subscription!.indicators]);
    setSwapError('');
    setSwapSuccess(false);
    setShowSwapModal(true);
  };

  const toggleSwapSelection = (id: string) => {
    setSwapSelections(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        // Replace first
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleSwap = async () => {
    if (swapSelections.length !== 2) { setSwapError('Select exactly 2 indicators.'); return; }

    // Check if anything actually changed
    const same = subscription!.indicators.length === swapSelections.length &&
      subscription!.indicators.every(i => swapSelections.includes(i));
    if (same) { setSwapError('Your selection is the same as your current indicators.'); return; }

    setSwapping(true);
    setSwapError('');

    try {
      // Log the swap
      const { error: histError } = await supabase.from('swap_history').insert({
        subscription_id: subscription!.id,
        user_id: user!.id,
        old_indicators: subscription!.indicators,
        new_indicators: swapSelections,
      });
      if (histError) throw histError;

      // Update subscription
      const nextSwapReset = new Date();
      nextSwapReset.setMonth(nextSwapReset.getMonth() + 1);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          indicators: swapSelections,
          swap_used: true,
          swap_reset_date: nextSwapReset.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription!.id);
      if (updateError) throw updateError;

      setSubscription(prev => prev ? { ...prev, indicators: swapSelections, swap_used: true, swap_reset_date: nextSwapReset.toISOString() } : null);
      setSwapSuccess(true);

      // Send swap notification email
      fetch('/api/notify-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user!.email,
          tradingviewUsername: subscription!.tradingview_username,
          oldIndicators: subscription!.indicators,
          newIndicators: swapSelections,
          nextSwapDate: nextSwapReset.toISOString(),
        }),
      }).catch(() => {}); // Don't block on notification failure
    } catch (err: any) {
      setSwapError(err.message || 'Swap failed. Please try again.');
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  // Check if user has a TV username — from subscription or from auth metadata
  const hasTvUsername = subscription?.tradingview_username || user?.user_metadata?.tradingview_username;

  const handleSavePromptTvUsername = async () => {
    if (!promptTvUsername.trim()) {
      setPromptTvError('Please enter your TradingView username.');
      return;
    }
    setSavingPromptTv(true);
    setPromptTvError('');
    try {
      // Save to auth metadata so it persists even without a subscription
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { tradingview_username: promptTvUsername.trim() },
      });
      if (metaErr) throw metaErr;

      // If they have a subscription, update that too
      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({
            tradingview_username: promptTvUsername.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
        setSubscription(prev => prev ? { ...prev, tradingview_username: promptTvUsername.trim() } : null);
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, tradingview_username: promptTvUsername.trim() } } : null);
      setPromptTvSuccess(true);
    } catch (err: any) {
      setPromptTvError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSavingPromptTv(false);
    }
  };

  const hasSubscription = !!subscription;
  const userIndicators = subscription?.indicators || [];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">
              {hasSubscription
                ? `${PLAN_NAMES[subscription.plan]} plan · ${subscription.billing === 'annual' ? 'Annual' : 'Monthly'} billing`
                : 'Welcome to Interakktive'
              }
            </p>
          </div>
        </div>

        {/* TradingView Username Prompt — shown when user has no TV username */}
        {!hasTvUsername && !promptTvSuccess && (
          <FadeIn>
            <div className="mb-8 glass p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Add your TradingView username</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    We need your TradingView username to grant access to your ATLAS PRO indicators. You can find it in your TradingView profile settings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={promptTvUsername}
                        onChange={(e) => setPromptTvUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm"
                        placeholder="Your TradingView username"
                      />
                    </div>
                    <button
                      onClick={handleSavePromptTvUsername}
                      disabled={savingPromptTv}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingPromptTv ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {savingPromptTv ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {promptTvError && (
                    <p className="text-xs text-red-400 mt-2">{promptTvError}</p>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* TV Username saved confirmation */}
        {promptTvSuccess && (
          <FadeIn>
            <div className="mb-8 glass p-4 rounded-xl border border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-400">TradingView username saved — <span className="font-semibold text-white">{promptTvUsername}</span></p>
              </div>
            </div>
          </FadeIn>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── No Subscription ── */}
            {!hasSubscription && (
              <FadeIn>
                <div className="glass p-8 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-accent-400" />
                    <h2 className="text-2xl font-bold">ATLAS PRO Suite</h2>
                  </div>
                  <p className="text-gray-300 mb-6">
                    You don't have an active subscription yet. Subscribe to get access to
                    our premium trading intelligence indicators on TradingView.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/pricing"
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold flex items-center gap-2"
                    >
                      View Pricing
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/atlas-pro"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all font-semibold"
                    >
                      Explore the Suite
                    </Link>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* ── Active Subscription ── */}
            {hasSubscription && (
              <FadeIn>
                <div className="glass p-8 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-accent-400" />
                      <h2 className="text-2xl font-bold">Your Indicators</h2>
                    </div>
                    {canSwap && (
                      <button
                        onClick={openSwapModal}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-400/10 border border-accent-400/30 text-accent-400 rounded-lg hover:bg-accent-400/20 transition-all text-sm font-medium"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        Swap Indicator
                      </button>
                    )}
                    {subscription.plan === 'advantage' && subscription.swap_used && (
                      <span className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-full">
                        Next swap: {subscription.swap_reset_date ? new Date(subscription.swap_reset_date).toLocaleDateString() : 'Next month'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userIndicators.map((indName) => {
                      const ind = INDICATORS.find(i => i.id === indName);
                      if (!ind) return null;
                      const Icon = ind.icon;
                      return (
                        <div
                          key={ind.id}
                          className={`p-5 rounded-xl border-2 ${ind.borderColor} ${ind.bgColor}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className={`w-7 h-7 ${ind.color}`} />
                            <div>
                              <p className="font-semibold text-white">{ind.id}</p>
                              <p className="text-xs text-gray-400">{ind.role}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <a
                              href={ind.tvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              TradingView
                            </a>
                            <Link
                              href={ind.docUrl}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                              <BookOpen className="w-3 h-3" />
                              Documentation
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(subscription.plan !== 'elite' || (subscription.plan === 'elite' && subscription.billing === 'monthly')) && subscription.status === 'active' && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">
                        {subscription.plan === 'elite' ? 'Save with annual billing' : 'Want access to more indicators?'}
                      </p>
                      <button
                        onClick={openUpgradeModal}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        {subscription.plan === 'elite' ? 'Switch to Annual' : 'Upgrade your plan'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Free Indicators */}
            <FadeIn delay={0.1}>
              <div className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-3">Free Indicators</h2>
                <p className="text-gray-300 mb-4">
                  Access all 9 free diagnostic indicators on TradingView — no subscription needed.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/indicators"
                    className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
                  >
                    View All Free Indicators
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/learn/free-indicators"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    Free Indicator Docs
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold">Account</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                {(subscription?.tradingview_username || user?.user_metadata?.tradingview_username) && (
                  <div>
                    <p className="text-gray-500">TradingView</p>
                    {!editingTvUsername ? (
                      <div className="flex items-center gap-2">
                        <p className="text-white">{subscription?.tradingview_username || user?.user_metadata?.tradingview_username}</p>
                        <button
                          onClick={() => { setNewTvUsername(subscription?.tradingview_username || user?.user_metadata?.tradingview_username || ''); setEditingTvUsername(true); setTvUsernameError(''); }}
                          className="text-gray-500 hover:text-primary-400 transition-colors"
                          title="Edit TradingView username"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-1">
                        <input
                          type="text"
                          value={newTvUsername}
                          onChange={(e) => setNewTvUsername(e.target.value)}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm"
                          placeholder="New TradingView username"
                        />
                        {tvUsernameError && <p className="text-xs text-red-400">{tvUsernameError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveTvUsername}
                            disabled={savingTvUsername}
                            className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded text-xs font-medium hover:bg-primary-500/30 transition-all disabled:opacity-50"
                          >
                            {savingTvUsername ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => { setEditingTvUsername(false); setTvUsernameError(''); }}
                            className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {tvUsernameSuccess && (
                      <p className="text-xs text-green-400 mt-1">Updated! We'll update your TradingView access within 4 hours.</p>
                    )}
                  </div>
                )}
                {hasSubscription && (
                  <>
                    <div>
                      <p className="text-gray-500">Plan</p>
                      <p className="text-white">{PLAN_NAMES[subscription!.plan]} · {subscription!.billing === 'annual' ? 'Annual' : 'Monthly'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className={
                        subscription!.status === 'active' ? 'text-green-400' 
                        : subscription!.status === 'cancelling' ? 'text-amber-400'
                        : 'text-red-400'
                      }>
                        {subscription!.status === 'active' ? 'Active' 
                         : subscription!.status === 'cancelling' ? 'Cancelling at period end'
                         : subscription!.status}
                      </p>
                    </div>
                    {subscription!.current_period_end && (
                      <div>
                        <p className="text-gray-500">{subscription!.status === 'cancelling' ? 'Access until' : 'Renews'}</p>
                        <p className="text-white">
                          {new Date(subscription!.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <p className="text-gray-500">Member since</p>
                  <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                {/* Trader Name — appears on certificates */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-xs font-medium">Trader Name <span className="text-gray-600 font-normal">(on certificates)</span></p>
                    {!editingTraderName && (
                      <button
                        onClick={() => {
                          const meta = (user as any)?.user_metadata || {};
                          const fallback = traderName || meta.full_name || meta.name || (user.email?.split('@')[0] ?? '');
                          setNewTraderName(fallback);
                          setEditingTraderName(true);
                          setTraderNameSuccess(false);
                        }}
                        className="text-gray-500 hover:text-primary-400 transition-colors"
                        title="Edit trader name shown on certificates"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {!editingTraderName ? (
                    <p className="text-white text-sm">
                      {traderName
                        || (user as any)?.user_metadata?.full_name
                        || (user as any)?.user_metadata?.name
                        || (user.email?.split('@')[0] ?? 'Trader')}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <input
                        type="text"
                        value={newTraderName}
                        onChange={(e) => setNewTraderName(e.target.value)}
                        maxLength={60}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm"
                        placeholder="Your name as it should appear on certificates"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTraderName}
                          disabled={savingTraderName || !newTraderName.trim()}
                          className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded text-xs font-medium hover:bg-primary-500/30 transition-all disabled:opacity-50"
                        >
                          {savingTraderName ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingTraderName(false)}
                          className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {traderNameSuccess && <p className="text-xs text-green-400 mt-1">Trader name saved.</p>}
                </div>

                {/* Public Profile */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-xs font-medium">Public Profile <span className="text-gray-600 font-normal">(optional)</span></p>
                    {!editingHandle && (
                      <button
                        onClick={() => {
                          setNewHandle(publicHandle || '');
                          setEditingHandle(true);
                          setHandleError('');
                          setHandleSuccess(false);
                        }}
                        className="text-gray-500 hover:text-primary-400 transition-colors"
                        title="Set or change your public handle"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {!editingHandle ? (
                    <>
                      {publicHandle ? (
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white text-sm font-mono">@{publicHandle}</p>
                          {isPublicProfile && (
                            <Link
                              href={`/trader/${publicHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                            >
                              View profile
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs italic mb-2">No public handle set.</p>
                      )}
                      {/* Public toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublicProfile(!isPublicProfile)}
                          disabled={savingPublicToggle || !publicHandle}
                          className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                            isPublicProfile ? 'bg-primary-500' : 'bg-gray-600'
                          } ${(savingPublicToggle || !publicHandle) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Toggle public profile"
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              isPublicProfile ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-xs text-gray-400">
                          {isPublicProfile ? 'Public profile is ON' : 'Public profile is OFF'}
                        </span>
                      </div>
                      {!publicHandle && (
                        <p className="text-[10px] text-gray-600 mt-1.5">Set a handle first to enable your public profile.</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm font-mono">@</span>
                        <input
                          type="text"
                          value={newHandle}
                          onChange={(e) => setNewHandle(e.target.value.toLowerCase())}
                          maxLength={32}
                          className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm font-mono"
                          placeholder="your-handle"
                        />
                      </div>
                      {handleError && <p className="text-xs text-red-400">{handleError}</p>}
                      <p className="text-[10px] text-gray-600">2-32 characters. Lowercase letters, numbers, dashes, underscores only.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveHandle}
                          disabled={savingHandle || !newHandle.trim()}
                          className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded text-xs font-medium hover:bg-primary-500/30 transition-all disabled:opacity-50"
                        >
                          {savingHandle ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setEditingHandle(false); setHandleError(''); }}
                          className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {handleSuccess && <p className="text-xs text-green-400 mt-1">Handle saved.</p>}
                </div>

                {/* Social Profiles */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs font-medium">Social Profiles</p>
                    {!editingSocials && (
                      <button
                        onClick={() => {
                          setSocialX(user?.user_metadata?.social_x || '');
                          setSocialInsta(user?.user_metadata?.social_instagram || '');
                          setSocialDiscord(user?.user_metadata?.social_discord || '');
                          setEditingSocials(true);
                          setSocialsSuccess(false);
                        }}
                        className="text-gray-500 hover:text-primary-400 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {!editingSocials ? (
                    <div className="space-y-1.5">
                      {user?.user_metadata?.social_x && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs w-5">𝕏</span>
                          <p className="text-white text-xs">@{user.user_metadata.social_x.replace('@', '')}</p>
                        </div>
                      )}
                      {user?.user_metadata?.social_instagram && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs w-5">IG</span>
                          <p className="text-white text-xs">@{user.user_metadata.social_instagram.replace('@', '')}</p>
                        </div>
                      )}
                      {user?.user_metadata?.social_discord && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs w-5">DC</span>
                          <p className="text-white text-xs">{user.user_metadata.social_discord}</p>
                        </div>
                      )}
                      {!user?.user_metadata?.social_x && !user?.user_metadata?.social_instagram && !user?.user_metadata?.social_discord && (
                        <button
                          onClick={() => { setEditingSocials(true); setSocialsSuccess(false); }}
                          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          + Add your socials
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-5">𝕏</span>
                        <input
                          type="text"
                          value={socialX}
                          onChange={e => setSocialX(e.target.value)}
                          placeholder="X / Twitter handle"
                          className="flex-1 px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-white outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-5">IG</span>
                        <input
                          type="text"
                          value={socialInsta}
                          onChange={e => setSocialInsta(e.target.value)}
                          placeholder="Instagram handle"
                          className="flex-1 px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-white outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-5">DC</span>
                        <input
                          type="text"
                          value={socialDiscord}
                          onChange={e => setSocialDiscord(e.target.value)}
                          placeholder="Discord username"
                          className="flex-1 px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-white outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setSavingSocials(true);
                            try {
                              await supabase.auth.updateUser({
                                data: {
                                  social_x: socialX.trim() || null,
                                  social_instagram: socialInsta.trim() || null,
                                  social_discord: socialDiscord.trim() || null,
                                },
                              });
                              setUser(prev => prev ? {
                                ...prev,
                                user_metadata: {
                                  ...prev.user_metadata,
                                  social_x: socialX.trim() || null,
                                  social_instagram: socialInsta.trim() || null,
                                  social_discord: socialDiscord.trim() || null,
                                }
                              } : null);
                              setEditingSocials(false);
                              setSocialsSuccess(true);
                              setTimeout(() => setSocialsSuccess(false), 4000);
                            } catch (err) {
                              console.error('Failed to save socials:', err);
                            } finally {
                              setSavingSocials(false);
                            }
                          }}
                          disabled={savingSocials}
                          className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded text-xs font-medium hover:bg-primary-500/30 transition-all disabled:opacity-50"
                        >
                          {savingSocials ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingSocials(false)}
                          className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {socialsSuccess && (
                    <p className="text-xs text-green-400 mt-1">Socials saved!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Your Certificates */}
            {earnedCerts.length > 0 && (
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold">Your Certificates</h3>
                </div>
                <div className="space-y-2">
                  {earnedCerts.map((c) => {
                    const course = academyCourses.find(x => x.id === c.level_id);
                    if (!course) return null;
                    return (
                      <Link
                        key={c.cert_code}
                        href={`/academy/certificate/${c.level_id}`}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/10 hover:to-amber-500/[0.03] transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-500/20">
                          {course.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{course.title}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{c.cert_code}</p>
                        </div>
                        <Download className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 mt-3">
                  Click any certificate to view and download as PDF.
                </p>
              </div>
            )}

            {/* Manage Subscription */}
            {hasSubscription && (
              <div className="glass p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Manage Subscription</h3>
                <div className="space-y-3">
                  {/* Upgrade / Billing switch */}
                  {(subscription!.plan !== 'elite' || (subscription!.plan === 'elite' && subscription!.billing === 'monthly')) && subscription!.status === 'active' && (
                    <button
                      onClick={openUpgradeModal}
                      className="block w-full text-center py-2 px-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-sm font-medium"
                    >
                      {subscription!.plan === 'elite' ? 'Switch to Annual' : 'Upgrade Plan'}
                    </button>
                  )}

                  {/* Cancelling state — offer reactivation */}
                  {subscription!.status === 'cancelling' && (
                    <div>
                      <p className="text-xs text-amber-400 mb-2">
                        Your subscription will end on {new Date(subscription!.current_period_end!).toLocaleDateString()}. You keep full access until then.
                      </p>
                      <button
                        onClick={handleReactivate}
                        disabled={cancelling}
                        className="w-full py-2 px-4 bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        {cancelling ? 'Processing...' : 'Reactivate Subscription'}
                      </button>
                    </div>
                  )}

                  {/* Active state — offer cancellation */}
                  {subscription!.status === 'active' && !showCancelConfirm && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="block w-full text-center py-2 px-4 text-gray-500 hover:text-red-400 transition-colors text-xs"
                    >
                      Cancel subscription
                    </button>
                  )}

                  {/* Cancel confirmation */}
                  {showCancelConfirm && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                      <p className="text-sm text-gray-300">
                        Before you cancel — help us improve by sharing why. Your access continues until the end of your current billing period. No refunds for remaining time.
                      </p>

                      <div className="space-y-2">
                        <label className="block text-xs text-gray-400">What's the main reason?</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { code: 'too_expensive', label: 'Too expensive' },
                            { code: 'not_using', label: "I'm not using it enough" },
                            { code: 'found_competitor', label: 'Found something better' },
                            { code: 'missing_feature', label: "It's missing a feature I need" },
                            { code: 'tech_issues', label: 'Technical issues' },
                            { code: 'temporary_break', label: 'Just taking a break' },
                            { code: 'other', label: 'Other' },
                          ].map((r) => (
                            <button
                              key={r.code}
                              onClick={() => setCancelReason(r.code)}
                              className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                cancelReason === r.code
                                  ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                              }`}
                            >{r.label}</button>
                          ))}
                        </div>
                      </div>

                      {cancelReason && (
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Anything else? <span className="text-gray-600">(optional)</span>
                          </label>
                          <textarea
                            value={cancelReasonText}
                            onChange={(e) => setCancelReasonText(e.target.value)}
                            rows={2}
                            placeholder="Your feedback helps us improve..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50"
                          />
                        </div>
                      )}

                      {cancelError && (
                        <p className="text-xs text-red-400">{cancelError}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelling || !cancelReason}
                          className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                        </button>
                        <button
                          onClick={() => { setShowCancelConfirm(false); setCancelError(''); setCancelReason(''); setCancelReasonText(''); }}
                          className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
                        >
                          Keep subscription
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3 text-sm">
                <Link href="/indicators" className="block text-gray-400 hover:text-white transition-colors">
                  Free Indicators
                </Link>
                <Link href="/atlas-pro" className="block text-gray-400 hover:text-white transition-colors">
                  ATLAS PRO Suite
                </Link>
                <Link href="/learn" className="block text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
                <a
                  href="https://www.tradingview.com/u/Interakktive/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  TradingView Profile
                </a>
              </div>
            </div>

            {/* Need Help */}
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-400 text-sm mb-3">
                Questions about your subscription or indicators?
              </p>
              <a
                href="mailto:support@interakktive.com"
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                support@interakktive.com
              </a>
            </div>

            {/* Admin Tools — only visible to allowlisted admins */}
            {isAdminEmail(user?.email) && (
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.02] p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-bold text-amber-400 tracking-wider uppercase">Admin Tools</h3>
                </div>
                <p className="text-[11px] text-gray-500 mb-4">Visible only to allowlisted accounts. Use these for testing.</p>

                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white mb-1">Reset Academy Progress</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    Wipes your <span className="text-gray-400">lesson_completions</span> and{' '}
                    <span className="text-gray-400">level_certificates</span> rows. Trader profile, handle, and
                    public toggle are kept. Lets you re-test the cert flow from zero.
                  </p>

                  {!adminResetConfirm ? (
                    <button
                      onClick={() => { setAdminResetConfirm(true); setAdminResetMessage(null); }}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                    >
                      Reset my progress…
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-400">Are you sure? This is permanent.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAdminResetAcademy}
                          disabled={adminResetting}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-400 transition-colors disabled:opacity-50"
                        >
                          {adminResetting ? 'Resetting…' : 'Yes, wipe my progress'}
                        </button>
                        <button
                          onClick={() => setAdminResetConfirm(false)}
                          disabled={adminResetting}
                          className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {adminResetMessage && (
                    <p className={`text-xs mt-2 ${adminResetMessage.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                      {adminResetMessage.text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && subscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <FadeIn>
            <div className="glass-card p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold mb-4">Upgrade Your Plan</h2>

              {/* Billing toggle — only show for Starter users and Advantage→Elite */}
              {(subscription.plan === 'starter' || (subscription.plan === 'advantage' && !isBillingSwitch)) && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Billing cycle</p>
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg w-fit">
                  <button
                    onClick={() => setUpgradeBilling('monthly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${upgradeBilling === 'monthly' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setUpgradeBilling('annual')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${upgradeBilling === 'annual' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Annual
                  </button>
                  {upgradeBilling === 'annual' && (
                    <span className="text-[10px] text-green-400 font-medium ml-1">Save ~17%</span>
                  )}
                </div>
              </div>
              )}
              
              {/* Plan selector for Starter users */}
              {subscription.plan === 'starter' && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {subscription.billing === 'monthly' && (
                    <button
                      onClick={() => { setUpgradeTarget('starter' as any); setIsBillingSwitch(true); setUpgradeBilling('annual'); setUpgradeSelections([...subscription.indicators]); }}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-medium transition-all ${isBillingSwitch ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                    >
                      Starter Annual
                      <span className="block text-xs mt-0.5">$500/yr · Save ~17%</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setUpgradeTarget('advantage'); setIsBillingSwitch(false); setUpgradeSelections([]); }}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-medium transition-all ${upgradeTarget === 'advantage' && !isBillingSwitch ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                  >
                    Advantage
                    <span className="block text-xs mt-0.5">${upgradeBilling === 'annual' ? '750/yr' : '75/mo'}</span>
                  </button>
                  <button
                    onClick={() => { setUpgradeTarget('elite'); setIsBillingSwitch(false); setUpgradeSelections(['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO']); }}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-medium transition-all ${upgradeTarget === 'elite' && !isBillingSwitch ? 'bg-accent-500/20 border border-accent-500/50 text-accent-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                  >
                    Elite
                    <span className="block text-xs mt-0.5">${upgradeBilling === 'annual' ? '1,000/yr' : '100/mo'}</span>
                  </button>
                </div>
              )}

              {/* Plan selector for Advantage users — can switch to Annual OR upgrade to Elite */}
              {subscription.plan === 'advantage' && (
                <div className="flex gap-3 mb-4">
                  {subscription.billing === 'monthly' && (
                    <button
                      onClick={() => { setUpgradeTarget('advantage'); setIsBillingSwitch(true); setUpgradeBilling('annual'); setUpgradeSelections([...subscription.indicators]); }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isBillingSwitch ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                    >
                      Advantage Annual
                      <span className="block text-xs mt-0.5">$750/yr · Save ~17%</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setUpgradeTarget('elite'); setIsBillingSwitch(false); setUpgradeSelections(['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO']); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${upgradeTarget === 'elite' && !isBillingSwitch ? 'bg-accent-500/20 border border-accent-500/50 text-accent-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}
                  >
                    Elite
                    <span className="block text-xs mt-0.5">${upgradeBilling === 'annual' ? '1,000/yr' : '100/mo'}</span>
                  </button>
                </div>
              )}

              {/* Elite Monthly users — only billing switch to Annual */}
              {subscription.plan === 'elite' && subscription.billing === 'monthly' && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Switch to Elite Annual — $1,000/yr · Save ~17%
                  </p>
                </div>
              )}

              {/* Pricing info */}
              <div className="p-3 bg-white/5 rounded-lg mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Current plan</span>
                  <span className="text-white">{subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} — ${PLAN_PRICES[subscription.plan]?.[subscription.billing]}/{subscription.billing === 'annual' ? 'yr' : 'mo'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">New plan</span>
                  <span className="text-white">
                    {isBillingSwitch 
                      ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} — $${PLAN_PRICES[subscription.plan]?.[upgradeBilling]}/${upgradeBilling === 'annual' ? 'yr' : 'mo'}`
                      : `${upgradeTarget.charAt(0).toUpperCase() + upgradeTarget.slice(1)} — $${PLAN_PRICES[upgradeTarget]?.[upgradeBilling]}/${upgradeBilling === 'annual' ? 'yr' : 'mo'}`
                    }
                  </span>
                </div>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <p className="text-xs text-gray-500">
                    {isBillingSwitch 
                      ? `Your current plan will switch to ${upgradeBilling === 'annual' ? 'Annual' : 'Monthly'} billing. Unused time will be credited toward your new plan via Stripe checkout.`
                      : `Your old plan will be cancelled and any unused time will be credited toward your new ${upgradeTarget.charAt(0).toUpperCase() + upgradeTarget.slice(1)} ${upgradeBilling === 'annual' ? 'Annual' : 'Monthly'} plan via Stripe checkout.`
                    }
                  </p>
                </div>
              </div>

              {/* Indicator selection for Advantage upgrade (not billing switch) */}
              {upgradeTarget === 'advantage' && !isBillingSwitch && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Choose your 2 indicators</p>
                  <p className="text-xs text-gray-500 mb-3">Select 2 from the 4 core ATLAS PRO indicators.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CORE_INDICATORS.map((ind) => {
                      const Icon = ind.icon;
                      const isSelected = upgradeSelections.includes(ind.id);
                      const isFull = !isSelected && upgradeSelections.length >= 2;
                      return (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => toggleUpgradeSelection(ind.id)}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected ? `${ind.borderColor} ${ind.bgColor}` : isFull ? 'border-white/5 bg-white/[0.02] opacity-40' : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                          }`}
                        >
                          {isSelected && (
                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${ind.bgColor} flex items-center justify-center`}>
                              <Check className={`w-3 h-3 ${ind.color}`} />
                            </div>
                          )}
                          <Icon className={`w-6 h-6 ${isSelected ? ind.color : 'text-gray-500'} mb-1.5`} />
                          <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{ind.id}</p>
                          <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>{ind.role}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Billing switch — show current indicators (they stay the same) */}
              {isBillingSwitch && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Your indicators stay the same</p>
                  <div className="grid grid-cols-2 gap-2">
                    {subscription.indicators.map((indName) => {
                      const ind = INDICATORS.find(i => i.id === indName);
                      if (!ind) return null;
                      const Icon = ind.icon;
                      return (
                        <div key={ind.id} className={`p-2 rounded-lg ${ind.bgColor} border ${ind.borderColor} flex items-center gap-2`}>
                          <Icon className={`w-4 h-4 ${ind.color}`} />
                          <span className="text-xs font-medium text-white">{ind.id}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Elite gets the Full ATLAS PRO Suite */}
              {upgradeTarget === 'elite' && !isBillingSwitch && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Full ATLAS PRO Suite included</p>
                  <div className="grid grid-cols-2 gap-2">
                    {INDICATORS.map((ind) => {
                      const Icon = ind.icon;
                      return (
                        <div key={ind.id} className={`p-2 rounded-lg ${ind.bgColor} border ${ind.borderColor} flex items-center gap-2`}>
                          <Icon className={`w-4 h-4 ${ind.color}`} />
                          <span className="text-xs font-medium text-white">{ind.id}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {upgradeError && (
                <div className="p-3 mb-4 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                  <p className="text-accent-400 text-sm">{upgradeError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading || (upgradeTarget === 'advantage' && upgradeSelections.length !== 2)}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-accent-500 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                >
                  {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {upgrading ? 'Redirecting to payment...' : `${isBillingSwitch ? 'Switch' : 'Upgrade'} & Pay — $${PLAN_PRICES[isBillingSwitch ? subscription.plan : upgradeTarget]?.[upgradeBilling]}/${upgradeBilling === 'annual' ? 'yr' : 'mo'}`}
                </button>
                <button
                  onClick={() => { setShowUpgradeModal(false); setUpgrading(false); }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      )}

      {/* ── Swap Modal ── */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <FadeIn>
            <div className="glass-card p-8 rounded-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-2">Swap Indicators</h2>
              <p className="text-sm text-gray-400 mb-1">
                Choose 2 from the 4 core ATLAS PRO indicators.
              </p>
              <p className="text-xs text-amber-400 mb-4">
                You can swap once per month. Your next swap will be available after the reset date.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {CORE_INDICATORS.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = swapSelections.includes(ind.id);
                  const isFull = !isSelected && swapSelections.length >= 2;

                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => toggleSwapSelection(ind.id)}
                      className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? `${ind.borderColor} ${ind.bgColor}`
                          : isFull
                          ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${ind.bgColor} flex items-center justify-center`}>
                          <Check className={`w-3 h-3 ${ind.color}`} />
                        </div>
                      )}
                      <Icon className={`w-6 h-6 ${isSelected ? ind.color : 'text-gray-500'} mb-1.5`} />
                      <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{ind.id}</p>
                      <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>{ind.role}</p>
                    </button>
                  );
                })}
              </div>

              {swapSelections.length === 2 && (
                <p className="text-xs text-gray-400 mb-4">
                  New selection: {swapSelections.join(' + ')}
                </p>
              )}

              {swapError && (
                <div className="p-3 mb-4 bg-accent-500/10 border border-accent-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
                  <p className="text-accent-400 text-sm">{swapError}</p>
                </div>
              )}

              {swapSuccess && (
                <div className="p-3 mb-4 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-primary-400 text-sm font-medium">Swap confirmed!</p>
                    <p className="text-gray-400 text-xs mt-1">
                      We'll update your TradingView access within 4 hours.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!swapSuccess ? (
                  <>
                    <button
                      onClick={handleSwap}
                      disabled={swapping || swapSelections.length !== 2}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-accent-500 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                    >
                      {swapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {swapping ? 'Swapping...' : 'Confirm Swap'}
                    </button>
                    <button
                      onClick={() => setShowSwapModal(false)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowSwapModal(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
