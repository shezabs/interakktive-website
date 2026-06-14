'use client';

// ==========================================================================
// Cookie Consent — GDPR / UK GDPR + PECR (ePrivacy) compliant banner.
//
// Model:
//  - Essential cookies (auth session, security, consent record) are ALWAYS on
//    and exempt from consent under PECR — the site cannot function without them.
//  - All other categories (Analytics, Marketing) default to OFF and require
//    explicit opt-in. Nothing in those categories may load until the user
//    consents. As of 2026-06-14 the site runs NO analytics or marketing
//    cookies, so those categories are present and future-proofed but currently
//    control nothing. When you add (e.g.) analytics, gate its <script> behind
//    `useConsent().consent.analytics === true`.
//
// Consent is stored in a first-party cookie (not localStorage) so it is
// available server-side too and survives as a durable record with an expiry.
// ==========================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ConsentCategories = {
  essential: true; // always true, non-toggleable
  analytics: boolean;
  marketing: boolean;
};

type ConsentState = {
  consent: ConsentCategories;
  hasChosen: boolean; // true once the user has actively accepted/rejected/saved
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  openPreferences: () => void;
  isPreferencesOpen: boolean;
  closePreferences: () => void;
};

const CONSENT_COOKIE = 'ik_cookie_consent';
const CONSENT_VERSION = '1'; // bump to re-prompt everyone if the policy materially changes
const CONSENT_MAX_AGE_DAYS = 180;

const DEFAULT_CONSENT: ConsentCategories = {
  essential: true,
  analytics: false,
  marketing: false,
};

const ConsentContext = createContext<ConsentState | null>(null);

function readConsentCookie(): { consent: ConsentCategories; hasChosen: boolean } {
  if (typeof document === 'undefined') {
    return { consent: DEFAULT_CONSENT, hasChosen: false };
  }
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (!match) return { consent: DEFAULT_CONSENT, hasChosen: false };
    const raw = decodeURIComponent(match.split('=')[1] || '');
    const parsed = JSON.parse(raw) as { v: string; analytics: boolean; marketing: boolean };
    if (parsed.v !== CONSENT_VERSION) {
      return { consent: DEFAULT_CONSENT, hasChosen: false };
    }
    return {
      consent: {
        essential: true,
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
      },
      hasChosen: true,
    };
  } catch {
    return { consent: DEFAULT_CONSENT, hasChosen: false };
  }
}

function writeConsentCookie(prefs: { analytics: boolean; marketing: boolean }) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(
    JSON.stringify({ v: CONSENT_VERSION, analytics: prefs.analytics, marketing: prefs.marketing })
  );
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentCategories>(DEFAULT_CONSENT);
  const [hasChosen, setHasChosen] = useState(true); // assume chosen until mounted, avoids SSR flash
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const { consent: stored, hasChosen: chosen } = readConsentCookie();
    setConsent(stored);
    setHasChosen(chosen);
  }, []);

  const acceptAll = useCallback(() => {
    const next = { analytics: true, marketing: true };
    writeConsentCookie(next);
    setConsent({ essential: true, ...next });
    setHasChosen(true);
    setIsPreferencesOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    const next = { analytics: false, marketing: false };
    writeConsentCookie(next);
    setConsent({ essential: true, ...next });
    setHasChosen(true);
    setIsPreferencesOpen(false);
  }, []);

  const savePreferences = useCallback((prefs: { analytics: boolean; marketing: boolean }) => {
    writeConsentCookie(prefs);
    setConsent({ essential: true, ...prefs });
    setHasChosen(true);
    setIsPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasChosen,
        acceptAll,
        rejectAll,
        savePreferences,
        openPreferences,
        isPreferencesOpen,
        closePreferences,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentState {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    // Safe fallback if used outside the provider — treats nothing as consented.
    return {
      consent: DEFAULT_CONSENT,
      hasChosen: true,
      acceptAll: () => {},
      rejectAll: () => {},
      savePreferences: () => {},
      openPreferences: () => {},
      isPreferencesOpen: false,
      closePreferences: () => {},
    };
  }
  return ctx;
}
