'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { pricingTiers } from '@/app/lib/indicators-data';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

export default function CheckoutStartPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'suite';
  const billing = (searchParams.get('billing') || 'annual') as 'monthly' | 'annual';

  const [email, setEmail] = useState('');
  const [tradingViewUsername, setTradingViewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tier = pricingTiers.find(t => t.id === planId);
  const price = billing === 'annual'
    ? (tier?.annualPrice || 0)
    : (tier?.monthlyPrice || 0);
  const perMonth = billing === 'annual'
    ? ((tier?.annualPrice || 0) / 12).toFixed(2)
    : (tier?.monthlyPrice || 0).toFixed(2);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!tradingViewUsername.trim()) {
      setError('TradingView username is required — we need it to grant your indicator access.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          billing,
          email,
          tradingViewUsername: tradingViewUsername.trim(),
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
        <div className="max-w-md mx-auto px-4 relative">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>

          <FadeIn>
            <div className="glass-card p-8 rounded-xl">
              {/* Order Summary */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-sm text-gray-400 mb-1">You&apos;re subscribing to</p>
                <h1 className="text-2xl font-bold mb-1">{tier?.name || 'ATLAS Pro'}</h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-400">${perMonth}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                {billing === 'annual' && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${price.toFixed(2)} billed annually · Save ~30%
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleCheckout} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
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
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    `Continue to Payment — $${billing === 'annual' ? price.toFixed(2) + '/yr' : perMonth + '/mo'}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment via Stripe. All sales are final.
                </p>
              </form>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
