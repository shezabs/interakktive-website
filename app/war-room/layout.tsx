export default function WarRoomLayout({ children }: { children: React.ReactNode }) {
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
