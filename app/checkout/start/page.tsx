'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, User as UserIcon, Loader2, AlertCircle, Crosshair, Eye, Activity, Radio, Check } from 'lucide-react';
import { pricingTiers } from '@/app/lib/indicators-data';
import { supabase } from '@/app/lib/supabase';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

const INDICATORS = [
  { id: 'cipher', name: 'CIPHER PRO', role: 'Signal Intelligence', icon: Crosshair, color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10' },
  { id: 'phantom', name: 'PHANTOM PRO', role: 'Structure Intelligence', icon: Eye, color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10' },
  { id: 'pulse', name: 'PULSE PRO', role: 'Momentum Intelligence', icon: Activity, color: 'text-primary-400', borderColor: 'border-primary-400', bgColor: 'bg-primary-400/10' },
  { id: 'radar', name: 'RADAR PRO', role: 'Screening Intelligence', icon: Radio, color: 'text-accent-400', borderColor: 'border-accent-400', bgColor: 'bg-accent-400/10' },
];

export default function CheckoutStartPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'suite';
  const billing = (searchParams.get('billing') || 'annual') as 'monthly' | 'annual';

  const [email, setEmail] = useState('');
  const [tradingViewUsername, setTradingViewUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(
    planId === 'suite' ? INDICATORS.map(i => i.id) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingSub, setExistingSub] = useState<{ plan: string } | null>(null);

  // Pre-fill from logged-in user + check for existing subscription
  useEffect(() => {
    const prefill = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        if (user.email) setEmail(user.email);
        // Check for existing active subscription
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('tradingview_username, plan, status')
          .eq('user_email', user.email)
          .in('status', ['active', 'cancelling'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (sub?.tradingview_username) {
          setTradingViewUsername(sub.tradingview_username);
        }
        if (sub?.plan) {
          setExistingSub({ plan: sub.plan });
        }
      }
    };
    prefill();
  }, []);

  const tier = pricingTiers.find(t => t.id === planId);
  const price = billing === 'annual'
    ? (tier?.annualPrice || 0)
    : (tier?.monthlyPrice || 0);

  // How many indicators can they pick?
  const maxSelections = planId === 'single' ? 1 : planId === 'duo' ? 2 : 4;
  const isElite = planId === 'suite';
  const needsSelection = !isElite;

  const toggleIndicator = (id: string) => {
    if (isElite) return; // Elite gets all, no toggling
    
    setSelectedIndicators(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= maxSelections) {
        // For single plan, replace the selection
        if (maxSelections === 1) {
          return [id];
        }
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!tradingViewUsername.trim()) {
      setError('TradingView username is required — we need it to grant your indicator access.');
      setLoading(false);
      return;
    }

    if (needsSelection && selectedIndicators.length !== maxSelections) {
      setError(`Please select ${maxSelections} indicator${maxSelections > 1 ? 's' : ''} to continue.`);
      setLoading(false);
      return;
    }

    // Get the display names for selected indicators
    const selectedNames = selectedIndicators.map(id => 
      INDICATORS.find(i => i.id === id)?.name || id
    );

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          billing,
          email,
          tradingViewUsername: tradingViewUsername.trim(),
          indicators: selectedNames,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="dark" className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 relative">
          <Link
            href={`/pricing?billing=${billing}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>

          <FadeIn>
            {/* Block if already subscribed */}
            {existingSub && (
              <div className="glass-card p-8 rounded-xl text-center">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">You Already Have a Subscription</h2>
                <p className="text-gray-400 text-sm mb-2">
                  You&apos;re currently on the <strong className="text-white">{existingSub.plan.charAt(0).toUpperCase() + existingSub.plan.slice(1)}</strong> plan.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  To change your plan, use the upgrade or cancel options in your dashboard.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg font-semibold text-center text-white"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href={`/pricing?billing=${billing}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Back to pricing
                  </Link>
                </div>
              </div>
            )}

            {/* Normal checkout form — only if no existing subscription */}
            {!existingSub && (
            <div className="glass-card p-8 rounded-xl">
              {/* Order Summary */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 mb-1">You&apos;re subscribing to</p>
                <h1 className="text-2xl font-bold mb-1">{tier?.name || 'ATLAS PRO'}</h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-400">${price}</span>
                  <span className="text-gray-400">/{billing === 'annual' ? 'year' : 'month'}</span>
                </div>
                {billing === 'annual' && tier?.annualOriginalPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="line-through">${tier.annualOriginalPrice}/yr</span>
                    <span className="text-primary-400 ml-2">Save ${tier.annualOriginalPrice - price}</span>
                  </p>
                )}
              </div>

              {/* Indicator Selection */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-sm font-medium mb-1">
                  {isElite 
                    ? 'Your indicators' 
                    : `Choose ${maxSelections === 1 ? 'your indicator' : `your ${maxSelections} indicators`}`
                  }
                </p>
                {needsSelection && (
                  <p className="text-xs text-gray-500 mb-3">
                    {planId === 'single' 
                      ? 'Select 1 indicator.'
                      : 'Select 2 indicators. You can swap once per month.'
                    }
                  </p>
                )}
                {isElite && (
                  <p className="text-xs text-gray-500 mb-3">All 4 indicators included with Elite.</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {INDICATORS.map((indicator) => {
                    const Icon = indicator.icon;
                    const isSelected = selectedIndicators.includes(indicator.id);
                    const isDisabled = isElite;
                    const isFull = !isElite && !isSelected && selectedIndicators.length >= maxSelections && maxSelections > 1;

                    return (
                      <button
                        key={indicator.id}
                        type="button"
                        onClick={() => toggleIndicator(indicator.id)}
                        disabled={isDisabled}
                        className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? `${indicator.borderColor} ${indicator.bgColor}`
                            : isFull
                            ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                        } ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {isSelected && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${indicator.bgColor} flex items-center justify-center`}>
                            <Check className={`w-3 h-3 ${indicator.color}`} />
                          </div>
                        )}
                        <Icon className={`w-6 h-6 ${isSelected ? indicator.color : 'text-gray-500'} mb-1.5`} />
                        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          {indicator.name}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                          {indicator.role}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {needsSelection && selectedIndicators.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Selected: {selectedIndicators.map(id => INDICATORS.find(i => i.id === id)?.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleCheckout} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                    {isLoggedIn && <span className="text-xs text-gray-500 ml-2">(from your account)</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={isLoggedIn}
                      className={`w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors ${isLoggedIn ? 'text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* TradingView Username */}
                <div>
                  <label htmlFor="tradingview" className="block text-sm font-medium mb-2">
                    TradingView Username <span className="text-accent-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="tradingview"
                      type="text"
                      value={tradingViewUsername}
                      onChange={(e) => setTradingViewUsername(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="Your exact TradingView username"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is the username we&apos;ll use to grant your indicator access on TradingView.
                    Double-check it&apos;s correct.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-accent-500/10 border border-accent-500/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <p className="text-accent-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || (needsSelection && selectedIndicators.length !== maxSelections)}
                  className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    `Continue to Payment — $${price}/${billing === 'annual' ? 'yr' : 'mo'}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment via Stripe. All sales are final.
                </p>
              </form>
            </div>
            )}
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
