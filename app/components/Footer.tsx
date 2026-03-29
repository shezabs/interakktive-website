import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Youtube, Instagram } from 'lucide-react';

// Discord icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
    </svg>
  );
}

// Facebook icon component
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="h-14 overflow-hidden flex items-center">
              <Image
                src="/images/logo.png"
                alt="Interakktive"
                width={400}
                height={300}
                className="w-44 h-auto -my-4 -ml-2 object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Intelligence You Can See.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/atlas-pro" className="text-gray-400 hover:text-white text-sm transition-colors">
                  ATLAS PRO Suite
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/indicators" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Free Indicators
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/learn" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://www.tradingview.com/u/Interakktive/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  TradingView Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Community</h4>
            <div className="flex space-x-4">
              <a
                href="https://discord.gg/dcDqu3aB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/interakktive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="X / Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@Interakktive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/interakktive/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@interakktive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577447110648"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 Shezab MediaWorx Ltd. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
