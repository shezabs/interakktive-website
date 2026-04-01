'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { pricingTiers, getProIndicators } from '@/app/lib/indicators-data';
import { FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, SectionWrapper, GradientDivider } from '@/app/components/animations';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const billingParam = searchParams.get('billing');
  const [isAnnual, setIsAnnual] = useState(billingParam === 'monthly' ? false : true);

  useEffect(() => {
    if (billingParam === 'monthly') setIsAnnual(false);
    if (billingParam === 'annual') setIsAnnual(true);
  }, [billingParam]);

  const proIndicators = getProIndicators();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <SectionWrapper variant="gradient" className="pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
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
              Choose the indicators you need, or get the full suite at a discount.
              All plans include every future update.
            </p>
          </FadeIn>

          {/* Billing Toggle */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isAnnual ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                      isAnnual ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                  Annual
                </span>
              </div>
              <div className="h-6">
                {isAnnual && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 font-semibold">
                    Save up to 17%
                  </span>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Pricing Cards */}
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <StaggerItem key={tier.id}>
                <HoverScale scale={1.02}>
                  <div
                    className={`glass-card rounded-xl p-8 flex flex-col relative ${
                      tier.isPopular
                        ? 'border-primary-400/50 ring-1 ring-primary-400/20'
                        : ''
                    }`}
                    style={{ minHeight: '620px' }}
                  >
                    {tier.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Tier Header - fixed height so all cards align */}
                    <div className="mb-6 min-h-[72px]">
                      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-gray-400 text-sm">{tier.description}</p>
                    </div>

                    {/* Price - fixed height for alignment */}
                    <div className="mb-6 min-h-[72px]">
                      {isAnnual ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">
                              ${tier.annualPrice}
                            </span>
                            <span className="text-gray-400 text-sm">/year</span>
                          </div>
                          {tier.annualOriginalPrice && (
                            <div className="mt-1">
                              <span className="text-sm text-gray-500 line-through mr-2">
                                ${tier.annualOriginalPrice}/yr
                              </span>
                              <span className="text-sm text-primary-400 font-medium">
                                Save ${tier.annualOriginalPrice - tier.annualPrice}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${tier.monthlyPrice}
                          </span>
                          <span className="text-gray-400 text-sm">/month</span>
                        </div>
                      )}
                    </div>

                    {/* Indicators - fixed height for alignment */}
                    <div className="mb-6 min-h-[120px]">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Includes
                      </p>
                      <ul className="space-y-2">
                        {tier.indicators.map((ind, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                            <span className="text-gray-300">{ind}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Features */}
                    <div className="mb-8 flex-1">
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/checkout/start?plan=${tier.id}&billing=${isAnnual ? 'annual' : 'monthly'}`}
                      className={`w-full py-3 rounded-lg font-semibold text-center transition-all flex items-center justify-center gap-2 mt-auto ${
                        tier.isPopular
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* What's Included */}
      <SectionWrapper variant="gradient" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              What You Get with{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                ATLAS PRO
              </span>
            </h2>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proIndicators.map((indicator) => {
              const roleMap: Record<string, string> = {
                'atlas-cipher-pro': 'Signal Intelligence',
                'atlas-phantom-pro': 'Structure Intelligence',
                'atlas-pulse-pro': 'Momentum Intelligence',
                'atlas-radar-pro': 'Screening Intelligence',
                'atlas-options-pro': 'Options Intelligence',
              };
              return (
                <FadeInView key={indicator.id}>
                  <div className="glass-card p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{indicator.shortTitle}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        {roleMap[indicator.id]}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{indicator.description}</p>
                    <Link
                      href={`/atlas-pro#${indicator.id}`}
                      className="text-primary-400 text-sm hover:text-primary-300 transition-colors"
                    >
                      Learn more →
                    </Link>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* How It Works */}
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              How It Works
            </h2>
          </FadeInView>
          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Choose Your Plan</h3>
                <p className="text-gray-400 text-sm">
                  Pick a single indicator, duo pack, or full suite access.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Enter TradingView Username</h3>
                <p className="text-gray-400 text-sm">
                  We need your TradingView username to grant indicator access.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Start Trading</h3>
                <p className="text-gray-400 text-sm">
                  Access is granted within 4 hours. Add the indicators to your charts and go.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* FAQ */}
      <SectionWrapper variant="gradient" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
          </FadeInView>
          <div className="space-y-6">
            {[
              {
                q: 'How do I get access to the indicators after paying?',
                a: 'After checkout, you\'ll provide your TradingView username. We grant access within 4 hours of payment. You\'ll receive an email confirmation once your indicators are live.',
              },
              {
                q: 'Can I switch which indicators I have access to?',
                a: 'Advantage plan subscribers can swap their indicator selection once per billing cycle. Starter plan selections are locked for the billing period — upgrade to Advantage or Elite if you want flexibility. Elite subscribers have access to the full suite, so no swapping needed.',
              },
              {
                q: 'What happens if I cancel?',
                a: 'Your access continues until the end of your current billing period. After that, TradingView access is revoked. You can re-subscribe at any time. All purchases are final — we do not offer refunds.',
              },
              {
                q: 'What does the Elite plan include?',
                a: 'The Elite plan gives you access to every indicator that is part of the ATLAS suite — currently CIPHER PRO, PHANTOM PRO, PULSE PRO, RADAR PRO, and OPTIONS PRO. As we add new indicators to the suite, you get access to those too, plus all future updates.',
              },
              {
                q: 'Can I try before I buy?',
                a: 'We have 9 free indicators that demonstrate our approach to diagnostic intelligence. Try Sessions +, Market State Intelligence, or any of our open-source tools first.',
              },
            ].map((faq, idx) => (
              <FadeInView key={idx} delay={idx * 0.05}>
                <div className="glass-card p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm">{faq.a}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Free Indicators CTA */}
      <SectionWrapper variant="dark" className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="text-gray-400 mb-4">
              Not ready to commit? Try our free diagnostic tools first.
            </p>
            <Link
              href="/indicators"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              Explore 9 Free Indicators
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
