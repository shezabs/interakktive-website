'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <SectionWrapper variant="dark" className="w-full">
        <div className="max-w-lg mx-auto px-4">
          <FadeIn>
            <div className="glass-card p-10 rounded-xl text-center">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary-400" />
              </div>

              <h1 className="text-3xl font-bold mb-3">Payment Successful</h1>

              <p className="text-lg text-gray-300 mb-6">
                Thank you for subscribing to ATLAS PRO.
              </p>

              <div className="bg-black/30 rounded-lg p-4 mb-8 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-accent-400" />
                  <h3 className="font-semibold text-accent-400">What happens next?</h3>
                </div>
                <p className="text-gray-400 text-sm text-left">
                  We&apos;ll grant access to your TradingView account within 4 hours of payment.
                  You&apos;ll receive an email confirmation once your indicators are live.
                  The indicators will appear in your TradingView Invite-Only Scripts.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/atlas-pro"
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
                >
                  Explore Your Indicators
                </Link>
                <Link
                  href="/"
                  className="block text-gray-400 hover:text-white text-sm transition-colors text-center"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
