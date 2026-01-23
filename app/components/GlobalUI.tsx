'use client';

import { ScrollProgress, BackToTop } from './animations';
import ChatWidget from './ChatWidget';

export default function GlobalUI() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <ChatWidget />
    </>
  );
}
