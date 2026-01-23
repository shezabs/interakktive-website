'use client';

import Link from 'next/link';
import { ArrowRight, Brain, TrendingUp, Target, Zap, Shield, BarChart3, Clock, HelpCircle } from 'lucide-react';
import { getProIndicators } from '@/app/lib/indicators-data';
import { FAQAccordion, FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, AnimatedBackground, SectionWrapper, GradientDivider } from '@/app/components/animations';

const faqItems = [
  {
    question: 'What is ATLAS PRO and how is it different from the free indicators?',
    answer: 'ATLAS PRO is our premium suite of AI and machine learning-enabled indicators. Unlike our free indicators that focus on individual metrics, ATLAS PRO combines multiple analytical dimensions (AI predictions, multi-timeframe analysis, adaptive thresholds, and risk assessment) into a unified decision support system. It includes features like Ghost Performance tracking, Win Probability estimates, and intelligent exit signals that aren\'t available in the free versions.'
  },
  {
    question: 'How does the invite-only access work?',
    answer: 'ATLAS PRO is currently available by invitation only to ensure quality support and community engagement. To request access, create an account on our website and submit your TradingView username along with a brief description of your trading experience. We review requests regularly and send TradingView invites to approved users.'
  },
  {
    question: 'Is there a cost for ATLAS PRO?',
    answer: 'ATLAS PRO is currently free during our beta/early access phase. We want to gather feedback and refine the indicators before considering any pricing. Early adopters who help us improve the system will always be valued members of our community.'
  },
  {
    question: 'What markets and timeframes work best with ATLAS PRO?',
    answer: 'ATLAS PRO is designed to work across all markets available on TradingView including stocks, forex, crypto, and futures. The multi-timeframe analysis feature automatically adapts to your chosen timeframe, though we recommend using it on timeframes of 15 minutes or higher for optimal signal quality.'
  },
  {
    question: 'How accurate is the Win Probability feature?',
    answer: 'The Win Probability feature uses historical pattern matching to estimate success rates based on similar setups in the past. It displays both the probability percentage and the sample size (e.g., "73% (142)") so you can judge the statistical significance. Remember that past performance doesn\'t guarantee future results, and this should be one of many factors in your trading decisions.'
  },
  {
    question: 'Can I use ATLAS PRO alongside other indicators?',
    answer: 'Yes! ATLAS PRO is designed to complement your existing analysis. Many traders use it alongside our free indicators or their preferred tools. The Risk Ribbon and regime detection features can help you understand when your other strategies might perform better or worse.'
  },
];

export default function AtlasProPage() {
  const proIndicators = getProIndicators();
  const cipherPro = proIndicators[0];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 mb-20">
        <AnimatedBackground />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <FadeIn>
            <div className="inline-block px-4 py-1 bg-primary-500/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-semibold mb-6">
              INVITE ONLY
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                INTERAKKTIVE - ATLAS
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Institutional-grade AI-powered trading indicators combining machine learning,
              multi-timeframe analysis, and adaptive intelligence for professional traders.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <HoverScale className="inline-block">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
              >
                Request Early Access
                <ArrowRight className="w-5 h-5" />
              </Link>
            </HoverScale>
          </FadeIn>
        </div>
      </section>

      <GradientDivider />

      {/* What is ATLAS */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              What is <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">ATLAS</span>?
            </h2>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-12">
              ATLAS is our premium suite of AI and machine learning-enabled indicators designed for serious traders
              who demand institutional-quality analytics. Each ATLAS indicator combines multiple analytical dimensions
              into a unified decision support system.
            </p>
          </FadeInView>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg text-center h-full">
                  <Brain className="w-10 h-10 text-primary-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-400">
                    Machine learning algorithms analyze historical patterns
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg text-center h-full">
                  <BarChart3 className="w-10 h-10 text-accent-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Multi-Timeframe</h3>
                  <p className="text-sm text-gray-400">
                    Confluence across multiple timeframes for high-conviction setups
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg text-center h-full">
                  <Zap className="w-10 h-10 text-primary-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Adaptive</h3>
                  <p className="text-sm text-gray-400">
                    Self-adjusting thresholds based on real-time performance
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-6 rounded-lg text-center h-full">
                  <Shield className="w-10 h-10 text-accent-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Risk-Aware</h3>
                  <p className="text-sm text-gray-400">
                    Built-in risk assessment and management tools
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* ATLAS - CIPHER PRO */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="glass-card p-10 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{cipherPro.shortTitle}</h2>
                <div className="inline-block px-3 py-1 bg-accent-500/20 border border-accent-500/50 rounded-full text-accent-400 text-xs font-semibold">
                  Coming Soon
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-300 mb-8">{cipherPro.description}</p>

            {/* Key Features */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Revolutionary Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cipherPro.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-primary-400 mt-1">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-400" />
                Perfect For
              </h3>
              <ul className="space-y-3">
                {cipherPro.useCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-accent-400 mt-1">→</span>
                    <span className="text-gray-300">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Highlights */}
            {cipherPro.technicalDetails && (
              <div className="bg-black/40 p-6 rounded-lg border border-primary-500/20">
                <h3 className="text-lg font-bold mb-3 text-primary-400">Latest Version (v1.1.9.3)</h3>
                <p className="text-gray-300 leading-relaxed">{cipherPro.technicalDetails}</p>
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* How to Get Access */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <h2 className="text-3xl font-bold mb-8 text-center">
              How to Get <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Access</span>
            </h2>
          </FadeInView>
          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-8 rounded-lg text-center h-full">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create Account</h3>
                  <p className="text-gray-400">
                    Sign up with your email to create your Interakktive account
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-8 rounded-lg text-center h-full">
                  <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Request Access</h3>
                  <p className="text-gray-400">
                    Submit your TradingView username and tell us about your trading
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
            <StaggerItem>
              <HoverScale>
                <div className="glass-card p-8 rounded-lg text-center h-full">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Get Invited</h3>
                  <p className="text-gray-400">
                    Receive your TradingView invite and start using ATLAS PRO
                  </p>
                </div>
              </HoverScale>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* FAQ Section */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <div className="flex items-center justify-center gap-3 mb-8">
              <HelpCircle className="w-8 h-8 text-primary-400" />
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <FAQAccordion items={faqItems} />
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* CTA */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <div className="glass-card p-12 rounded-lg text-center">
              <Clock className="w-16 h-16 text-primary-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Join the Waitlist
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                ATLAS PRO SUITE's first indicator - CIPHER PRO will be published when our website goes live.
                Request early access now to be among the first to receive an invite.
              </p>
              <HoverScale className="inline-block">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
                >
                  Request Early Access
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </HoverScale>
            </div>
          </FadeInView>

          {/* Free Indicators CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              Want to try our free indicators first?
            </p>
            <Link
              href="/indicators"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              Explore 8 Free Indicators
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
