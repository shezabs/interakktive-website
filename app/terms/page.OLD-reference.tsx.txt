import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Interakktive - Read our terms and conditions for using our trading indicators and services.',
};

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Agreement to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using Interakktive's website and services, including our TradingView indicators
                ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree
                to these Terms, please do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Interakktive provides trading indicators and analytical tools for use on the TradingView platform.
                Our Services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Free trading indicators available on TradingView</li>
                <li>ATLAS PRO suite of premium indicators (invite-only access)</li>
                <li>Educational content and documentation</li>
                <li>User account management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">To access certain features, you may need to create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update any changes to your information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Important Disclaimers</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-200 font-semibold mb-2">Trading Risk Warning</p>
                <p className="text-gray-300 text-sm">
                  Trading in financial markets involves substantial risk and may not be suitable for all investors.
                  Past performance is not indicative of future results.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Our indicators are tools for analysis, not financial advice</li>
                <li>We do not guarantee any specific trading results or profits</li>
                <li>You are solely responsible for your trading decisions</li>
                <li>Always conduct your own research before trading</li>
                <li>Never trade with money you cannot afford to lose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All content, indicators, code, designs, and materials on our platform are owned by Interakktive
                and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Copy, modify, or distribute our indicators or code</li>
                <li>Reverse engineer or decompile our software</li>
                <li>Remove any copyright or proprietary notices</li>
                <li>Use our trademarks without written permission</li>
                <li>Resell or redistribute access to our indicators</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Use our Services for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our Services</li>
                <li>Share your account access with others</li>
                <li>Use automated systems to access our Services without permission</li>
                <li>Misrepresent your identity or affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. ATLAS PRO Access</h2>
              <p className="text-gray-300 leading-relaxed mb-4">ATLAS PRO indicators are provided on an invite-only basis. We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Approve or deny access requests at our discretion</li>
                <li>Revoke access for violations of these Terms</li>
                <li>Modify or discontinue ATLAS PRO features</li>
                <li>Introduce pricing for premium features in the future</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INTERAKKTIVE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS
                OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OUR SERVICES OR
                ANY TRADING DECISIONS MADE BASED ON OUR INDICATORS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed">
                OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED,
                SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Indemnification</h2>
              <p className="text-gray-300 leading-relaxed">
                You agree to indemnify and hold harmless Interakktive and its officers, directors, employees,
                and agents from any claims, damages, losses, or expenses arising from your use of our Services
                or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your access to our Services immediately, without prior notice,
                for any reason, including breach of these Terms. Upon termination, your right to use our
                Services will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of significant
                changes by posting the updated Terms on our website. Your continued use of our Services after
                such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">13. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">14. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-primary-400 mt-2">support@interakktive.com</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/privacy"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
