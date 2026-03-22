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
    default: 'Interakktive - Trading Intelligence You Can See | ATLAS PRO Suite',
    template: '%s | Interakktive'
  },
  description: 'The ATLAS suite: diagnostic trading indicators for TradingView that show you WHY, not just what. Signal intelligence, market structure, momentum analysis, and multi-ticker screening — all in plain English.',
  keywords: ['trading indicators', 'TradingView', 'ATLAS suite', 'smart money concepts', 'market structure', 'trading signals', 'momentum analysis', 'order blocks', 'Pine Script', 'diagnostic trading', 'Ghost Performance', 'narrative engine'],
  authors: [{ name: 'Interakktive' }],
  creator: 'Interakktive',
  publisher: 'Interakktive Ltd',
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
    title: 'Interakktive - Trading Intelligence You Can See',
    description: 'The ATLAS suite: diagnostic trading indicators for TradingView. Signals, structure, momentum, and screening — all explained in plain English.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interakktive - Trading Intelligence You Can See',
    description: 'The ATLAS suite for TradingView. We show you WHY, not just what.',
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
