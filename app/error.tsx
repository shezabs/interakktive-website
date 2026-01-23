'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="glass p-8 rounded-lg">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-6">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 glass rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
