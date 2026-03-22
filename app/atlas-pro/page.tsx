'use client';

import Link from 'next/link';
import { ArrowRight, Crosshair, Eye, Activity, Radio, ExternalLink, Check } from 'lucide-react';
import { getProIndicators } from '@/app/lib/indicators-data';
import { FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, AnimatedBackground, SectionWrapper, GradientDivider } from '@/app/components/animations';

const indicatorMeta: Record<string, {
  icon: React.ReactNode;
  role: string;
  color: string;
  tagColor: string;
  highlight: string;
}> = {
  'atlas-cipher-pro': {
    icon: <Crosshair className="w-10 h-10" />,
    role: 'Signal Intelligence',
    color: 'text-primary-400',
    tagColor: 'bg-primary-400/10 text-primary-400 border-primary-400/20',
    highlight: '3,514 lines · 64/64 outputs · 238 asset configurations',
  },
  'atlas-phantom-pro': {
    icon: <Eye className="w-10 h-10" />,
    role: 'Structure Intelligence',
    color: 'text-accent-400',
    tagColor: 'bg-accent-400/10 text-accent-400 border-accent-400/20',
    highlight: '~4,563 lines · SMC + BOS/CHoCH + Order Blocks + FVG + Institutional Levels',
  },
  'atlas-pulse-pro': {
    icon: <Activity className="w-10 h-10" />,
    role: 'Momentum Intelligence',
    color: 'text-accent-400',
    tagColor: 'bg-accent-400/10 text-accent-400 border-accent-400/20',
    highlight: '~1,304 lines · Dual oscillator · 6-component Pulse Score · Pure intelligence',
  },
  'atlas-radar-pro': {
    icon: <Radio className="w-10 h-10" />,
    role: 'Screening Intelligence',
    color: 'text-primary-400',
    tagColor: 'bg-primary-400/10 text-primary-400 border-primary-400/20',
    highlight: '819 lines · 10 tickers · 3 independent engines · Stateless architecture',
  },
};

export default function AtlasProPage() {
  const proIndicators = getProIndicators();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 mb-8">
        <AnimatedBackground />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-accent-400 bg-clip-text text-transparent">
                The ATLAS Suite
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Four indicators. Four dimensions of market intelligence.
              Each one tells you something no other can.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-base text-gray-500 mb-8 max-w-2xl mx-auto">
              Every indicator includes a Narrative Engine that explains its analysis in plain English.
              No raw scores. No cryptic numbers. Just clear intelligence you can act on.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HoverScale>
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all text-lg font-semibold flex items-center gap-2 text-white"
                >
                  View Pricing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </HoverScale>
            </div>
          </FadeIn>
        </div>
      </section>

      <GradientDivider />

      {/* Individual Indicator Sections */}
      {proIndicators.map((indicator, idx) => {
        const meta = indicatorMeta[indicator.id];
        const isEven = idx % 2 === 0;

        return (
          <div key={indicator.id}>
            <SectionWrapper
              variant={isEven ? 'dark' : 'gradient'}
              className="py-16"
              id={indicator.id}
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <FadeInView>
                  <div className="glass-card p-8 md:p-10 rounded-xl">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={meta.color}>
                          {meta.icon}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">{indicator.shortTitle}</h2>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${meta.tagColor} mt-1`}>
                            {meta.role}
                          </span>
                        </div>
                      </div>
                      {indicator.tradingViewUrl && (
                        <a
                          href={indicator.tradingViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-sm"
                        >
                          View on TradingView
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-lg text-gray-300 mb-6">
                      {indicator.description}
                    </p>

                    {/* Highlight stat */}
                    <div className="bg-black/30 rounded-lg px-4 py-3 mb-8 border border-white/5">
                      <p className="text-sm text-gray-400">
                        <span className={`font-semibold ${meta.color}`}>Technical: </span>
                        {meta.highlight}
                      </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {indicator.features.map((feature, fidx) => (
                        <div key={fidx} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 ${meta.color} flex-shrink-0 mt-1`} />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Use cases */}
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Best For
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {indicator.useCases.slice(0, 4).map((useCase, uidx) => (
                          <p key={uidx} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">→</span>
                            {useCase}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeInView>
              </div>
            </SectionWrapper>
            <GradientDivider />
          </div>
        );
      })}

      {/* How They Work Together */}
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl font-bold text-center mb-4">
              Better Together
            </h2>
            <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
              Each ATLAS indicator is powerful alone. Combined, they create a complete
              intelligence stack that no competitor on TradingView can match.
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="glass-card p-8 rounded-xl">
              <div className="space-y-4">
                {[
                  { q: 'WHAT is the signal?', a: 'CIPHER PRO', detail: 'Fires entry signals with conviction scoring and win probability' },
                  { q: 'WHY is structure shifting?', a: 'PHANTOM PRO', detail: 'Shows BOS/CHoCH, order blocks, liquidity, and institutional levels' },
                  { q: 'HOW strong is momentum?', a: 'PULSE PRO', detail: 'Measures flow, wave, rhythm, fatigue, and divergence lifecycle' },
                  { q: 'WHERE is the opportunity?', a: 'RADAR PRO', detail: 'Screens 10 tickers for signal + structure + momentum confluence' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-3 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 text-sm md:w-56 flex-shrink-0">{item.q}</span>
                    <span className="font-bold text-white md:w-40 flex-shrink-0">{item.a}</span>
                    <span className="text-gray-400 text-sm">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* CTA */}
      <SectionWrapper variant="gradient" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FadeInView>
            <h2 className="text-3xl font-bold mb-4">
              Ready to see the{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                full picture
              </span>
              ?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a single indicator or get the full suite.
              All plans include every future update and priority support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HoverScale>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all text-lg font-semibold text-white"
                >
                  View Pricing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </HoverScale>
              <HoverScale>
                <Link
                  href="/indicators"
                  className="inline-flex items-center gap-2 px-8 py-4 glass rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
                >
                  Try Free Indicators First
                </Link>
              </HoverScale>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
