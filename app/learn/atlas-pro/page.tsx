import Link from 'next/link';
import { ArrowLeft, ArrowRight, Crown, Crosshair, Eye, Activity, Radio } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView, StaggerContainer, StaggerItem, HoverScale } from '@/app/components/animations';

export const metadata = {
  title: 'ATLAS Pro Suite Documentation',
  description: 'Complete documentation for the ATLAS Pro trading intelligence suite. CIPHER PRO, PHANTOM PRO, PULSE PRO, and RADAR PRO.',
};

const proIndicators = [
  {
    slug: 'atlas-cipher-pro',
    title: 'CIPHER PRO',
    role: 'Signal Intelligence',
    description: 'The signal engine. PX and TS signals, adaptive ribbon, risk envelope, structure, imbalance, sweeps, coil, and a 14-row Command Center.',
    icon: Crosshair,
    lines: '3,514',
    available: true,
  },
  {
    slug: 'atlas-phantom-pro',
    title: 'PHANTOM PRO',
    role: 'Structure Intelligence',
    description: 'Market structure and Smart Money concepts. BOS/CHoCH, order blocks, FVGs, liquidity, institutional levels, and Ghost Performance.',
    icon: Eye,
    lines: '~4,563',
    available: true,
  },
  {
    slug: 'atlas-pulse-pro',
    title: 'PULSE PRO',
    role: 'Momentum Intelligence',
    description: 'Pure momentum diagnostics. Dual FLOW/WAVE oscillator, Pressure Bands, Rhythm, Fatigue, Divergence, and Pulse Score.',
    icon: Activity,
    lines: '~1,304',
    available: false,
  },
  {
    slug: 'atlas-radar-pro',
    title: 'RADAR PRO',
    role: 'Screening Intelligence',
    description: 'Multi-ticker screener scanning 10 tickers across three independent engines with unified Confluence rating.',
    icon: Radio,
    lines: '819',
    available: false,
  },
];

export default function AtlasProDocsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SectionWrapper variant="gradient" className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/learn" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Learn
          </Link>
          <FadeInView>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm mb-6">
              <Crown className="w-4 h-4" />
              ATLAS Pro Documentation
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">ATLAS Pro Suite</h1>
          </FadeInView>
          <FadeInView delay={0.2}>
            <p className="text-xl text-gray-300 max-w-3xl">
              Complete documentation for every ATLAS Pro indicator. Every feature, every setting, every strategy — explained in detail.
            </p>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      <SectionWrapper variant="dark" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proIndicators.map((indicator) => (
              <StaggerItem key={indicator.slug}>
                <HoverScale scale={indicator.available ? 1.02 : 1.0}>
                  {indicator.available ? (
                    <Link href={`/learn/atlas-pro/${indicator.slug}`} className="glass-card p-6 rounded-lg block h-full group">
                      <div className="flex items-start gap-4">
                        <indicator.icon className="w-8 h-8 text-primary-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold group-hover:text-primary-400 transition-colors">{indicator.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">{indicator.role}</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{indicator.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{indicator.lines} lines</span>
                            <span className="text-primary-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Read docs <ArrowRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="glass-card p-6 rounded-lg h-full opacity-60">
                      <div className="flex items-start gap-4">
                        <indicator.icon className="w-8 h-8 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-400">{indicator.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{indicator.role}</span>
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{indicator.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{indicator.lines} lines</span>
                            <span className="text-gray-500 text-sm">Coming soon</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      <SectionWrapper variant="gradient" className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="text-gray-400 mb-4">Ready to get started with the ATLAS Pro suite?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold">
                View Pricing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/atlas-pro" className="inline-flex items-center gap-2 px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all font-semibold">
                Explore the Suite
              </Link>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
