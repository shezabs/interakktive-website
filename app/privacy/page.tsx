import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Interakktive — how Shezab MediaWorx Ltd collects, uses, and protects your personal information under UK GDPR and the EU GDPR.',
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

          <p className="text-gray-400 mb-8">Last updated: June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Who we are</h2>
              <p className="text-gray-300 leading-relaxed">
                Interakktive is a brand operated by <strong className="text-white">Shezab MediaWorx Ltd</strong>,
                a company registered in England and Wales (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
                We are the data controller responsible for your personal information. This Privacy Policy
                explains how we collect, use, share, and protect your personal data when you visit our
                website and use our services, and your rights under the UK General Data Protection
                Regulation (UK GDPR), the EU GDPR, and the Data Protection Act 2018.
              </p>
              <p className="text-gray-400 leading-relaxed mt-3 text-sm">
                Registered in England and Wales, company number <strong className="text-white">16364787</strong>.
                Registered office: Apartment 45 Dock Office, Furness Quay, Salford, England, M50 3AA. Contact:{' '}
                <span className="text-primary-400">shezabmediaworxltd@gmail.com</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Information we collect</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Account information:</strong> email address, password (stored encrypted), and display name when you create an account.</li>
                <li><strong className="text-white">TradingView username:</strong> when you request access to ATLAS PRO indicators.</li>
                <li><strong className="text-white">Payment information:</strong> when you subscribe, payment is processed by Stripe. We do not store your full card details; we receive limited billing data such as your subscription status and the last four digits of your card.</li>
                <li><strong className="text-white">Academy and profile data:</strong> lesson progress, certificates earned, and any public trader profile you choose to create.</li>
                <li><strong className="text-white">Communications:</strong> any messages, support requests, or feedback you send us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Information collected automatically</h2>
              <p className="text-gray-300 leading-relaxed mb-4">When you visit our website we may automatically collect limited technical data:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Device and browser information (type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Pages visited and basic usage information</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                We do <strong className="text-white">not</strong> currently use analytics or advertising cookies.
                See our <Link href="/cookies" className="text-primary-400 hover:text-primary-300 underline">Cookie Policy</Link> for details
                on the cookies we do use and how to manage your choices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. How we use your information and our legal bases</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Under data protection law we must have a lawful basis for processing your personal data.
                We rely on the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Performance of a contract:</strong> to create and manage your account, process your subscription, and grant indicator access on TradingView.</li>
                <li><strong className="text-white">Legitimate interests:</strong> to operate, secure, and improve our website and services, and to respond to your enquiries — balanced against your rights.</li>
                <li><strong className="text-white">Consent:</strong> to send you optional marketing communications and to set any non-essential cookies. You may withdraw consent at any time.</li>
                <li><strong className="text-white">Legal obligation:</strong> to comply with our legal and regulatory duties, including tax and accounting requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data storage, security and retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We use Supabase to store account and application data, with encryption in transit and at rest.
                We apply appropriate technical and organisational measures to protect your personal information
                against unauthorised access, alteration, disclosure, or destruction.
              </p>
              <p className="text-gray-300 leading-relaxed mt-3">
                We keep your personal data only for as long as necessary for the purposes set out in this
                policy. Account data is retained for the life of your account and for a reasonable period
                afterwards; billing records are kept as required by law (typically six years for UK tax purposes).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Third parties we share data with</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We share personal data only with service providers (processors) who help us run our services,
                under contracts that require them to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Supabase:</strong> authentication and database hosting.</li>
                <li><strong className="text-white">Stripe:</strong> payment processing and subscription billing.</li>
                <li><strong className="text-white">TradingView:</strong> to grant indicator access — we share only your TradingView username.</li>
                <li><strong className="text-white">Resend:</strong> to send transactional emails (such as account and billing notifications).</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                We do not sell your personal data to anyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. International data transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Some of our service providers may process your data outside the UK or European Economic Area.
                Where they do, we rely on appropriate safeguards — such as the UK International Data Transfer
                Agreement, the EU Standard Contractual Clauses, or adequacy decisions — to ensure your data
                receives an equivalent level of protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Your rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">Under UK and EU data protection law you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate or incomplete data</li>
                <li>Request erasure of your data (the &ldquo;right to be forgotten&rdquo;)</li>
                <li>Restrict or object to our processing of your data</li>
                <li>Data portability — receive your data in a portable format</li>
                <li>Withdraw consent at any time, where we rely on consent</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3">
                To exercise any of these rights, contact us at{' '}
                <span className="text-primary-400">shezabmediaworxltd@gmail.com</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Your right to complain</h2>
              <p className="text-gray-300 leading-relaxed">
                If you are unhappy with how we have handled your personal data, you can lodge a complaint with
                the UK Information Commissioner&rsquo;s Office (ICO) at <span className="text-primary-400">ico.org.uk</span>,
                or with your local data protection authority if you are in the EU. We would, however, appreciate
                the chance to address your concerns first.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Children&rsquo;s privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect
                personal information from children. If you believe we have collected information from a minor,
                please contact us immediately and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to this policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will post the updated policy on this
                page and revise the &ldquo;Last updated&rdquo; date. We encourage you to review it periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact us</h2>
              <p className="text-gray-300 leading-relaxed">
                For any questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <p className="text-primary-400 mt-2">shezabmediaworxltd@gmail.com</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-4">
          <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/cookies" className="text-primary-400 hover:text-primary-300 transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
