import Link from 'next/link';
import { ArrowRight, Zap, Target, Users, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Interakktive</span>
          </h1>
          <p className="text-xl text-gray-300">
            Trading intelligence you can see — and understand
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 glass p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            At Interakktive, we build trading indicators that explain their reasoning in plain English.
            Every signal tells you WHY it fired, what confirmed it, and what could invalidate it.
            No black boxes. No cryptic scores. Just clear, actionable intelligence.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            We believe traders deserve diagnostic transparency — the ability to understand every signal,
            every zone, and every market read before risking capital. That philosophy drives everything we build.
          </p>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-lg">
              <Zap className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Diagnostic Intelligence</h3>
              <p className="text-gray-300">
                Every indicator includes a Narrative Engine that translates complex analytics
                into sentences you can act on immediately. We show you why, not just what.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <Target className="w-10 h-10 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Adaptive Analysis</h3>
              <p className="text-gray-300">
                Our indicators auto-detect the asset class and adjust signal thresholds,
                stop methods, and context automatically. Works across crypto, forex, stocks, indices, and commodities.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <Users className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Built for Traders</h3>
              <p className="text-gray-300">
                Every feature is designed by traders, for traders. Ghost Performance tracking validates
                signals historically. Multi-timeframe alignment ensures you never trade against the current.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <TrendingUp className="w-10 h-10 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Continuous Development</h3>
              <p className="text-gray-300">
                We actively develop and refine our indicators based on real market conditions
                and user feedback. All subscribers receive every update at no extra cost.
              </p>
            </div>
          </div>
        </section>

        {/* Our Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Products</h2>

          <div className="space-y-6">
            {/* Free Indicators */}
            <div className="glass p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Free Indicators</h3>
              <p className="text-gray-300 mb-4">
                We&apos;ve published 9 professional-grade diagnostic indicators on TradingView, completely free.
                These tools cover regime detection, volatility analysis, efficiency measurement, session intelligence,
                and institutional activity tracking.
              </p>
              <Link
                href="/indicators"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Explore Free Indicators
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* ATLAS PRO */}
            <div className="glass p-8 rounded-lg bg-gradient-to-br from-primary-900/20 to-accent-900/20">
              <h3 className="text-2xl font-bold mb-3">ATLAS PRO Suite</h3>
              <p className="text-gray-300 mb-4">
                Four premium indicators covering every dimension of market intelligence: CIPHER PRO (signals),
                PHANTOM PRO (structure), PULSE PRO (momentum), and RADAR PRO (screening). Each includes a
                Narrative Engine, Ghost Performance validation, and multi-timeframe alignment — all explained
                in plain English.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/atlas-pro"
                  className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Explore the Suite
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors"
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="glass p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Start Trading with Intelligence</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Try our free indicators on TradingView or subscribe to ATLAS PRO
            for the complete trading intelligence experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/indicators"
              className="px-8 py-4 glass rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
            >
              Free Indicators
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
