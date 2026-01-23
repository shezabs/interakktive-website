'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Zap, Brain, Shield } from 'lucide-react';
import { getFreeIndicators } from './lib/indicators-data';
import { FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, AnimatedBackground, AnimatedCounter, SectionWrapper, GradientDivider } from './components/animations';

export default function HomePage() {
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
                  AI-Powered Trading
                </span>
                <span className="block text-white mt-2">Indicators</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Advanced machine learning and AI-enabled indicators for TradingView.
                Make smarter trading decisions with institutional-grade analytics.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <HoverScale>
                  <Link
                    href="/indicators"
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold flex items-center gap-2"
                  >
                    Explore Free Indicators
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </HoverScale>
                <HoverScale>
                  <Link
                    href="/atlas-pro"
                    className="px-8 py-4 glass rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
                  >
                    View ATLAS PRO
                  </Link>
                </HoverScale>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* Features Grid */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Interakktive</span>?
            </h2>
          </FadeInView>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg space-y-4 h-full">
                  <Brain className="w-12 h-12 text-primary-400" />
                  <h3 className="text-xl font-semibold">AI & ML Powered</h3>
                  <p className="text-gray-400">
                    Advanced algorithms analyze market conditions in real-time for smarter insights.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg space-y-4 h-full">
                  <TrendingUp className="w-12 h-12 text-accent-400" />
                  <h3 className="text-xl font-semibold">Regime Detection</h3>
                  <p className="text-gray-400">
                    Adapt your strategy based on current market conditions and volatility states.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg space-y-4 h-full">
                  <Zap className="w-12 h-12 text-primary-400" />
                  <h3 className="text-xl font-semibold">Real-Time Signals</h3>
                  <p className="text-gray-400">
                    Get instant notifications for high-probability trading setups.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg space-y-4 h-full">
                  <Shield className="w-12 h-12 text-accent-400" />
                  <h3 className="text-xl font-semibold">Risk Management</h3>
                  <p className="text-gray-400">
                    Built-in risk assessment and position sizing recommendations.
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Free Indicators Showcase */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free Indicators
            </h2>
            <p className="text-xl text-gray-300">
              8 professional-grade indicators available now on TradingView
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
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-400 transition-colors">
                      {indicator.shortTitle}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {indicator.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <AnimatedCounter value={indicator.stats.favorites} /> favorites
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                    </div>
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

      {/* ATLAS PRO CTA */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready for <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Pro-Level</span> Analytics?
            </h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p className="text-xl text-gray-300">
              ATLAS PRO combines AI, machine learning, and multi-timeframe analysis into a comprehensive trading system.
              Request early access to our invite-only indicators.
            </p>
          </FadeInView>
          <FadeInView delay={0.2}>
            <HoverScale className="inline-block">
              <Link
                href="/atlas-pro"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
              >
                Explore ATLAS PRO
                <ArrowRight className="w-5 h-5" />
              </Link>
            </HoverScale>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
