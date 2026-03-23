'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="glass p-8 rounded-xl">
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
              <p className="text-gray-400 text-sm mb-6">
                We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>.
                Click the link in the email to set a new password.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
