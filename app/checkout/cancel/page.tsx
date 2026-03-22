'use client';

import Link from 'next/link';
import { XCircle, ArrowRight } from 'lucide-react';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

export default function CheckoutCancelPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <SectionWrapper variant="dark" className="w-full">
        <div className="max-w-lg mx-auto px-4">
          <FadeIn>
            <div className="glass-card p-10 rounded-xl text-center">
              <div className="w-20 h-20 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-accent-400" />
              </div>

              <h1 className="text-3xl font-bold mb-3">Checkout Cancelled</h1>

              <p className="text-lg text-gray-300 mb-8">
                No worries — you weren&apos;t charged. You can come back any time.
              </p>

              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white"
                >
                  Back to Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/indicators"
                  className="block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Try our free indicators instead
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
