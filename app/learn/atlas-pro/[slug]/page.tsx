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
              Back to ATLAS Pro Documentation
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{doc.title}</h1>
          </FadeInView>

          <FadeInView delay={0.3}>
            <p className="text-lg text-gray-300 mb-6">{doc.subtitle}</p>
          </FadeInView>

          <FadeInView delay={0.4}>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{doc.lines} lines</span>
              <a
                href={doc.tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm"
              >
                View on TradingView <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Table of Contents */}
      <SectionWrapper variant="dark" className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contents</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {doc.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors py-1"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Documentation Sections */}
      {doc.sections.map((section, index) => (
        <div key={section.id}>
          <SectionWrapper variant={index % 2 === 0 ? 'dark' : 'gradient'} className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeInView>
                <div className="flex items-start gap-4 mb-8" id={section.id}>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${sectionColors[section.icon] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                    {sectionIcons[section.icon] || <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{section.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Section {index + 1} of {doc.sections.length}</p>
                  </div>
                </div>
              </FadeInView>

              <FadeInView delay={0.1}>
                <div
                  className="prose prose-invert prose-lg max-w-none
                    prose-headings:text-white prose-headings:font-semibold
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-h4:text-lg prose-h4:text-gray-300 prose-h4:mt-6 prose-h4:mb-2
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-li:text-gray-300
                    prose-strong:text-white
                    prose-em:text-gray-200
                    prose-code:text-primary-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
                    prose-ul:space-y-1
                    prose-ol:space-y-1"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </FadeInView>
            </div>
          </SectionWrapper>
          <GradientDivider />
        </div>
      ))}

      {/* Navigation */}
      <SectionWrapper variant="dark" className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {doc.prevIndicator ? (
              <Link
                href={`/learn/atlas-pro/${doc.prevIndicator.slug}`}
                className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500">Previous</p>
                  <p className="font-medium">{doc.prevIndicator.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {doc.nextIndicator ? (
              <Link
                href={`/learn/atlas-pro/${doc.nextIndicator.slug}`}
                className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-right"
              >
                <div>
                  <p className="text-xs text-gray-500">Next</p>
                  <p className="font-medium">{doc.nextIndicator.title}</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
