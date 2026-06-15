'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { pricingTiers } from '@/app/lib/indicators-data';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

function CheckoutStartInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId = searchParams.get('plan') || '';
  const billingParam = searchParams.get('billing') === 'annual' ? 'annual' : 'monthly';

  const tier = pricingTiers.find((t) => t.id === planId);

  const [email, setEmail] = useState('');
  const [tvUsername, setTvUsername] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard: invalid or free plan shouldn't be here
  useEffect(() => {
    if (!tier || tier.isFree) {
      router.replace('/pricing');
    }
  }, [tier, router]);

  if (!tier || tier.isFree) {
    return null;
  }

  const isMax = tier.id === 'max';
  const price = billingParam === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
  const period = billingParam === 'monthly' ? 'month' : 'year';

  const canSubmit =
    email.trim().length > 3 &&
    email.includes('@') &&
    agreed &&
    (isMax || tvUsername.trim().length > 0) &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tier.id,
          billing: billingParam,
          email: email.trim(),
          tradingViewUsername: tvUsername.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="dark" className="py-10">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>

          <FadeIn>
            <div className="glass-card rounded-xl p-7">
              <h1 className="text-2xl font-bold mb-1">Checkout</h1>
              <p className="text-gray-400 mb-6">
                {tier.name} — ${price.toLocaleString('en-US', { minimumFractionDigits: (Math.round(price * 100) % 100 !== 0) ? 2 : 0, maximumFractionDigits: 2 })}/{period}
                {billingParam === 'annual' && tier.annualOriginalPrice && (
                  <span className="text-primary-400"> (2 months free)</span>
                )}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                {!isMax && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">TradingView username</label>
                    <input
                      type="text"
                      value={tvUsername}
                      onChange={(e) => setTvUsername(e.target.value)}
                      placeholder="your_tradingview_username"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      We use this to grant your indicator access on TradingView.
                    </p>
                  </div>
                )}

                {isMax && (
                  <div className="rounded-lg border border-primary-500/20 bg-primary-500/[0.05] p-4">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      After checkout, email your <strong className="text-white">4 TradingView usernames</strong> to{' '}
                      <span className="text-primary-400">support@interakktive.com</span> to activate your seats.
                      You can request username changes anytime; your plan always includes 4 seats.
                    </p>
                  </div>
                )}

                {/* Consent — Terms binding, Privacy informational */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary-500"
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-primary-400 hover:text-primary-300 underline">
                      Terms of Service
                    </Link>{' '}
                    and confirm I have read the{' '}
                    <Link href="/privacy" target="_blank" className="text-primary-400 hover:text-primary-300 underline">
                      Privacy Policy
                    </Link>
                    . I understand all sales are final and my subscription renews automatically until cancelled.
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                    canSubmit
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting checkout…
                    </>
                  ) : (
                    'Continue to payment'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Payments are processed securely by Stripe. All commentary and educational material is for
                  general information only and is not financial advice.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}

export default function CheckoutStartPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-gray-400">Loading…</div>}>
      <CheckoutStartInner />
    </Suspense>
  );
}
