// app/verify/[certCode]/page.tsx
// ============================================================================
// Public certificate verification page. Anyone with a cert_code can verify
// it here (no auth). Designed for trust and shareability — the kind of page
// you'd be happy to land on if someone posted their cert on LinkedIn.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Award, ArrowRight, Loader2, GraduationCap } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { levelShortCode } from '@/app/lib/academy-helpers';

interface VerifiedCert {
  cert_code: string;
  level_id: string;
  trader_name: string;
  issued_at: string;
}

export default function VerifyCertificatePage() {
  const params = useParams<{ certCode: string }>();
  const code = params?.certCode || '';

  const [state, setState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [cert, setCert] = useState<VerifiedCert | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/verify-certificate/${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (res.status === 200) {
          const data = await res.json();
          if (data.valid && data.certificate) {
            setCert(data.certificate);
            setState('valid');
            return;
          }
        }
        setState('invalid');
      } catch {
        if (!cancelled) setState('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm pt-20">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Verifying certificate…
      </div>
    );
  }

  if (state === 'invalid' || !cert) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 mb-6">
              <ShieldX className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Certificate Not Found</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The code <span className="font-mono text-gray-300">{code}</span> doesn&apos;t match any
              certificate issued by ATLAS Academy.
            </p>
            <p className="text-xs text-gray-500 mb-8">
              Double-check the code, or contact the certificate holder for a working link.
            </p>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Visit ATLAS Academy
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Valid cert
  const course = academyCourses.find(c => c.id === cert.level_id);
  const levelTitle = course?.title || cert.level_id;
  const levelCode = levelShortCode(cert.level_id);
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-6" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Verified header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 mb-5"
          >
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-400 font-bold mb-2">Verified Certificate</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">This certificate is genuine.</h1>
        </div>

        {/* Certificate details card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] p-8 sm:p-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/40 mb-5">
            <Award className="w-7 h-7 text-amber-400" />
          </div>

          <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400/80 font-semibold mb-3">{levelCode} Certificate</p>

          <p className="text-sm text-gray-400 italic mb-2">Awarded to</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {cert.trader_name}
          </h2>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto mb-4" />

          <p className="text-sm text-gray-400 italic mb-1">for completing</p>
          <h3 className="text-xl font-bold text-white mb-6">{levelTitle}</h3>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 max-w-md mx-auto">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Issued</p>
              <p className="text-sm text-white font-medium">{issuedDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Cert Code</p>
              <p className="text-sm font-mono text-amber-400">{cert.cert_code}</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-gray-400 mb-4">
            ATLAS Academy by Interakktive — interactive trading education from zero to pro.
          </p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white text-sm font-semibold transition-all"
          >
            Explore the Academy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
