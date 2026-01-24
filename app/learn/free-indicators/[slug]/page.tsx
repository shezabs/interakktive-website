'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Settings, Lightbulb, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { SectionWrapper, GradientDivider, FadeInView } from '@/app/components/animations';
import { indicatorDocs, type IndicatorDoc } from '@/app/lib/indicator-docs';

export default function IndicatorDocPage({ params }: { params: { slug: string } }) {
  const doc = indicatorDocs[params.slug];

  if (!doc) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <SectionWrapper variant="gradient" className="pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/learn/free-indicators"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Free Indicators
          </Link>

          <FadeInView>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Documentation
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {doc.title}
            </h1>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="text-lg text-gray-300">
              {doc.subtitle}
            </p>
          </FadeInView>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Table of Contents */}
      <SectionWrapper variant="dark" className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {doc.sections.map((section, idx) => (
                <a
                  key={idx}
                  href={`#${section.id}`}
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm py-1"
                >
                  {idx + 1}. {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </SectionWrapper>

      {/* Documentation Sections */}
      <SectionWrapper variant="dark" className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {doc.sections.map((section, idx) => (
            <section key={idx} id={section.id} className="scroll-mt-24">
              <div className="glass-card p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  {section.icon === 'overview' && <BookOpen className="w-6 h-6 text-primary-400" />}
                  {section.icon === 'settings' && <Settings className="w-6 h-6 text-primary-400" />}
                  {section.icon === 'concept' && <Lightbulb className="w-6 h-6 text-accent-400" />}
                  {section.icon === 'usage' && <Target className="w-6 h-6 text-green-400" />}
                  {section.icon === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-400" />}
                  {section.icon === 'tips' && <CheckCircle className="w-6 h-6 text-blue-400" />}
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-300 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Navigation */}
      <SectionWrapper variant="gradient" className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {doc.prevIndicator && (
              <Link
                href={`/learn/free-indicators/${doc.prevIndicator.slug}`}
                className="glass-card p-4 rounded-lg flex items-center gap-3 hover:border-primary-500/50 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="text-sm font-medium group-hover:text-primary-400 transition-colors">
                    {doc.prevIndicator.title}
                  </div>
                </div>
              </Link>
            )}
            {doc.nextIndicator && (
              <Link
                href={`/learn/free-indicators/${doc.nextIndicator.slug}`}
                className="glass-card p-4 rounded-lg flex items-center gap-3 hover:border-primary-500/50 transition-all group ml-auto"
              >
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next</div>
                  <div className="text-sm font-medium group-hover:text-primary-400 transition-colors">
                    {doc.nextIndicator.title}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 glass-card p-8 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-3">Ready to use this indicator?</h3>
            <p className="text-gray-400 mb-6">
              Add it to your TradingView charts for free. No signup required.
            </p>
            <a
              href={doc.tradingViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold"
            >
              Open on TradingView
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
