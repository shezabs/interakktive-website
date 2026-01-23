'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, User, Crown, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AccessRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  tradingview_username: string;
  message: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ tradingview_username: string | null } | null>(null);
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [tradingViewUsername, setTradingViewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.push('/signin');
          return;
        }

        setUser(currentUser);

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('tradingview_username')
          .eq('id', currentUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setTradingViewUsername(profileData.tradingview_username || '');
        }

        // Get existing access request
        const { data: requestData } = await supabase
          .from('pro_access_requests')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (requestData) {
          setAccessRequest(requestData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!tradingViewUsername.trim()) {
      setError('TradingView username is required');
      setSubmitting(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('pro_access_requests')
        .insert({
          user_id: user!.id,
          user_email: user!.email!,
          tradingview_username: tradingViewUsername.trim(),
          message: message.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setAccessRequest(data);
      setShowRequestForm(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your account and access requests</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* ATLAS PRO Access */}
            <div className="glass p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-accent-400" />
                <h2 className="text-2xl font-bold">ATLAS PRO Access</h2>
              </div>

              {!accessRequest && !showRequestForm && (
                <div>
                  <p className="text-gray-300 mb-6">
                    Request access to our invite-only ATLAS PRO indicator suite. Once approved,
                    you'll receive a TradingView invite to access these premium indicators.
                  </p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold"
                  >
                    Request Access
                  </button>
                </div>
              )}

              {accessRequest?.status === 'pending' && (
                <div className="flex items-start gap-4 p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-400 mb-1">Request Pending</h3>
                    <p className="text-gray-300">
                      Your access request is under review. We'll send you an email once it's been processed.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Submitted: {new Date(accessRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {accessRequest?.status === 'approved' && (
                <div className="flex items-start gap-4 p-6 bg-primary-500/10 border border-primary-500/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-400 mb-1">Access Approved!</h3>
                    <p className="text-gray-300 mb-4">
                      Check your email for the TradingView invite link to access ATLAS PRO indicators.
                    </p>
                    <a
                      href="https://www.tradingview.com/u/Interakktive/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View on TradingView
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {accessRequest?.status === 'rejected' && (
                <div className="flex items-start gap-4 p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-1">Request Not Approved</h3>
                    <p className="text-gray-300">
                      Your request couldn't be approved at this time. Please contact support for more information.
                    </p>
                  </div>
                </div>
              )}

              {/* Request Form */}
              {showRequestForm && (
                <div className="p-6 bg-black/40 border border-white/10 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Request ATLAS PRO Access</h3>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                      <label htmlFor="tvUsername" className="block text-sm font-medium mb-2">
                        TradingView Username *
                      </label>
                      <input
                        id="tvUsername"
                        type="text"
                        value={tradingViewUsername}
                        onChange={(e) => setTradingViewUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="Your TradingView username"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        We'll send the invite to this TradingView account
                      </p>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Tell us about your trading (optional)
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-none"
                        placeholder="Trading experience, markets you trade, why you're interested in ATLAS PRO, etc."
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRequestForm(false)}
                        className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Free Indicators */}
            <div className="glass p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Free Indicators</h2>
              <p className="text-gray-300 mb-6">
                Access all 8 free indicators on TradingView. No approval needed.
              </p>
              <Link
                href="/indicators"
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                View All Free Indicators
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="glass p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold">Account</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                {profile?.tradingview_username && (
                  <div>
                    <p className="text-gray-400">TradingView</p>
                    <p className="text-white">{profile.tradingview_username}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">Member since</p>
                  <p className="text-white">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/indicators"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Free Indicators
                </Link>
                <Link
                  href="/atlas-pro"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  ATLAS PRO
                </Link>
                <a
                  href="https://www.tradingview.com/u/Interakktive/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  TradingView Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
