import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, TrendingUp, Activity, BarChart3, Gauge, Waves, Scale, Percent } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView, StaggerContainer, StaggerItem } from '@/app/components/animations';

export const metadata = {
  title: 'Free Indicators Documentation',
  description: 'Complete documentation for all 9 free Interakktive trading indicators. Learn settings, calculations, and practical trading applications.',
};

const indicators = [
  {
    id: 'market-acceptance-envelope',
    title: 'Market Acceptance Envelope',
    description: 'Dynamic envelope system identifying institutional acceptance zones through probabilistic boundaries.',
    icon: Waves,
    category: 'Envelope / Bands',
  },
  {
    id: 'market-state-intelligence',
    title: 'Market State Intelligence',
    description: 'Multi-dimensional regime classifier synthesizing trend, momentum, volatility, and structure.',
    icon: Activity,
    category: 'Regime Detection',
  },
  {
    id: 'market-acceptance-zones',
    title: 'Market Acceptance Zones',
    description: 'Identifies institutional acceptance levels with significant volume concentration.',
    icon: BarChart3,
    category: 'Support / Resistance',
  },
  {
    id: 'market-participation-gradient',
    title: 'Market Participation Gradient',
    description: 'Tracks intensity and directional bias of market participation through momentum analysis.',
    icon: TrendingUp,
    category: 'Momentum',
  },
  {
    id: 'market-pressure-regime',
    title: 'Market Pressure Regime',
    description: 'Multi-dimensional pressure classifier identifying buyer, seller, or equilibrium dominance.',
    icon: Gauge,
    category: 'Pressure Analysis',
  },
  {
    id: 'volatility-state-index',
    title: 'Volatility State Index',
    description: 'Comprehensive volatility regime detection for position sizing and strategy adaptation.',
    icon: Activity,
    category: 'Volatility',
  },
  {
    id: 'effort-result-divergence',
    title: 'Effort-Result Divergence',
    description: 'Wyckoff-inspired tool comparing volume effort against price result for institutional detection.',
    icon: Scale,
    category: 'Volume Analysis',
  },
  {
    id: 'market-efficiency-ratio',
    title: 'Market Efficiency Ratio',
    description: 'Decomposes price movement into directional progress versus wasted oscillatory movement.',
    icon: Percent,
    category: 'Efficiency',
  },
  {
    id: 'sessions-plus',
    title: 'Sessions +',
    description: 'The most comprehensive session analysis tool for TradingView. Sessions, levels, ICT concepts, analytics, and a live DNA predictor.',
    icon: Activity,
    category: 'Session Intelligence',
  },
];

export default function FreeIndicatorsDocsPage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              9 Free Indicators
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Free Indicators Documentation
            </h1>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-xl text-gray-300 max-w-3xl">
              Complete A-Z documentation for every free indicator. Understand the theory,
              master every setting, and learn practical trading applications.
            </p>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Indicators Grid */}
      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <StaggerItem key={indicator.id}>
                  <Link
                    href={`/learn/free-indicators/${indicator.id}`}
                    className="block group"
                  >
                    <div className="glass-card p-6 rounded-xl h-full hover:border-primary-500/50 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                              {indicator.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                            {indicator.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {indicator.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-primary-400 text-sm font-medium">
                            Read Documentation
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Getting Started Section */}
      <SectionWrapper variant="gradient" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="glass-card p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold mb-4">New to Interakktive Indicators?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Start with the Market State Intelligence indicator to understand market regimes,
                then explore specialized indicators for your trading style.
              </p>
              <Link
                href="/learn/free-indicators/market-state-intelligence"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold"
              >
                Start with Market State Intelligence
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
