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
            Building the future of AI-powered trading analytics
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 glass p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            At Interakktive, we're revolutionizing technical analysis by combining cutting-edge
            artificial intelligence and machine learning with proven trading methodologies. Our mission
            is to democratize institutional-grade trading analytics, making advanced tools accessible
            to traders at all levels.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Starting with TradingView, we're building a complete trading ecosystem — from indicators
            to automated strategies — designed to evolve with the markets and the traders who navigate them.
          </p>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-lg">
              <Zap className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI-Powered Indicators</h3>
              <p className="text-gray-300">
                We develop sophisticated trading indicators that leverage machine learning to
                analyze market conditions and identify high-probability setups.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <Target className="w-10 h-10 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Regime Detection</h3>
              <p className="text-gray-300">
                Our tools automatically identify market regimes, helping traders adapt their
                strategies to current conditions rather than using static approaches.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <Users className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community-Driven</h3>
              <p className="text-gray-300">
                We listen to our users and continuously improve our indicators based on real trader
                feedback and evolving market dynamics.
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <TrendingUp className="w-10 h-10 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Continuous Innovation</h3>
              <p className="text-gray-300">
                We're constantly researching and developing new analytical techniques to stay ahead
                of market evolution and provide cutting-edge tools.
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
                We've published 8 professional-grade indicators on TradingView, completely free for
                the trading community. These tools cover regime detection, volatility analysis, efficiency
                measurement, and institutional activity tracking.
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
              <div className="inline-block px-3 py-1 bg-accent-500/20 border border-accent-500/50 rounded-full text-accent-400 text-xs font-semibold mb-4">
                INVITE ONLY
              </div>
              <h3 className="text-2xl font-bold mb-3">INTERAKKTIVE - ATLAS</h3>
              <p className="text-gray-300 mb-4">
                Our premium suite of AI-enabled indicators designed for serious traders. ATLAS combines
                machine learning, multi-timeframe analysis, adaptive intelligence, and institutional-grade
                risk management into comprehensive trading systems.
              </p>
              <Link
                href="/atlas-pro"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Learn About ATLAS PRO
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="glass p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with our free indicators or request access to ATLAS PRO.
            Either way, you'll gain access to cutting-edge trading analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/indicators"
              className="px-8 py-4 glass rounded-lg hover:bg-white/10 transition-all text-lg font-semibold"
            >
              Free Indicators
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
