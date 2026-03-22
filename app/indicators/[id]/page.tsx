'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, TrendingUp, Target, Lightbulb, BookOpen } from 'lucide-react';
import { getIndicatorById, getFreeIndicators } from '@/app/lib/indicators-data';
import { ImageLightbox, FadeIn, FadeInView, StaggerContainer, StaggerItem, SectionWrapper, GradientDivider } from '@/app/components/animations';

export default function IndicatorDetailPage({ params }: { params: { id: string } }) {
  const indicator = getIndicatorById(params.id);

  if (!indicator || indicator.isPro) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header Section */}
      <SectionWrapper variant="gradient" className="pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Back Link */}
          <Link
            href="/indicators"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all indicators
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{indicator.title}</h1>
            <p className="text-xl text-gray-300 mb-6">{indicator.description}</p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <a
                href={indicator.tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all flex items-center gap-2 font-semibold"
              >
                Add to TradingView
                <ExternalLink className="w-5 h-5" />
              </a>
              <Link
                href={`/learn/free-indicators/${indicator.id}`}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2 font-semibold"
              >
                <BookOpen className="w-5 h-5" />
                Read Documentation
              </Link>
            </div>
          </div>

          {/* Screenshot */}
          {indicator.image && (
            <FadeInView className="rounded-lg overflow-hidden border border-white/10">
              <ImageLightbox
                src={indicator.image}
                alt={`${indicator.shortTitle} screenshot`}
                className="w-full h-auto"
              />
            </FadeInView>
          )}
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Content Sections */}
      <SectionWrapper variant="dark" className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Features Section */}
          <section className="mb-12 glass-card p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold">Key Features</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicator.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary-400 mt-1">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Use Cases Section */}
          <section className="mb-12 glass-card p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-accent-400" />
              <h2 className="text-2xl font-bold">Use Cases</h2>
            </div>
            <ul className="space-y-4">
              {indicator.useCases.map((useCase, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-accent-400 mt-1">→</span>
                  <span className="text-gray-300">{useCase}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Technical Details Section */}
          {indicator.technicalDetails && (
            <section className="mb-12 glass-card p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-primary-400" />
                <h2 className="text-2xl font-bold">Technical Details</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{indicator.technicalDetails}</p>
            </section>
          )}
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* CTA Section */}
      <SectionWrapper variant="gradient" className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="glass-card p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to try it?</h3>
            <p className="text-gray-300 mb-6">
              Add this indicator to your TradingView charts for free. No signup required.
            </p>
            <a
              href={indicator.tradingViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all text-lg font-semibold"
            >
              Open on TradingView
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* Explore More */}
          <div className="mt-12 pt-12 border-t border-white/10">
            <h3 className="text-2xl font-bold mb-6">Explore More Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getFreeIndicators()
                .filter((ind) => ind.id !== indicator.id)
                .slice(0, 2)
                .map((ind) => (
                  <Link
                    key={ind.id}
                    href={`/indicators/${ind.id}`}
                    className="glass-card p-6 rounded-lg transition-all group"
                  >
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                      {ind.shortTitle}
                    </h4>
                    <p className="text-gray-400 line-clamp-2 mb-3">{ind.description}</p>
                    <span className="text-primary-400 text-sm">Learn more →</span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
