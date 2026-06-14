import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, UserCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Rights',
  description: 'Exercise your data protection rights with Interakktive (Shezab MediaWorx Ltd) under UK and EU GDPR — access, correction, deletion, portability, and more.',
};

export default function PrivacyRightsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Rights</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <p className="text-gray-300 leading-relaxed">
                Interakktive is a brand operated by Shezab MediaWorx Ltd. We respect your control over your
                personal data. Under the UK GDPR, the EU GDPR, and the Data Protection Act 2018, you have a
                number of rights over the information we hold about you. This page explains those rights and
                how to exercise them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Your rights</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong className="text-white">Be informed:</strong> know what data we hold, why, and who we share it with.</li>
                <li><strong className="text-white">Access:</strong> request a copy of the personal data we hold about you.</li>
                <li><strong className="text-white">Rectification:</strong> have inaccurate or incomplete data corrected.</li>
                <li><strong className="text-white">Erasure:</strong> ask us to delete your data where there is no overriding reason to keep it.</li>
                <li><strong className="text-white">Restriction:</strong> ask us to limit how we use your data.</li>
                <li><strong className="text-white">Objection:</strong> object to processing based on our legitimate interests, and opt out of marketing at any time.</li>
                <li><strong className="text-white">Portability:</strong> receive your data in a commonly used, machine-readable format.</li>
                <li><strong className="text-white">Withdraw consent:</strong> where we rely on consent, withdraw it at any time without affecting prior lawful use.</li>
                <li><strong className="text-white">No detriment:</strong> we will never treat you unfairly for exercising any of these rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">How to make a request</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To exercise any of these rights, email us using the address below. To help us respond quickly,
                please include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>The email address associated with your account</li>
                <li>A clear description of the right you wish to exercise</li>
                <li>Any details that help us locate the relevant data</li>
              </ul>

              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 mt-5 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Send your request to</p>
                  <a href="mailto:shezabmediaworxltd@gmail.com" className="text-primary-400 hover:text-primary-300">
                    shezabmediaworxltd@gmail.com
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">What to expect</h2>
              <p className="text-gray-300 leading-relaxed">
                We will respond to your request within one month, as required by law. We may need to verify
                your identity before acting, to protect your data. There is normally no charge, though we may
                decline or charge a reasonable fee for requests that are clearly unfounded or excessive, as
                permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">If you are unhappy</h2>
              <p className="text-gray-300 leading-relaxed">
                If you are not satisfied with how we handle your request, you have the right to complain to the
                UK Information Commissioner&rsquo;s Office (ICO) at ico.org.uk, or to your local data protection
                authority if you are in the EU. We would appreciate the chance to put things right first.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-4 flex-wrap">
          <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link href="/do-not-sell" className="text-primary-400 hover:text-primary-300 transition-colors">Do Not Sell</Link>
        </div>
      </div>
    </div>
  );
}
