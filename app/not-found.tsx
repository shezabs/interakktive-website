'use client';

import Link from 'next/link';
import { Home, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { FadeIn, HoverScale, AnimatedBackground } from './components/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <AnimatedBackground showParticles={false} />
      <div className="max-w-2xl mx-auto px-4 text-center relative">
        <FadeIn>
          <div className="mb-8">
            <span className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Page Not Found
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-xl text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <HoverScale>
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all flex items-center gap-2 font-semibold"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </HoverScale>
            <HoverScale>
              <Link
                href="/indicators"
                className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 font-semibold"
              >
                <TrendingUp className="w-5 h-5" />
                Browse Indicators
              </Link>
            </HoverScale>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-primary-400" />
              Looking for something specific?
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link
                href="/indicators"
                className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2 justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                Free Indicators
              </Link>
              <Link
                href="/atlas-pro"
                className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2 justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                ATLAS PRO Suite
              </Link>
              <Link
                href="/signup"
                className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2 justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                Create Account
              </Link>
              <Link
                href="/signin"
                className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2 justify-center"
              >
                <ArrowRight className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
