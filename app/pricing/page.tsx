'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { pricingTiers, PricingTier, CustomCycle } from '@/app/lib/indicators-data';
import { FadeIn, SectionWrapper, GradientDivider } from '@/app/components/animations';

// Billing view: 'custom' (left, default) shows PRO custom cycles; 'annual' (right) unchanged.
type BillingView = 'custom' | 'annual';
type CycleId = 'weekly' | 'biweekly' | 'monthly';

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingView>('custom');
  // Which custom cycle is selected for the ATLAS PRO card. Defaults to monthly.
  const [proCycle, setProCycle] = useState<CycleId>('monthly');

  const handleCta = (tier: PricingTier) => {
    if (tier.ctaHref) {
      router.push(tier.ctaHref);
      return;
    }
    if (tier.isFree) {
      router.push('/signup');
      return;
    }
    // On the annual side, everything bills annually.
    // On the custom side, PRO uses the selected cycle; MAX (no custom cycles) bills monthly.
    let billingParam: string;
    if (billing === 'annual') {
      billingParam = 'annual';
    } else if (tier.customCycles && tier.customCycles.length > 0) {
      billingParam = proCycle;
    } else {
      billingParam = 'monthly';
    }
    router.push(`/checkout/start?plan=${tier.id}&billing=${billingParam}`);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="gradient" className="pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Get the complete ATLAS PRO suite, or scale up with multi-seat access for
              your team. All plans include every future update.
            </p>
          </FadeIn>

          {/* Billing toggle: Custom (left, default) / Annual (right) */}
          <FadeIn delay={0.15}>
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className={billing === 'custom' ? 'text-white font-medium' : 'text-gray-400'}>
                Custom
              </span>
              <button
                onClick={() => setBilling(billing === 'custom' ? 'annual' : 'custom')}
                role="switch"
                aria-checked={billing === 'annual'}
                aria-label="Toggle between custom and annual billing"
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billing === 'annual' ? 'bg-primary-500' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                    billing === 'annual' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={billing === 'annual' ? 'text-white font-medium' : 'text-gray-400'}>
                Annual
              </span>
            </div>
            <div className="h-6">
              {billing === 'annual' && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 text-sm font-medium">
                  Save 17% — 2 months free
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              All sales are final. See our{' '}
              <Link href="/terms" className="text-gray-400 hover:text-gray-300 underline">
                Terms
              </Link>{' '}
              for details.
            </p>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* Cards */}
      <SectionWrapper variant="dark" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier, i) => (
              <FadeIn key={tier.id} delay={0.1 * i} className="h-full">
                <PriceCard
                  tier={tier}
                  billing={billing}
                  proCycle={proCycle}
                  onSelectCycle={setProCycle}
                  onCta={() => handleCta(tier)}
                />
              </FadeIn>
            ))}
          </div>

          {/* Not financial advice line */}
          <FadeIn delay={0.4}>
            <p className="text-center text-sm text-gray-500 max-w-3xl mx-auto mt-12 leading-relaxed">
              All indicators, commentary, and educational material are provided for general
              information and educational purposes only and do not constitute financial advice.
              Trading involves risk. See our{' '}
              <Link href="/disclaimer" className="text-gray-400 hover:text-gray-300 underline">
                Risk Disclaimer
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </SectionWrapper>
    </div>
  );
}

function fmtPrice(n: number): string {
  // Show 2 decimals only when the price actually has them (e.g. 99.99),
  // whole numbers stay clean (e.g. 0). Thousands separated.
  const hasDecimals = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function PriceCard({
  tier,
  billing,
  proCycle,
  onSelectCycle,
  onCta,
}: {
  tier: PricingTier;
  billing: BillingView;
  proCycle: CycleId;
  onSelectCycle: (c: CycleId) => void;
  onCta: () => void;
}) {
  // Does this card show the custom-cycle selector? Only PRO, only on the custom side.
  const hasCustomCycles = billing === 'custom' && !!tier.customCycles && tier.customCycles.length > 0;
  const selectedCycle: CustomCycle | undefined = hasCustomCycles
    ? tier.customCycles!.find((c) => c.id === proCycle)
    : undefined;

  // Resolve the displayed price + period.
  let price: number;
  let period: string;
  if (billing === 'annual') {
    price = tier.annualPrice;
    period = '/year';
  } else if (selectedCycle) {
    price = selectedCycle.price;
    period =
      selectedCycle.id === 'weekly'
        ? '/week'
        : selectedCycle.id === 'biweekly'
        ? '/2 weeks'
        : '/month';
  } else {
    price = tier.monthlyPrice;
    period = '/month';
  }

  const showStrikethrough = billing === 'annual' && tier.annualOriginalPrice;

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl border p-7 ${
        tier.isPopular
          ? 'border-primary-500/50 bg-gradient-to-b from-primary-500/[0.07] to-transparent'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tier.isPopular
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                : 'bg-white/10 text-gray-200'
            }`}
          >
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
        {tier.recommendedFor && (
          <p className="text-sm text-gray-400 mt-1">Recommended for {tier.recommendedFor}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="h-7 flex items-start">
          {tier.priceNote && (
            <p className="text-xs text-gray-400 leading-tight">{tier.priceNote}</p>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${fmtPrice(price)}</span>
          {!tier.isFree && <span className="text-gray-400">{period}</span>}
        </div>
        {showStrikethrough ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 line-through">
              ${fmtPrice(tier.annualOriginalPrice!)}/year
            </span>
            <span className="text-sm text-primary-400 font-medium">
              Save ${fmtPrice(Math.round((tier.annualOriginalPrice! - tier.annualPrice) * 100) / 100)}
            </span>
          </div>
        ) : (
          <div className="mt-1 h-5" aria-hidden="true" />
        )}
      </div>

      {/* Alignment spacer — on the custom side, the non-PRO cards (FREE, MAX)
          reserve the same vertical space the PRO cycle selector occupies, so
          all three "Get Started" buttons land on the same horizontal line. */}
      {billing === 'custom' && !hasCustomCycles && (
        <div className="mb-5 h-[84px]" aria-hidden="true" />
      )}

      {/* Custom billing cycle selector — ATLAS PRO only, custom side only */}
      {hasCustomCycles && (
        <div className="mb-5">
          <p className="text-sm text-gray-300 mb-2.5">Select your custom billing cycle:</p>
          <div className="grid grid-cols-3 gap-2">
            {tier.customCycles!.map((cycle) => {
              const isSelected = cycle.id === proCycle;
              return (
                <button
                  key={cycle.id}
                  onClick={() => onSelectCycle(cycle.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 border-transparent text-white'
                      : 'bg-white/[0.03] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-semibold leading-tight">{cycle.label}</span>
                  <span
                    className={`text-xs leading-tight mt-0.5 ${
                      isSelected ? 'text-white/90' : 'text-gray-400'
                    }`}
                  >
                    ${fmtPrice(cycle.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tier.hideCta ? (
        <div className="w-full py-3 mb-6" aria-hidden="true" />
      ) : (
        <button
          onClick={onCta}
          className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all ${
            tier.isFree
              ? 'border border-white/15 text-white hover:bg-white/5'
              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90'
          } inline-flex items-center justify-center gap-2`}
        >
          {tier.ctaLabel || 'Get Started'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Includes</p>
        <ul className="space-y-3">
          {tier.features.map((f, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300 leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        {tier.activationNote && (
          <p className="text-xs text-gray-500 leading-relaxed mt-5 pt-4 border-t border-white/10">
            {tier.activationNote}
          </p>
        )}
      </div>
    </div>
  );
}
