import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import GlobalUI from './components/GlobalUI'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://interakktive.com'),
  title: {
    default: 'Interakktive - AI-Powered Trading Indicators for TradingView',
    template: '%s | Interakktive'
  },
  description: 'Advanced AI and machine learning-enabled trading indicators for TradingView. 8 free professional-grade indicators plus ATLAS PRO suite for institutional-quality analytics.',
  keywords: ['trading indicators', 'TradingView', 'AI trading', 'machine learning trading', 'technical analysis', 'market analysis', 'ATLAS PRO', 'regime detection', 'risk management', 'trading signals'],
  authors: [{ name: 'Interakktive' }],
  creator: 'Interakktive',
  publisher: 'Interakktive',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://interakktive.com',
    siteName: 'Interakktive',
    title: 'Interakktive - AI-Powered Trading Indicators for TradingView',
    description: 'Advanced AI and machine learning-enabled trading indicators for TradingView. 8 free professional-grade indicators plus ATLAS PRO suite.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interakktive - AI-Powered Trading Indicators',
    description: 'Advanced AI and ML-enabled trading indicators for TradingView. Free and Pro indicators for technical analysis.',
  },
  alternates: {
    canonical: 'https://interakktive.com',
  },
  category: 'Finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalUI />
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
