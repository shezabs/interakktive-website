import type { Metadata } from 'next';
import AdminNav from './components/AdminNav';

export const metadata: Metadata = {
  title: 'Admin — Interakktive',
  description: 'Internal admin panel',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {children}
      </main>
    </div>
  );
}
