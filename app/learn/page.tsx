import Link from 'next/link';
import { BookOpen, Zap, GraduationCap, ArrowRight } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView, StaggerContainer, StaggerItem } from '@/app/components/animations';

export const metadata = {
  title: 'Learn - Documentation & Guides',
  description: 'Comprehensive documentation for all Interakktive trading indicators. Learn how to use our free indicators and ATLAS PRO suite effectively.',
};

export default function LearnPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Hero Section */}
      <SectionWrapper variant="gradient" className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Documentation Center
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Learn to Trade Smarter
            </h1>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive A-Z documentation for every Interakktive indicator.
              Understand the theory, master the settings, and apply effectively in your trading.
            </p>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Documentation Categories */}
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Indicators */}
            <StaggerItem>
              <Link href="/learn/free-indicators" className="block group h-full">
                <div className="glass-card p-8 rounded-xl h-full hover:border-primary-500/50 transition-all flex flex-col">
                  <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-6">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-400 transition-colors">
                    Free Indicators
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Complete documentation for all 9 free professional-grade indicators.
                    Learn every setting, understand the calculations, and see practical examples.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1 mb-6 flex-1">
                    <li>• Market Acceptance Envelope</li>
                    <li>• Market State Intelligence</li>
                    <li>• Volatility State Index</li>
                    <li>• Sessions+</li>
                    <li>• And 5 more...</li>
                  </ul>
                  <span className="inline-flex items-center gap-2 text-primary-400 font-medium mt-auto">
                    View Documentation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </StaggerItem>

            {/* ATLAS PRO */}
            <StaggerItem>
              <Link href="/learn/atlas-pro" className="block group h-full">
                <div className="glass-card p-8 rounded-xl h-full hover:border-accent-500/50 transition-all relative overflow-hidden flex flex-col">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-accent-500/20 border border-accent-500/30 rounded-full text-accent-400 text-xs font-medium">
                    PRO
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-accent-400 transition-colors">
                    ATLAS PRO Suite
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Extensive documentation for the ATLAS PRO trading intelligence suite.
                    Every feature, every setting, every strategy — explained in detail.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1 mb-6 flex-1">
                    <li>• CIPHER PRO — Signal Intelligence</li>
                    <li>• PHANTOM PRO — Structure Intelligence</li>
                    <li>• PULSE PRO — Momentum Intelligence</li>
                    <li>• RADAR PRO — Screening Intelligence</li>
                    <li>• How-to guides &amp; strategies</li>
                  </ul>
                  <span className="inline-flex items-center gap-2 text-accent-400 font-medium mt-auto">
                    View Documentation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Quick Links */}
      <SectionWrapper variant="gradient" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <h2 className="text-2xl font-bold mb-8 text-center">Quick Navigation</h2>
          </FadeInView>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Getting Started', href: '/learn/free-indicators' },
              { name: 'Market Analysis', href: '/learn/free-indicators/market-state-intelligence' },
              { name: 'Volatility', href: '/learn/free-indicators/volatility-state-index' },
              { name: 'Volume Analysis', href: '/learn/free-indicators/effort-result-divergence' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="glass-card p-4 rounded-lg text-center hover:border-primary-500/50 transition-all group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
