// app/academy/layout.tsx
// Standalone layout for ATLAS Academy — hides site nav/footer for immersive experience

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'ATLAS Academy — Learn to Trade',
    template: '%s | ATLAS Academy',
  },
  description: 'Interactive trading education from zero to pro. Animated lessons, simulated trades, and certificates at every level.',
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        nav, footer, .global-ui, [class*="Navigation"], [class*="Footer"], [class*="chat-widget"],
        header, #crisp-chatbox, .crisp-client, [data-testid="chat-widget"] {
          display: none !important;
        }
        main { padding: 0 !important; margin: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
