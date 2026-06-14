'use client';

// ==========================================================================
// CHECKOUT START — placeholder during pricing rebuild (2026-06-14).
// The previous 3-tier selection flow (pick-1/pick-2/full-suite, OPTIONS PRO
// Elite-only) is preserved at app/checkout/start/page.OLD-3tier-reference.tsx.txt.
// Rebuild this flow against the new tiers once the new structure is defined.
// ==========================================================================

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FadeIn, SectionWrapper } from '@/app/components/animations';

export default function CheckoutStartPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <div className="glass-card rounded-xl p-10 flex flex-col items-center gap-6">
              <h1 className="text-2xl md:text-3xl font-bold">
                Checkout is being{' '}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  updated
                </span>
              </h1>
              <p className="text-gray-300">
                We&rsquo;re refreshing our plans. Checkout will be back online with
                the new pricing shortly.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
