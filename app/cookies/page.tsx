'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useConsent } from '@/app/components/CookieConsent';

export default function CookiePolicyPage() {
  const { openPreferences } = useConsent();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Cookie Policy</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. What are cookies?</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files placed on your device when you visit a website. They are widely
                used to make websites work, to remember your preferences, and to provide information to site
                owners. This policy explains how Interakktive, a brand operated by Shezab MediaWorx Ltd,
                uses cookies and similar technologies, and how you can control them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. The cookies we use</h2>

              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 mb-4">
                <p className="text-white font-semibold mb-2">Strictly necessary cookies (always active)</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  These are essential for the website to function and cannot be switched off. They include
                  cookies that keep you signed in, protect security, and remember your cookie preferences.
                  Because they are strictly necessary, they do not require your consent. They do not track
                  you for advertising.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 mb-4">
                <p className="text-white font-semibold mb-2">Analytics cookies (optional — off by default)</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  These would help us understand how visitors use the site so we can improve it.{' '}
                  <strong className="text-white">We do not currently use any analytics cookies.</strong>{' '}
                  This category is shown for transparency; if we introduce analytics in future, they will
                  only run after you opt in.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5">
                <p className="text-white font-semibold mb-2">Marketing cookies (optional — off by default)</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  These would be used to measure and tailor promotions.{' '}
                  <strong className="text-white">We do not currently use any marketing cookies.</strong>{' '}
                  This category is shown for transparency; if we introduce them in future, they will only
                  run after you opt in.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Third-party services</h2>
              <p className="text-gray-300 leading-relaxed">
                Some essential functions are provided by trusted third parties — such as Supabase
                (authentication) and Stripe (payments) — which may set their own strictly necessary cookies
                when you sign in or check out. These are required to deliver the service you have requested.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Managing your choices</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You can change your optional cookie choices at any time. Your choice is remembered for up to
                six months, after which we will ask again.
              </p>
              <button
                onClick={openPreferences}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Cookie className="w-4 h-4" />
                Open cookie settings
              </button>
              <p className="text-gray-400 leading-relaxed mt-4 text-sm">
                You can also block or delete cookies through your browser settings, though some essential
                features may not work if you block strictly necessary cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Contact us</h2>
              <p className="text-gray-300 leading-relaxed">
                Questions about our use of cookies? Contact us at:
              </p>
              <p className="text-primary-400 mt-2">shezabmediaworxltd@gmail.com</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
