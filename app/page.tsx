'use client';

import Link from 'next/link';
import { ArrowRight, Activity, Layers, Radio, Crosshair, Eye, BarChart3 } from 'lucide-react';
import { getProIndicators, getFreeIndicators } from './lib/indicators-data';
import { FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, AnimatedBackground, SectionWrapper, GradientDivider } from './components/animations';

export default function HomePage() {
  const proIndicators = getProIndicators();
  const freeIndicators = getFreeIndicators();

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8">
            <FadeIn delay={0}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="block bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                  Trading Intelligence
                </span>
                <span className="block text-white mt-2">You Can See</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Our indicators tell you not just what to trade, but why.
                Diagnostic tools that show signals, structure, momentum,
                and screening — all explained in plain English.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                13 published indicators &middot; 25,000+ lines of proprietary code &middot; Zero black-box signals
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <HoverScale>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold flex items-center gap-2"
                  >
                    View Pricing
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </HoverScale>
                <HoverScale>
                  <Link
                    href="/atlas-pro"
                    className="px-8 py-4 glass rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
                  >
                    Explore the Suite
                  </Link>
                </HoverScale>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* The ATLAS Suite */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              The <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">ATLAS</span> Suite
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Four dimensions of market intelligence. Each indicator is a specialist.
              Together, they give you the complete picture.
            </p>
          </FadeInView>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proIndicators.map((indicator) => {
              const iconMap: Record<string, React.ReactNode> = {
                'atlas-cipher-pro': <Crosshair className="w-8 h-8 text-primary-400" />,
                'atlas-phantom-pro': <Eye className="w-8 h-8 text-accent-400" />,
                'atlas-pulse-pro': <Activity className="w-8 h-8 text-primary-400" />,
                'atlas-radar-pro': <Radio className="w-8 h-8 text-accent-400" />,
              };
              const roleMap: Record<string, string> = {
                'atlas-cipher-pro': 'Signal Intelligence',
                'atlas-phantom-pro': 'Structure Intelligence',
                'atlas-pulse-pro': 'Momentum Intelligence',
                'atlas-radar-pro': 'Screening Intelligence',
              };
              return (
                <StaggerItem key={indicator.id}>
                  <HoverScale scale={1.01}>
                    <Link href={`/atlas-pro#${indicator.id}`} className="glass-card p-6 rounded-lg block h-full group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {iconMap[indicator.id]}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold group-hover:text-primary-400 transition-colors">
                              {indicator.shortTitle}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                              {roleMap[indicator.id]}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {indicator.description}
                          </p>
                          <span className="text-primary-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Learn more <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </HoverScale>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Why ATLAS — Philosophy */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              We Show You <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Why</span>, Not Just What
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Every ATLAS indicator explains its reasoning in plain English.
              No raw numbers. No cryptic scores. Just clear intelligence.
            </p>
          </FadeInView>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg h-full">
                  <Layers className="w-10 h-10 text-primary-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Diagnostic Transparency</h3>
                  <p className="text-gray-400 text-sm">
                    Every signal comes with a plain English explanation of why it fired,
                    what confirmed it, and what could invalidate it. No black boxes.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg h-full">
                  <BarChart3 className="w-10 h-10 text-accent-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ghost Performance&trade;</h3>
                  <p className="text-gray-400 text-sm">
                    Historical validation built into every indicator. See win rates,
                    accuracy stats, and first-touch validation — not just the current signal.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg h-full">
                  <Activity className="w-10 h-10 text-primary-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Narrative Engine</h3>
                  <p className="text-gray-400 text-sm">
                    Every ATLAS indicator includes a Narrative Engine that translates
                    complex analytics into sentences you can act on immediately.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Free Indicators */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free Diagnostic Tools
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {freeIndicators.length} open-source indicators available now.
              No signup, no paywall — add them to your charts right now.
            </p>
          </FadeInView>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeIndicators.slice(0, 6).map((indicator) => (
              <StaggerItem key={indicator.id}>
                <HoverScale>
                  <Link
                    href={`/indicators/${indicator.id}`}
                    className="glass-card p-6 rounded-lg transition-all group block h-full"
                  >
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                      {indicator.shortTitle}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {indicator.description}
                    </p>
                    <span className="text-primary-400 text-sm flex items-center gap-1">
                      Learn more <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeInView delay={0.3} className="text-center mt-8">
            <Link
              href="/indicators"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all {freeIndicators.length} free indicators
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* CTA */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to see the <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">full picture</span>?
            </h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p className="text-xl text-gray-300">
              Join traders using the ATLAS suite to understand not just what to trade,
              but why the setup exists, how strong it is, and what could break it.
            </p>
          </FadeInView>
          <FadeInView delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HoverScale className="inline-block">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
                >
                  View Pricing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </HoverScale>
              <HoverScale className="inline-block">
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
