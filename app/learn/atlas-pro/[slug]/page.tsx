'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Settings, Lightbulb, Target, AlertTriangle, CheckCircle, ExternalLink, Calculator, BarChart3, Zap, Crown } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView, StaggerContainer, StaggerItem } from '@/app/components/animations';
import { proIndicatorDocs } from '@/app/lib/pro-indicator-docs';

const sectionIcons: Record<string, React.ReactNode> = {
  overview: <BookOpen className="w-6 h-6" />,
  settings: <Settings className="w-6 h-6" />,
  concept: <Lightbulb className="w-6 h-6" />,
  usage: <Target className="w-6 h-6" />,
  warning: <AlertTriangle className="w-6 h-6" />,
  tips: <CheckCircle className="w-6 h-6" />,
  calculation: <Calculator className="w-6 h-6" />,
  interpretation: <BarChart3 className="w-6 h-6" />,
  trading: <Zap className="w-6 h-6" />,
};

const sectionColors: Record<string, string> = {
  overview: 'from-primary-500 to-primary-600',
  settings: 'from-blue-500 to-blue-600',
  concept: 'from-accent-500 to-accent-600',
  usage: 'from-green-500 to-green-600',
  warning: 'from-yellow-500 to-orange-500',
  tips: 'from-emerald-500 to-teal-500',
  calculation: 'from-purple-500 to-purple-600',
  interpretation: 'from-cyan-500 to-cyan-600',
  trading: 'from-pink-500 to-rose-500',
};

export default function ProIndicatorDocPage({ params }: { params: { slug: string } }) {
  const doc = proIndicatorDocs[params.slug];

  if (!doc) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <SectionWrapper variant="gradient" className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <Link
              href="/learn/atlas-pro"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to ATLAS PRO Documentation
            </Link>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-sm">
                <Crown className="w-4 h-4" />
                PRO Documentation
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                {doc.role}
              </span>
            </div>
          </FadeInView>

          <FadeInView delay={0.2}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {doc.title}
            </h1>
          </FadeInView>

          <FadeInView delay={0.3}>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {doc.subtitle}
            </p>
          </FadeInView>

          <FadeInView delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={doc.tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                Open on TradingView
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Table of Contents */}
      <SectionWrapper variant="dark" className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl" />

              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </span>
                Table of Contents
              </h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                {doc.sections.map((section, idx) => (
                  <a
                    key={idx}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-500/30 transition-all group"
                  >
                    <span className="text-accent-400 group-hover:text-accent-300 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {section.title}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      {/* Documentation Sections */}
      <SectionWrapper variant="dark" className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="space-y-8">
            {doc.sections.map((section, idx) => (
              <StaggerItem key={idx}>
                <section id={section.id} className="scroll-mt-28">
                  <div className="glass-card rounded-2xl border border-white/10 overflow-hidden relative">
                    {/* Section header with gradient */}
                    <div className={`p-6 md:p-8 bg-gradient-to-r ${sectionColors[section.icon] || sectionColors.overview} bg-opacity-10 border-b border-white/10 relative`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                      <div className="relative flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${sectionColors[section.icon] || sectionColors.overview} rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-white">
                            {sectionIcons[section.icon] || sectionIcons.overview}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 uppercase tracking-wider">
                            Section {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {section.title}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Section content */}
                    <div className="p-6 md:p-8">
                      <div
                        className="doc-content"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>
                </section>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Navigation */}
      <SectionWrapper variant="gradient" className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-12">
              {doc.prevIndicator ? (
                <Link
                  href={`/learn/atlas-pro/${doc.prevIndicator.slug}`}
                  className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-accent-500/50 transition-all group flex-1"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-accent-400 group-hover:-translate-x-1 transition-all" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Previous</div>
                    <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
                      {doc.prevIndicator.title}
                    </div>
                  </div>
                </Link>
              ) : <div className="flex-1" />}

              {doc.nextIndicator ? (
                <Link
                  href={`/learn/atlas-pro/${doc.nextIndicator.slug}`}
                  className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-accent-500/50 transition-all group flex-1 justify-end text-right"
                >
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Next</div>
                    <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
                      {doc.nextIndicator.title}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="text-center space-y-4">
              <Link
                href="/learn/atlas-pro"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all ATLAS PRO documentation
              </Link>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold"
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
