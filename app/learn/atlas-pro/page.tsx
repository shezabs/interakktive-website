import Link from 'next/link';
import { ArrowLeft, Lock, Bell, Zap } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView } from '@/app/components/animations';

export const metadata = {
  title: 'ATLAS PRO Documentation',
  description: 'Advanced documentation for the ATLAS PRO AI/ML-enabled trading system. Master Ghost Performance, Adaptive Quality, and Multi-Timeframe Confluence.',
};

export default function AtlasProDocsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <SectionWrapper variant="gradient" className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learn
          </Link>

          <FadeInView>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm mb-6">
              <Lock className="w-4 h-4" />
              PRO Documentation
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ATLAS PRO Suite
            </h1>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-xl text-gray-300 max-w-3xl">
              Advanced AI/ML-enabled trading system documentation.
              Master every feature of the most sophisticated trading indicators available.
            </p>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Coming Soon */}
      <SectionWrapper variant="dark" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <div className="w-20 h-20 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Zap className="w-10 h-10 text-accent-400" />
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="text-3xl font-bold mb-4">Documentation Coming Soon</h2>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-gray-400 mb-8 text-lg">
              ATLAS PRO is currently in beta development. Comprehensive documentation
              will be available once the suite is published.
            </p>
          </FadeInView>

          <FadeInView delay={0.3}>
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">What to expect:</h3>
              <ul className="text-left text-gray-300 space-y-3 max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>ATLAS CIPHER PRO complete documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>Ghost Performance System explained</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>Adaptive Quality Threshold guide</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>Multi-Timeframe Confluence mastery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>Risk Ribbon interpretation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent-400">•</span>
                  <span>Win Probability & Exit Signals</span>
                </li>
              </ul>
            </div>
          </FadeInView>

          <FadeInView delay={0.4}>
            <div className="mt-12">
              <Link
                href="/atlas-pro"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg hover:from-accent-600 hover:to-primary-600 transition-all font-semibold"
              >
                <Bell className="w-4 h-4" />
                Request Early Access
              </Link>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
