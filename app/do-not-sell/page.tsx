import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldOff, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Do Not Sell My Information',
  description: 'Interakktive (Shezab MediaWorx Ltd) does not sell or share your personal information. Learn what this means and how to contact us.',
};

export default function DoNotSellPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <ShieldOff className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Do Not Sell My Information</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <div className="bg-white/[0.02] border border-primary-500/20 rounded-lg p-5">
              <p className="text-white font-semibold mb-2">We do not sell your personal information</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Interakktive, a brand operated by Shezab MediaWorx Ltd, does not sell your personal information,
                and does not share it for money or for cross-context behavioural advertising. There is no
                opt-out for you to make here, because there is no selling or sharing to opt out of.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">What this means</h2>
              <p className="text-gray-300 leading-relaxed">
                Some jurisdictions, such as California, give residents the right to opt out of the &ldquo;sale&rdquo;
                or &ldquo;sharing&rdquo; of their personal information. We want to be clear and honest: we do not
                engage in those activities. We only share personal data with the service providers we need to
                run our business — such as hosting, payment processing, indicator access, and email delivery —
                and only so they can perform those services for us under contract. We never trade, rent, or
                sell your data for profit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Your broader privacy rights</h2>
              <p className="text-gray-300 leading-relaxed">
                Whatever your location, you can still ask us to access, correct, delete, or stop processing
                your personal data. These rights, and how to use them, are explained on our{' '}
                <Link href="/privacy-rights" className="text-primary-400 hover:text-primary-300 underline">Privacy Rights</Link>{' '}
                page, and in full in our{' '}
                <Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline">Privacy Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Contact us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions about how we handle your personal information, contact us:
              </p>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <a href="mailto:shezabmediaworxltd@gmail.com" className="text-primary-400 hover:text-primary-300">
                  shezabmediaworxltd@gmail.com
                </a>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-4 flex-wrap">
          <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link href="/privacy-rights" className="text-primary-400 hover:text-primary-300 transition-colors">Privacy Rights</Link>
        </div>
      </div>
    </div>
  );
}
