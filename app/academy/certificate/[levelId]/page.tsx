// app/academy/certificate/[levelId]/page.tsx
// ============================================================================
// CERTIFICATE PAGE — issues + displays a level certificate. Print-optimised
// so the user can use Cmd/Ctrl+P or the Download button to save as PDF.
//
// Layout: A4 landscape, formal serif typography, gold seal, subtle pattern
// border, ATLAS triangle logo, Interakktive wordmark, trader name, level
// title, date, cert ID.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, AlertCircle, Loader2, Lock } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { levelShortCode } from '@/app/lib/academy-helpers';

interface Cert {
  cert_code: string;
  trader_name: string;
  issued_at: string;
  level_id: string;
}

export default function CertificatePage() {
  const params = useParams<{ levelId: string }>();
  const router = useRouter();
  const levelId = params?.levelId || '';
  const course = academyCourses.find(c => c.id === levelId);

  const [cert, setCert] = useState<Cert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!levelId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/issue-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ levelId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'Could not load certificate');
        } else {
          setCert(data.certificate);
        }
      } catch (e) {
        if (cancelled) return;
        setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [levelId]);

  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Verifying your achievement…
      </div>
    );
  }

  if (error || !cert || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-white">Certificate not available</h1>
          <p className="text-gray-400 text-sm mb-6">
            {error || 'This level certificate is not yet ready.'}
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Complete every lesson in this level to unlock your certificate.
          </p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(cert.issued_at);
  const dateStr = issuedDate.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const code = levelShortCode(course.id);

  return (
    <>
      {/* Print stylesheet — controls page setup + hides chrome */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .cert-paper {
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen py-10 px-4 sm:px-6 print:p-0 print:bg-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
        {/* Action bar — hidden on print */}
        <div className="no-print max-w-[1100px] mx-auto mb-6 flex items-center justify-between">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Academy
          </Link>

          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            Download / Print Certificate
          </button>
        </div>

        {/* Certificate paper — A4 landscape, real-world cert aesthetics */}
        <article
          className="cert-paper relative mx-auto bg-white text-[#1a1a1a] shadow-2xl rounded-md"
          style={{
            width: '100%',
            maxWidth: '1100px',
            aspectRatio: '297 / 210',
            backgroundImage: `
              radial-gradient(circle at 0% 0%, rgba(255, 179, 0, 0.04), transparent 40%),
              radial-gradient(circle at 100% 100%, rgba(38, 166, 154, 0.04), transparent 40%),
              linear-gradient(180deg, #fbf9f4 0%, #f5f1e8 100%)
            `,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {/* Corner ornaments */}
          <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-amber-700/40 rounded-tl-md" />
          <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-amber-700/40 rounded-tr-md" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-amber-700/40 rounded-bl-md" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-amber-700/40 rounded-br-md" />

          {/* Inner double border */}
          <div className="absolute inset-10 border border-amber-700/20 rounded-sm" />
          <div className="absolute inset-12 border border-amber-700/10 rounded-sm" />

          {/* Top brand row */}
          <div className="absolute top-[7%] left-0 right-0 flex flex-col items-center">
            <img
              src="/images/logo_final.png"
              alt="Interakktive"
              className="h-10 sm:h-12 mb-2 opacity-90"
              style={{ filter: 'brightness(0.4)' }}
            />
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.4em] text-amber-800/70 uppercase">
              ATLAS Academy · by Interakktive
            </p>
          </div>

          {/* Body */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
            <p className="text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gray-500 font-semibold mb-2">
              Certificate of Achievement
            </p>

            <p className="text-sm sm:text-base text-gray-600 mb-3 italic">
              This is to certify that
            </p>

            {/* Trader name */}
            <h1
              className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 px-6"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.02em' }}
            >
              {cert.trader_name}
            </h1>

            <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent mb-4" />

            <p className="text-sm sm:text-base text-gray-600 italic mb-2">
              has successfully completed every lesson of
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {course.title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl px-4 leading-relaxed">
              and has demonstrated mastery of the principles, techniques, and disciplines required for serious trading at this level.
            </p>
          </div>

          {/* Bottom row: date | seal | signature */}
          <div className="absolute bottom-[10%] left-0 right-0 px-16 sm:px-24 flex items-end justify-between gap-6">
            {/* Date column */}
            <div className="text-center flex-1">
              <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                {dateStr}
              </p>
              <div className="w-full h-px bg-gray-400 mb-1" />
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">Date Issued</p>
            </div>

            {/* Gold seal centered */}
            <div className="flex-shrink-0 relative">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #fde68a, #d97706 60%, #92400e)',
                  boxShadow: '0 4px 16px rgba(120, 53, 15, 0.35), inset 0 0 8px rgba(255,255,255,0.3)',
                }}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #fef3c7, #d97706)',
                    boxShadow: 'inset 0 0 6px rgba(120, 53, 15, 0.4)',
                  }}
                >
                  <span
                    className="text-[#5a3e0c] text-base sm:text-lg font-extrabold"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.05em' }}
                  >
                    {code}
                  </span>
                </div>
              </div>
              {/* Ribbon tails */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-[140%] w-3 h-6 bg-gradient-to-b from-amber-700 to-amber-900 transform rotate-12" style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)' }} />
              <div className="absolute -bottom-2 left-1/2 translate-x-[40%] w-3 h-6 bg-gradient-to-b from-amber-700 to-amber-900 transform -rotate-12" style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)' }} />
            </div>

            {/* Signature column */}
            <div className="text-center flex-1">
              <p
                className="text-lg sm:text-xl text-gray-800 mb-1"
                style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
              >
                Shahzad Saleem
              </p>
              <div className="w-full h-px bg-gray-400 mb-1" />
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">Founder, Interakktive</p>
            </div>
          </div>

          {/* Cert ID footer */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <p className="font-mono text-[9px] sm:text-[10px] tracking-widest text-gray-500 uppercase">
              {cert.cert_code} · Verify at interakktive.com/verify/{cert.cert_code}
            </p>
          </div>
        </article>

        {/* Tip bar — hidden on print */}
        <div className="no-print max-w-[1100px] mx-auto mt-6 text-center">
          <p className="text-xs text-gray-500">
            Tip: When printing, choose <strong className="text-gray-300">Save as PDF</strong> as the destination,
            then set Layout to <strong className="text-gray-300">Landscape</strong> and Margins to <strong className="text-gray-300">None</strong> for the best result.
          </p>
        </div>
      </div>
    </>
  );
}
