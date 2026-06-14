import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Risk Disclaimer',
  description: 'Risk Disclaimer for Interakktive — our trading indicators are analytical tools for education and information, not financial advice.',
};

export default function DisclaimerPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Risk Disclaimer</h1>
          </div>

          <p className="text-gray-400 mb-8">Last updated: June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
              <p className="text-yellow-200 font-semibold mb-2">Trading involves risk</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Trading and investing carry a substantial risk of loss and are not suitable for everyone.
                You may lose some or all of your capital. Only trade with money you can afford to lose.
                Nothing on this site is a promise or guarantee of any particular result.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Not financial advice</h2>
              <p className="text-gray-300 leading-relaxed">
                Interakktive, a brand operated by Shezab MediaWorx Ltd, provides analytical tools and
                educational material for use on the TradingView platform. Nothing we publish — including any
                indicator, signal, dashboard, lesson, or commentary — is financial, investment, legal, tax,
                or accounting advice, and none of it is a personal recommendation to buy, sell, or hold any
                instrument. Our tools are designed to help you analyse markets and form your own view. Any
                decision you make is yours alone, and you should seek advice from a suitably qualified and
                regulated professional where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">No guaranteed results</h2>
              <p className="text-gray-300 leading-relaxed">
                We do not guarantee profits, accuracy, or any specific outcome. Past performance, and any
                historical or example output shown, is not a reliable indicator of future results. Markets
                change, and a tool that performed well in one period may perform poorly in another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Hypothetical and example results</h2>
              <p className="text-gray-300 leading-relaxed">
                Any backtests, sample charts, screenshots, or illustrative figures are hypothetical and shown
                for education only. Hypothetical results have inherent limitations: they are prepared with the
                benefit of hindsight, do not involve real money or real execution, and cannot fully account
                for market conditions such as liquidity, slippage, fees, or emotional decision-making. They do
                not represent actual trading and should not be relied upon as a prediction of live performance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">You are responsible for your decisions</h2>
              <p className="text-gray-300 leading-relaxed">
                We do not have access to your brokerage accounts, we do not place trades for you, and we do
                not monitor your positions. You are solely responsible for how you use our tools and for every
                trading and investment decision you make. Always do your own research and verify any data
                independently before acting on it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Data and platform differences</h2>
              <p className="text-gray-300 leading-relaxed">
                Our indicators run on third-party platforms and rely on third-party market data. Figures and
                outputs may differ from those on other charting or brokerage platforms because of differences
                in data feeds, timing, rounding, or calculation methods. All data is provided &ldquo;as is&rdquo;
                and should be independently verified before use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">TradingView</h2>
              <p className="text-gray-300 leading-relaxed">
                Our indicators are built for and displayed on TradingView. TradingView&reg; is a registered
                trademark of TradingView, Inc., and is not affiliated with, and does not endorse, Interakktive
                or Shezab MediaWorx Ltd.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Questions</h2>
              <p className="text-gray-300 leading-relaxed">Contact us at:</p>
              <p className="text-primary-400 mt-2">shezabmediaworxltd@gmail.com</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-4 flex-wrap">
          <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">Terms of Service</Link>
          <span className="text-gray-600">|</span>
          <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
