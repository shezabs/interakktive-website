import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Interakktive - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Interakktive ("we," "our," or "us"). We are committed to protecting your personal information
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Account Information:</strong> Email address, password (encrypted), and display name when you create an account.</li>
                <li><strong className="text-white">TradingView Username:</strong> When requesting access to ATLAS PRO indicators.</li>
                <li><strong className="text-white">Trading Experience:</strong> Information you voluntarily provide about your trading background.</li>
                <li><strong className="text-white">Communications:</strong> Any messages or feedback you send to us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Automatically Collected Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">When you visit our website, we may automatically collect:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referring website or source</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Create and manage your account</li>
                <li>Process your requests for indicator access on TradingView</li>
                <li>Send you updates about our indicators and services</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Storage and Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We use Supabase, a secure database platform, to store your information. Your data is encrypted in transit
                and at rest. We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We may use third-party services that collect information, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Supabase:</strong> Authentication and database services</li>
                <li><strong className="text-white">TradingView:</strong> To grant indicator access (we only share your TradingView username)</li>
                <li><strong className="text-white">Analytics services:</strong> To understand website usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use essential cookies to maintain your session and preferences. We do not use tracking cookies
                for advertising purposes. You can configure your browser to refuse cookies, but some features of
                our website may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect
                personal information from children. If you believe we have collected information from a minor,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review
                this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-primary-400 mt-2">support@interakktive.com</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/terms"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            View Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
