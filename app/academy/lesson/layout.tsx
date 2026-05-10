// app/academy/lesson/layout.tsx
// ============================================================================
// LESSON LAYOUT — wraps every /academy/lesson/<slug> page.
//
// 1) PRO gate: FREE lessons render unchanged. PRO lessons require an active
//    subscription; otherwise the user sees a paywall card.
// 2) Lesson nav bar: prev / academy home / next, fixed to the bottom of every
//    lesson. Skips lessons that aren't in LIVE_LESSONS so we never link to a
//    page that doesn't exist.
// 3) Per-lesson cert removal: lessons individually rendered "Certificate of
//    Completion" cards. We've moved certificates to the LEVEL — a single cert
//    unlocks when all lessons in a level are completed. This layout hides any
//    leftover per-lesson cert blocks and shows a level-aware callout instead.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ArrowRight, Crown, GraduationCap, Award } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { useProAccess } from '@/app/lib/use-pro-access';
import { findAdjacentLiveLessons, findCourseForLesson, levelShortCode, LIVE_LESSONS } from '@/app/lib/academy-helpers';

// Build a Set of FREE lesson IDs from the data file. FREE lessons skip the gate.
const FREE_LESSON_IDS = new Set(
  academyCourses.flatMap(c => c.lessons.filter(l => l.isFree).map(l => l.id))
);

function LessonNav({ slug }: { slug: string }) {
  const { prev, next } = findAdjacentLiveLessons(slug);

  return (
    <div className="lesson-footer-nav border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-5 grid grid-cols-3 items-center gap-3">
        {/* PREV */}
        <div className="flex justify-start">
          {prev ? (
            <Link
              href={`/academy/lesson/${prev.id}`}
              className="group flex items-center gap-3 text-left max-w-full"
              title={prev.title}
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-primary-400/50 group-hover:bg-primary-500/10 transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
              </span>
              <span className="hidden sm:flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-widest text-gray-600">Previous</span>
                <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors max-w-[200px]">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : <span />}
        </div>

        {/* ACADEMY HOME (centered) */}
        <div className="flex justify-center">
          <Link
            href="/academy"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary-400/50 hover:bg-primary-500/10 transition-colors"
            title="Back to ATLAS Academy"
          >
            <GraduationCap className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors">
              Academy
            </span>
          </Link>
        </div>

        {/* NEXT */}
        <div className="flex justify-end">
          {next ? (
            <Link
              href={`/academy/lesson/${next.id}`}
              className="group flex items-center gap-3 text-right max-w-full"
              title={next.title}
            >
              <span className="hidden sm:flex flex-col min-w-0 items-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-600">Next</span>
                <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors max-w-[200px]">
                  {next.title}
                </span>
              </span>
              <span className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-primary-400/50 group-hover:bg-primary-500/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
              </span>
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}

// Level-cert callout shown at the bottom of every lesson, ABOVE the lesson nav.
// Replaces the old per-lesson certs with a level-aware one.
// Smart cert/progress component shown above the lesson nav.
// Behaviour:
//  - Always shows a thin progress strip: "L1 · Lesson 3 of 6 · 50%"
//  - On the LAST lesson of a level, when all level lessons complete:
//    show a prominent "Claim your certificate" button
//  - Otherwise: a faint "Cert unlocks at the end of this level" line
function LevelProgressStrip({ slug }: { slug: string }) {
  const course = findCourseForLesson(slug);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hasCert, setHasCert] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!course) return;
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import('@/app/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email || cancelled) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const [completionsRes, certsRes] = await Promise.all([
          supabase.from('lesson_completions').select('lesson_id').eq('user_email', user.email).eq('level_id', course.id),
          supabase.from('level_certificates').select('cert_code').eq('user_email', user.email).eq('level_id', course.id).maybeSingle(),
        ]);
        if (cancelled) return;
        const ids = new Set<string>((completionsRes.data || []).map((r: { lesson_id: string }) => r.lesson_id));
        setCompleted(ids);
        setHasCert(!!certsRes.data);
      } catch {
        // Silent.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, course]);

  if (!course) return null;
  const code = levelShortCode(course.id);

  // Live lessons only — used for progress.
  const liveLessonIds = course.lessons
    .filter(l => LIVE_LESSONS.has(l.id))
    .map(l => l.id);
  const liveTotal = liveLessonIds.length;
  const liveCompletedCount = liveLessonIds.filter(id => completed.has(id)).length;
  const progressPct = liveTotal > 0 ? Math.round((liveCompletedCount / liveTotal) * 100) : 0;

  // This lesson's position among the live lessons of this level (1-indexed for display).
  const lessonPosition = liveLessonIds.indexOf(slug) + 1;
  const isLastLiveInLevel = lessonPosition === liveTotal && liveTotal > 0;
  const levelComplete = liveTotal > 0 && liveCompletedCount === liveTotal;

  // Don't render until we know — avoids flash of "0%" before completions load.
  if (!loaded) return null;

  // Last lesson + level complete (or cert already issued) → prominent cert claim
  if (isLastLiveInLevel && (levelComplete || hasCert)) {
    return (
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-amber-500/[0.02] p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/40 mb-4">
            <Award className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold mb-2">{code} Certificate Ready</p>
          <h3 className="text-xl font-bold text-white mb-2">You finished {course.title}.</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed mb-5">
            Every lesson in this level is complete. Claim your certificate to download a printable PDF.
          </p>
          <Link
            href={`/academy/certificate/${course.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all"
          >
            <Award className="w-4 h-4" />
            {hasCert ? 'Download your certificate' : 'Claim your certificate'}
          </Link>
        </div>
      </section>
    );
  }

  // Otherwise: thin progress strip
  return (
    <section className="px-5 py-6 max-w-2xl mx-auto">
      <Link
        href={`/academy#${course.id}`}
        className="block rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-colors p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
            {code} · Lesson {lessonPosition || '–'} of {liveTotal}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
            {progressPct}%
          </p>
        </div>
        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center">
          Tap to view all lessons in this level
        </p>
      </Link>
    </section>
  );
}

// Hides per-lesson certificate blocks that are still hardcoded in 105+ lesson
// pages, AND uses the appearance of those blocks as a completion signal — the
// lesson's existing cert is gated behind `certUnlocked`, so when the cert
// renders it means the user just passed the quiz. We use that to write a row
// into lesson_completions (one per user per lesson).
//
// We do this from the layout because adding event-emit code to 105 lesson
// pages is too risky for one session. The DOM walk is the safest universal
// hook into the existing per-lesson quiz logic.
function useHidePerLessonCertificatesAndRecordCompletion(slug: string) {
  useEffect(() => {
    let cancelled = false;
    let recorded = false;

    // Resolve current course (level) for this lesson once at mount.
    const course = findCourseForLesson(slug);
    const levelId = course?.id || '';

    const recordCompletion = async () => {
      if (recorded || cancelled || !levelId) return;
      try {
        // Lazy-import to avoid pulling supabase into every lesson bundle.
        const { supabase } = await import('@/app/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return; // Anonymous viewer — skip silently. (Don't mark recorded — auth might still load.)
        // Upsert: one row per (user_email, lesson_id). Re-takes don't double-write.
        const { error } = await supabase.from('lesson_completions').upsert(
          { user_email: user.email, lesson_id: slug, level_id: levelId },
          { onConflict: 'user_email,lesson_id' }
        );
        if (!error) {
          recorded = true;
        } else if (typeof window !== 'undefined') {
          // Surface so admins can debug. Real users: silent.
          // eslint-disable-next-line no-console
          console.warn('[lesson_completions write failed]', error.message);
        }
      } catch (e) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[lesson_completions write threw]', e);
        }
      }
    };

    const tryHideAndRecord = () => {
      if (cancelled) return;
      // Patterns we strip from lessons. matchType:
      //  - 'equals'   = element text equals the token (after trim/lowercase)
      //  - 'includes' = element text contains the token (substring match)
      //  - 'lockCard' = the small "this is the locked cert" card. Tightly scoped to
      //                 avoid eating the quiz intro (which also mentions "to unlock
      //                 your certificate"). Lock cards START with "complete the quiz"
      //                 or "score" (e.g. "Score 66%+ to unlock your..."). Quiz intros
      //                 START with "answer" (e.g. "Answer all 3 to unlock your...").
      //  - 'levelComplete' = "level N — <levelTitle> complete!" pattern (lesson template
      //                 hardcoded ending block, fires regardless of quiz state — misleading)
      //  - 'backToAcademy' = the per-lesson "Back to Academy" hardcoded section
      // signalsCompletion: this is the unlocked-cert reveal — write completion.
      type Pattern = { token: string; matchType: 'equals' | 'includes' | 'lockCard' | 'levelComplete' | 'backToAcademy'; signalsCompletion: boolean };
      const stripPatterns: Pattern[] = [
        { token: 'certificate of completion', matchType: 'equals', signalsCompletion: true },
        { token: 'certificate of mastery', matchType: 'equals', signalsCompletion: true },
        { token: '', matchType: 'lockCard', signalsCompletion: false },
        { token: 'up next', matchType: 'equals', signalsCompletion: false },
        { token: '', matchType: 'levelComplete', signalsCompletion: false },
        { token: 'back to academy', matchType: 'equals', signalsCompletion: false },
      ];

      const matches = (txt: string, p: Pattern): boolean => {
        if (p.matchType === 'equals') return txt === p.token;
        if (p.matchType === 'includes') return txt.includes(p.token);
        if (p.matchType === 'lockCard') {
          // Lock card always contains "to unlock your" AND "certificate", AND
          // starts with either "complete the quiz" or "score" (e.g. "Score 66%+ to...").
          // The quiz intro starts with "answer" so it won't match here.
          if (!txt.includes('to unlock your') || !txt.includes('certificate')) return false;
          return txt.startsWith('complete the quiz') || txt.startsWith('score');
        }
        if (p.matchType === 'levelComplete') {
          // Matches "level 1 — foundations complete!" or "level 11 — cipher mastery complete!"
          // The em-dash and exclamation are unique enough that we can broaden safely.
          return /^level\s+\d+\s*[—-].*complete!$/i.test(txt);
        }
        if (p.matchType === 'backToAcademy') return txt === 'back to academy';
        return false;
      };

      const all = document.querySelectorAll<HTMLElement>('p, h2, h3, h4, span, strong');
      let foundCert = false;
      all.forEach(el => {
        if (el.dataset.certHidden === '1') return;
        const txt = (el.textContent || '').trim().toLowerCase();
        if (!txt) return;
        const match = stripPatterns.find(p => matches(txt, p));
        if (!match) return;
        if (match.signalsCompletion) foundCert = true;
        // Walk up to the nearest section / glass-card wrapper.
        let cur: HTMLElement | null = el;
        for (let i = 0; i < 10 && cur; i++) {
          const tag = cur.tagName.toLowerCase();
          if (
            tag === 'section' ||
            cur.classList.contains('glass-card') ||
            (cur.parentElement && cur.parentElement.tagName.toLowerCase() === 'section')
          ) {
            const target = tag === 'section' ? cur : (cur.closest('section') || cur);
            (target as HTMLElement).style.display = 'none';
            (target as HTMLElement).dataset.certHidden = '1';
            break;
          }
          cur = cur.parentElement;
        }
        el.dataset.certHidden = '1';
      });
      if (foundCert) recordCompletion();
    };

    // Initial pass + polling for cert markup that animates in via framer-motion.
    tryHideAndRecord();
    const t1 = setTimeout(tryHideAndRecord, 150);
    const t2 = setTimeout(tryHideAndRecord, 600);
    const t3 = setTimeout(tryHideAndRecord, 1500);
    // Also watch for later cert reveals (e.g. user finishes quiz partway through)
    const interval = setInterval(tryHideAndRecord, 2500);
    const stopInterval = setTimeout(() => clearInterval(interval), 60_000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
      clearTimeout(stopInterval);
    };
  }, [slug]);
}

// Inner component used for the "lesson is unlocked" branches. We wrap children
// in a fragment + add: cert-stripper effect, level-cert callout, lesson nav.
function UnlockedLesson({ children, slug, isAdmin }: { children: React.ReactNode; slug: string; isAdmin: boolean }) {
  useHidePerLessonCertificatesAndRecordCompletion(slug);
  return (
    <>
      {isAdmin && <AdminAccessBadge />}
      {children}
      <LevelProgressStrip slug={slug} />
      <LessonNav slug={slug} />
    </>
  );
}

// Floating "Admin Access" badge — visible only to allowlisted admins. Reminds
// you that you're not seeing the real user paywall behaviour.
function AdminAccessBadge() {
  return (
    <div
      className="fixed top-20 right-3 z-40 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm pointer-events-none"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Admin Access</span>
    </div>
  );
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const isFreeLesson = FREE_LESSON_IDS.has(slug);

  const { state, isAdmin } = useProAccess();

  // FREE lessons render immediately, no auth check.
  if (isFreeLesson) {
    return <UnlockedLesson slug={slug} isAdmin={isAdmin}>{children}</UnlockedLesson>;
  }

  // PRO lesson — gate based on access state.
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Verifying access…
      </div>
    );
  }

  if (state === 'paying') {
    return <UnlockedLesson slug={slug} isAdmin={isAdmin}>{children}</UnlockedLesson>;
  }

  // not-paying → paywall
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-card rounded-2xl p-8 text-center text-white"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-accent-500/20 border border-amber-500/30 mb-6">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold mb-3">PRO Lesson</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          This lesson is part of the ATLAS PRO Academy — available to all paying subscribers.
        </p>
        <p className="text-gray-500 text-xs leading-relaxed mb-2">
          Starter, Advantage, and Elite all unlock the full Academy curriculum.
        </p>
        <p className="text-gray-600 text-[11px] leading-relaxed mb-8">
          If you&apos;ve subscribed before, your progress and certificates are saved — they&apos;ll restore the moment you resubscribe.
        </p>

        <Link
          href="/pricing"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-lg font-semibold text-white transition-all"
        >
          See Pricing & Subscribe
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/academy"
          className="block mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to Academy
        </Link>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-600 mb-2">Already subscribed?</p>
          <Link href="/signin" className="text-xs text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Sign in to unlock
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
