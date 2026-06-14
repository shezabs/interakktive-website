'use client';

// ==========================================================================
// PRICING PAGE — placeholder during pricing rebuild (2026-06-14).
// The previous 3-tier page (Starter/Advantage/Elite) is preserved for
// reference at app/pricing/page.OLD-3tier-reference.tsx.txt.
// Replace this body with the new tier cards once the new structure is defined.
// ==========================================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeIn, SectionWrapper, GradientDivider } from '@/app/components/animations';

export default function PricingPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="gradient" className="pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              New Pricing{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              We&rsquo;re refreshing our plans to make ATLAS PRO simpler and better
              value. New tiers will be live here shortly.
            </p>
          </FadeIn>
        </div>
      </SectionWrapper>

      <GradientDivider />

      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <div className="glass-card rounded-xl p-10 flex flex-col items-center gap-6">
              <p className="text-gray-300">
                Want early access or have a question about plans? Reach out and
                we&rsquo;ll look after you.
              </p>
              <Link
                href="/atlas-pro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Explore the ATLAS PRO Suite
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}
