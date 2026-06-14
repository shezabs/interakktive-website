'use client';

import { ScrollProgress, BackToTop } from './animations';
import ChatWidget from './ChatWidget';
import CookieConsentBanner from './CookieConsentBanner';

export default function GlobalUI() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <ChatWidget />
      <CookieConsentBanner />
    </>
  );
}
