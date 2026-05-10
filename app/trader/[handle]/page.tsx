// app/trader/[handle]/page.tsx
// ============================================================================
// Public trader profile. Anyone can visit.
// Shows: handle, trader name, bio, earned certificates, total lessons completed.
// Only renders if the trader has opted in (is_public = true).
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, ArrowRight, Loader2, GraduationCap, BookOpen, ShieldX } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { levelShortCode } from '@/app/lib/academy-helpers';

interface Profile {
  handle: string;
  trader_name: string;
  bio: string | null;
}

interface Cert {
  cert_code: string;
  level_id: string;
  issued_at: string;
}

export default function TraderProfilePage() {
  const params = useParams<{ handle: string }>();
  const handle = params?.handle || '';

  const [state, setState] = useState<'loading' | 'found' | 'not-found'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/trader-profile/${encodeURIComponent(handle)}`);
        if (cancelled) return;
        if (res.status === 200) {
          const data = await res.json();
          if (data.found) {
            setProfile(data.profile);
            setCerts(data.certificates || []);
            setLessonsCompleted(data.lessonsCompleted || 0);
            setState('found');
            return;
          }
        }
        setState('not-found');
      } catch {
        if (!cancelled) setState('not-found');
      }
    })();
    return () => { cancelled = true; };
  }, [handle]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm pt-20">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading profile…
      </div>
    );
  }

  if (state === 'not-found' || !profile) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-500/10 border border-gray-500/30 mb-6">
              <ShieldX className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Profile not found</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              No trader with the handle <span className="font-mono text-gray-300">@{handle}</span> exists,
              or this profile is set to private.
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

  // Group certs by level for clean display.
  const certCount = certs.length;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* Avatar — initials in a gradient circle */}
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-5 text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #26A69A 0%, #FFB300 100%)' }}
          >
            {profile.trader_name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map(s => s[0]?.toUpperCase())
              .join('') || '·'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {profile.trader_name}
          </h1>
          <p className="text-sm font-mono text-primary-400 mb-3">@{profile.handle}</p>

          {profile.bio && (
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">{profile.bio}</p>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{certCount}</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              Certificate{certCount === 1 ? '' : 's'} Earned
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-3">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-3xl font-bold text-white">{lessonsCompleted}</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Lessons Completed</p>
          </div>
        </motion.div>

        {/* Certificates list */}
        {certCount > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Certificates</h2>
            <div className="space-y-3">
              {certs.map((c, i) => {
                const course = academyCourses.find(x => x.id === c.level_id);
                if (!course) return null;
                const issued = new Date(c.issued_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                });
                return (
                  <motion.div
                    key={c.cert_code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                  >
                    <Link
                      href={`/verify/${c.cert_code}`}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/15 hover:border-amber-400/40 hover:from-amber-500/10 hover:to-amber-500/[0.03] transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-500/20">
                        {course.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{course.title}</p>
                        <p className="text-[11px] text-gray-500">
                          <span className="font-mono text-amber-400/80">{c.cert_code}</span>
                          <span className="mx-2">·</span>
                          {issued}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-amber-400 transition-colors">Verify</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-dashed border-white/10 p-8 text-center"
          >
            <p className="text-sm text-gray-500">No certificates yet — the journey is just beginning.</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mt-12 pt-10 border-t border-white/5"
        >
          <p className="text-sm text-gray-400 mb-4">Want your own profile?</p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white text-sm font-semibold transition-all"
          >
            Start ATLAS Academy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
