'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowRight, User, Crown, LogOut, Crosshair, Eye, Activity, Radio,
  ExternalLink, BookOpen, RefreshCw, Check, AlertCircle, Loader2, ArrowLeftRight,
} from 'lucide-react';
import { FadeIn, FadeInView, SectionWrapper } from '@/app/components/animations';

const INDICATORS = [
  { id: 'CIPHER PRO', icon: Crosshair, role: 'Signal Intelligence', color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10', tvUrl: 'https://www.tradingview.com/script/vvf2W2ZG/', docUrl: '/learn/atlas-pro/atlas-cipher-pro' },
  { id: 'PHANTOM PRO', icon: Eye, role: 'Structure Intelligence', color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10', tvUrl: 'https://www.tradingview.com/script/fMZJJ8FQ/', docUrl: '/learn/atlas-pro/atlas-phantom-pro' },
  { id: 'PULSE PRO', icon: Activity, role: 'Momentum Intelligence', color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10', tvUrl: 'https://www.tradingview.com/script/nHfT0sXk/', docUrl: '/learn/atlas-pro/atlas-pulse-pro' },
  { id: 'RADAR PRO', icon: Radio, role: 'Screening Intelligence', color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10', tvUrl: 'https://www.tradingview.com/script/V6tg80MI-Atlas-Radar-Pro-Interakktive/', docUrl: '/learn/atlas-pro/atlas-radar-pro' },
];

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
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

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
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id, action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) { setCancelError(data.error || 'Failed to cancel.'); return; }
      setSubscription(prev => prev ? { ...prev, status: 'cancelling' } : null);
      setShowCancelConfirm(false);
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
      setSubscription(prev => prev ? { ...prev, status: 'active' } : null);
    } catch (err) {
      setCancelError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const canSwap = subscription?.plan === 'advantage' && !subscription?.swap_used;

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
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          indicators: swapSelections,
          swap_used: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription!.id);
      if (updateError) throw updateError;

      setSubscription(prev => prev ? { ...prev, indicators: swapSelections, swap_used: true } : null);
      setSwapSuccess(true);
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
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

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
                        Swap used this cycle
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

                  {subscription.plan !== 'elite' && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-3">
                        Want access to all 4 indicators?
                      </p>
                      <Link
                        href="/pricing"
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        Upgrade to Elite
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
                {subscription?.tradingview_username && (
                  <div>
                    <p className="text-gray-500">TradingView</p>
                    <p className="text-white">{subscription.tradingview_username}</p>
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
              </div>
            </div>

            {/* Manage Subscription */}
            {hasSubscription && (
              <div className="glass p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Manage Subscription</h3>
                <div className="space-y-3">
                  {/* Upgrade */}
                  {subscription!.plan !== 'elite' && subscription!.status === 'active' && (
                    <Link
                      href={subscription!.plan === 'starter' 
                        ? `/checkout/start?plan=duo&billing=${subscription!.billing}`
                        : `/checkout/start?plan=suite&billing=${subscription!.billing}`
                      }
                      className="block w-full text-center py-2 px-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-sm font-medium"
                    >
                      Upgrade to {subscription!.plan === 'starter' ? 'Advantage' : 'Elite'}
                    </Link>
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
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-gray-300 mb-3">
                        Are you sure? Your access continues until the end of your current billing period. No refunds for remaining time.
                      </p>
                      {cancelError && (
                        <p className="text-xs text-red-400 mb-2">{cancelError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                          className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-50"
                        >
                          {cancelling ? 'Cancelling...' : 'Yes, cancel'}
                        </button>
                        <button
                          onClick={() => { setShowCancelConfirm(false); setCancelError(''); }}
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
          </div>
        </div>
      </div>

      {/* ── Swap Modal ── */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <FadeIn>
            <div className="glass-card p-8 rounded-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-2">Swap Indicators</h2>
              <p className="text-sm text-gray-400 mb-1">
                Choose your 2 indicators for this billing cycle.
              </p>
              <p className="text-xs text-amber-400 mb-4">
                You can only swap once per billing cycle. This action cannot be undone.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {INDICATORS.map((ind) => {
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
