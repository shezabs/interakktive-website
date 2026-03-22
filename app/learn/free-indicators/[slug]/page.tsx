'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Settings, Lightbulb, Target, AlertTriangle, CheckCircle, ExternalLink, Calculator, BarChart3, Zap } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView, StaggerContainer, StaggerItem } from '@/app/components/animations';
import { indicatorDocs } from '@/app/lib/indicator-docs';

// Icon mapping for sections
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

// Color mapping for section icons
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

export default function IndicatorDocPage({ params }: { params: { slug: string } }) {
  const doc = indicatorDocs[params.slug];

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
              href="/learn/free-indicators"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Free Indicators
            </Link>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Complete Documentation
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

          {/* Quick action button */}
          <FadeInView delay={0.4}>
            <div className="mt-8">
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
              {/* Subtle glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />

              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </span>
                Table of Contents
              </h2>
              <nav className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                {doc.sections.map((section, idx) => (
                  <a
                    key={idx}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-500/30 transition-all group"
                  >
                    <span className="text-primary-400 group-hover:text-primary-300 transition-colors">
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
          {/* Prev/Next navigation */}
          <FadeInView>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-12">
              {doc.prevIndicator ? (
                <Link
                  href={`/learn/free-indicators/${doc.prevIndicator.slug}`}
                  className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-primary-500/50 transition-all group flex-1"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-400 group-hover:-translate-x-1 transition-all" />
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
                  href={`/learn/free-indicators/${doc.nextIndicator.slug}`}
                  className="glass-card p-5 rounded-xl flex items-center gap-4 hover:border-primary-500/50 transition-all group flex-1 justify-end text-right"
                >
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Next</div>
                    <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
                      {doc.nextIndicator.title}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </FadeInView>

          {/* CTA Card */}
          <FadeInView delay={0.1}>
            <div className="glass-card p-8 md:p-12 rounded-2xl text-center relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to use this indicator?</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Add it to your TradingView charts for free. No signup required. Start analyzing markets smarter today.
                </p>
                <a
                  href={doc.tradingViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
                >
                  Open on TradingView
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      {/* Custom styles for documentation content */}
      <style jsx global>{`
        .doc-content {
          color: #d1d5db;
          line-height: 1.8;
        }

        .doc-content p {
          margin-bottom: 1.25rem;
        }

        .doc-content h3 {
          font-size: 1.375rem;
          font-weight: 700;
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .doc-content h3::before {
          content: '';
          width: 4px;
          height: 1.25rem;
          background: linear-gradient(to bottom, #8b5cf6, #06b6d4);
          border-radius: 2px;
        }

        .doc-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #c4b5fd;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .doc-content ul {
          margin-bottom: 1.25rem;
          padding-left: 0;
          list-style: none;
        }

        .doc-content ul li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
          color: #d1d5db;
        }

        .doc-content ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.6rem;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          border-radius: 50%;
        }

        .doc-content strong {
          color: white;
          font-weight: 600;
        }

        .doc-content em {
          color: #a78bfa;
          font-style: italic;
        }

        .doc-content pre {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9rem;
          color: #06b6d4;
        }

        .doc-content a {
          color: #8b5cf6;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .doc-content a:hover {
          color: #a78bfa;
        }

        /* First paragraph emphasis */
        .doc-content > p:first-child {
          font-size: 1.125rem;
          color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
