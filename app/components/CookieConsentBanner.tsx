'use client';

// ==========================================================================
// Cookie Consent Banner + Preferences Modal (UI layer).
// Reads/writes consent via useConsent(). On-brand: dark glass, teal accent.
// ==========================================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { useConsent } from './CookieConsent';

export default function CookieConsentBanner() {
  const {
    consent,
    hasChosen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    isPreferencesOpen,
    closePreferences,
  } = useConsent();

  // Local draft state for the preferences modal toggles
  const [draftAnalytics, setDraftAnalytics] = useState(consent.analytics);
  const [draftMarketing, setDraftMarketing] = useState(consent.marketing);

  useEffect(() => {
    setDraftAnalytics(consent.analytics);
    setDraftMarketing(consent.marketing);
  }, [consent.analytics, consent.marketing, isPreferencesOpen]);

  const showBanner = !hasChosen && !isPreferencesOpen;

  return (
    <>
      {/* ---------- Bottom banner (first visit) ---------- */}
      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4"
        >
          <div className="max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#0A0E14]/95 backdrop-blur-md shadow-2xl p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-200 font-medium mb-1">We value your privacy</p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    We use essential cookies to make this site work (such as keeping you
                    signed in). With your consent we may also use optional cookies. You can
                    accept, reject optional cookies, or choose what to allow. See our{' '}
                    <Link href="/cookies" className="text-primary-400 hover:text-primary-300 underline">
                      Cookie Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
                >
                  Reject optional
                </button>
                <button
                  onClick={openPreferences}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
                >
                  Manage preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 transition-opacity"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Preferences modal ---------- */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closePreferences}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cookie preferences"
            className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#0A0E14] shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">Cookie preferences</h2>
              </div>
              <button
                onClick={closePreferences}
                aria-label="Close"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-400 leading-relaxed">
                Choose which optional cookies you allow. Essential cookies are always on
                because the site can&rsquo;t function without them.
              </p>

              {/* Essential — locked on */}
              <CategoryRow
                title="Strictly necessary"
                description="Required for core features like signing in, security, and remembering your cookie choice. These never store tracking data."
                checked
                disabled
              />

              {/* Analytics */}
              <CategoryRow
                title="Analytics"
                description="Help us understand how the site is used so we can improve it. We do not currently use any analytics cookies — this is here for transparency and future use."
                checked={draftAnalytics}
                onChange={setDraftAnalytics}
              />

              {/* Marketing */}
              <CategoryRow
                title="Marketing"
                description="Used to measure and tailor promotions. We do not currently use any marketing cookies — this is here for transparency and future use."
                checked={draftMarketing}
                onChange={setDraftMarketing}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 p-5 border-t border-white/10">
              <button
                onClick={rejectAll}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-gray-200 hover:bg-white/5 transition-colors sm:flex-1"
              >
                Reject optional
              </button>
              <button
                onClick={() => savePreferences({ analytics: draftAnalytics, marketing: draftMarketing })}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-primary-500/40 text-primary-300 hover:bg-primary-500/10 transition-colors sm:flex-1"
              >
                Save choices
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 transition-opacity sm:flex-1"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-white mb-1">{title}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
          checked ? 'bg-primary-500' : 'bg-white/15'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
