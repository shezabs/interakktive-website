// app/academy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Clock, Trophy, BookOpen, GraduationCap, ChevronDown, Award, Download } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';
import { useProAccess } from '@/app/lib/use-pro-access';
import { LIVE_LESSONS, isLevelCompleteByCompletions, levelShortCode } from '@/app/lib/academy-helpers';
import { supabase } from '@/app/lib/supabase';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};


export default function AcademyPage() {
  // All levels collapsed by default
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(academyCourses.map(c => [c.id, false]))
  );

  // PRO access state. Render the index immediately; lessons reveal as
  // clickable once auth resolves. While loading, treat as not-paying so the
  // optimistic render shows correct gating to non-paying users (the common case).
  // Paying users see a brief locked → unlocked flip (~200ms) which is fine.
  const { state: accessState } = useProAccess();
  const isPaying = accessState === 'paying';

  // Set of lesson IDs the current user has completed.
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  // Map of levelId → cert_code for already-issued certs.
  const [certs, setCerts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email || cancelled) return;
        const [completionsRes, certsRes] = await Promise.all([
          supabase.from('lesson_completions').select('lesson_id').eq('user_email', user.email),
          supabase.from('level_certificates').select('level_id, cert_code').eq('user_email', user.email),
        ]);
        if (cancelled) return;
        const ids = new Set<string>((completionsRes.data || []).map((r: { lesson_id: string }) => r.lesson_id));
        setCompleted(ids);
        const certMap: Record<string, string> = {};
        for (const row of (certsRes.data || []) as { level_id: string; cert_code: string }[]) {
          certMap[row.level_id] = row.cert_code;
        }
        setCerts(certMap);
      } catch {
        // Silent — user just sees no progress badges.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen">
      {/* Back to site link */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          interakktive.com
        </Link>
        <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
          ATLAS ACADEMY
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 text-center">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-100px] right-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(217,70,239,0.08),transparent_70%)] pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
            <GraduationCap className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-400">Interactive Trading Education</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Learn to Trade{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
              From Zero to Pro
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Interactive lessons, animated explanations, simulated trades, and certificates at every level.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> 9 Levels</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Certificates</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Self-paced</span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6">
            <Link href="/academy/glossary" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/[0.08] transition-all text-sm text-gray-400 hover:text-white">
              <BookOpen className="w-4 h-4" />
              Trading Glossary — 35+ terms explained
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Course Grid */}
      <section className="max-w-3xl mx-auto px-6 pb-32">
        {academyCourses.map((course, ci) => {
          const isOpen = expanded[course.id] ?? false;
          const lessonCount = course.lessons.length;
          const freeCount = course.lessons.filter(l => l.isFree).length;
          const proCount = lessonCount - freeCount;
          const levelComplete = isLevelCompleteByCompletions(course.id, completed);
          const hasCert = !!certs[course.id];

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: ci * 0.1 }}
              className="mb-8"
            >
              {/* Course Header — clickable to collapse/expand */}
              <button
                onClick={() => toggle(course.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20 flex-shrink-0">
                  {course.level}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{course.title}</h2>
                  <p className="text-xs text-gray-500 truncate">{course.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(levelComplete || hasCert) && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Award className="w-3 h-3" />
                      Cert ready
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600 font-mono">{lessonCount} lessons</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Cert button (only when level is complete or already issued) */}
              {(levelComplete || hasCert) && (
                <div className="px-3 -mt-1 mb-2">
                  <Link
                    href={`/academy/certificate/${course.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 hover:border-amber-400/50 hover:from-amber-500/20 hover:to-amber-600/10 text-amber-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {hasCert ? 'Download your certificate' : 'Claim your certificate'}
                  </Link>
                </div>
              )}

              {/* Lesson Cards — collapsible */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2.5 pt-3 pb-4 pl-2">
                      {course.lessons.map((lesson, li) => {
                        const isLive = LIVE_LESSONS.has(lesson.id);
                        // Clickable when: lesson is shipped AND (it's free OR user is paying)
                        const isUnlocked = isLive && (lesson.isFree || isPaying);
                        return (
                          <Link
                            key={lesson.id}
                            href={isUnlocked ? `/academy/lesson/${lesson.id}` : '#'}
                            className={`block group ${!isUnlocked ? 'pointer-events-none' : ''}`}
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: li * 0.04 }}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                isUnlocked
                                  ? 'glass-card hover:translate-x-1'
                                  : 'bg-white/[0.02] border-white/[0.03] opacity-40'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm transition-colors ${
                                isUnlocked ? 'bg-white/5 text-gray-500 group-hover:text-primary-400 group-hover:bg-primary-500/10' : 'bg-white/[0.02] text-gray-700'
                              }`}>
                                {li + 1}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-[15px] transition-colors ${isUnlocked ? 'group-hover:text-primary-400' : ''}`}>
                                  {lesson.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">{lesson.subtitle}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-gray-600">{lesson.estimatedMinutes} min</span>
                                {lesson.isFree ? (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/15">FREE</span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 border border-accent-500/15">PRO</span>
                                )}
                                {isUnlocked ? (
                                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-700" />
                                )}
                              </div>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Coming Soon */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-2">Level 12 Coming Soon</p>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            The Next PRO Mastery Level · Another Flagship Indicator
          </p>
        </motion.div>
      </section>
    </div>
  );
}
