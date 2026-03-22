'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, BookOpen } from 'lucide-react';
import { getFreeIndicators } from '@/app/lib/indicators-data';
import { FadeIn, FadeInView, StaggerContainer, StaggerItem, HoverScale, AnimatedCounter, ImageLightbox, SectionWrapper, GradientDivider } from '@/app/components/animations';

export default function IndicatorsPage() {
  const indicators = getFreeIndicators();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header Section */}
      <SectionWrapper variant="gradient" className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Free <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Indicators</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade trading indicators available for free on TradingView.
              No signup required - add them to your charts instantly.
            </p>
          </FadeIn>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* Indicators Grid Section */}
      <SectionWrapper variant="dark" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {indicators.map((indicator) => (
              <StaggerItem key={indicator.id}>
                <HoverScale scale={1.01}>
                  <div className="glass-card rounded-lg overflow-hidden h-full">
                  {/* Thumbnail */}
                  {indicator.image && (
                    <div className="aspect-video overflow-hidden border-b border-white/10">
                      <ImageLightbox
                        src={indicator.image}
                        alt={`${indicator.shortTitle} preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold">{indicator.shortTitle}</h2>
                      <a
                        href={indicator.tradingViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2 text-sm flex-shrink-0"
                      >
                        Add to Chart
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-6 line-clamp-3">{indicator.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-6 text-sm flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Favorites:</span>
                        <span className="text-white font-semibold">
                          <AnimatedCounter value={indicator.stats.favorites} />
                        </span>
                      </div>
                      {indicator.stats.uses && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Uses:</span>
                          <span className="text-white font-semibold">
                            <AnimatedCounter value={indicator.stats.uses} />
                          </span>
                        </div>
                      )}
                      {indicator.stats.views && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Views:</span>
                          <span className="text-white font-semibold">
                            <AnimatedCounter value={indicator.stats.views} />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features Preview */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Features:</h3>
                      <ul className="space-y-1">
                        {indicator.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-primary-400 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <Link
                        href={`/indicators/${indicator.id}`}
                        className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Learn more
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/learn/free-indicators/${indicator.id}`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        Documentation
                      </Link>
                    </div>
                  </div>
                </div>
              </HoverScale>
            </StaggerItem>
          ))}
          </StaggerContainer>
        </div>
      </SectionWrapper>

      <GradientDivider />

      {/* CTA Section */}
      <SectionWrapper variant="gradient" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInView>
            <HoverScale scale={1.01}>
              <div className="text-center glass-card p-12 rounded-lg">
                <h2 className="text-3xl font-bold mb-4">
                  Want the Full Intelligence Stack?
                </h2>
                <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                  The ATLAS PRO suite adds signal intelligence, market structure, momentum analysis, and multi-ticker screening — all with plain English explanations.
                </p>
                <HoverScale className="inline-block">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all text-lg font-semibold text-white"
                  >
                    View Pricing
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </HoverScale>
              </div>
            </HoverScale>
          </FadeInView>
        </div>
      </SectionWrapper>
    </div>
  );
}
