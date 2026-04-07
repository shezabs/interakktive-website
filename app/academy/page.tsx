// app/academy/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Clock, Trophy, BookOpen, GraduationCap } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AcademyPage() {
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
        {/* Glow */}
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
        {academyCourses.map((course, ci) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: ci * 0.1 }}
          >
            {/* Course Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
                {course.level}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{course.title}</h2>
                <p className="text-sm text-gray-500">{course.description}</p>
              </div>
              {course.isFree && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  Free
                </span>
              )}
            </div>

            {/* Lesson Cards */}
            <div className="space-y-2.5 mb-16">
              {course.lessons.map((lesson, li) => {
                const isLive = lesson.id === 'what-is-trading' || lesson.id === 'asset-classes' || lesson.id === 'candlestick-anatomy' || lesson.id === 'reading-charts' || lesson.id === 'risk-basics';
                return (
                  <Link
                    key={lesson.id}
                    href={isLive ? `/academy/lesson/${lesson.id}` : '#'}
                    className={`block group ${!isLive ? 'pointer-events-none' : ''}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: li * 0.06 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        isLive
                          ? 'glass-card hover:translate-x-1'
                          : 'bg-white/[0.02] border-white/[0.03] opacity-40'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm transition-colors ${
                        isLive ? 'bg-white/5 text-gray-500 group-hover:text-primary-400 group-hover:bg-primary-500/10' : 'bg-white/[0.02] text-gray-700'
                      }`}>
                        {li + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-[15px] transition-colors ${isLive ? 'group-hover:text-primary-400' : ''}`}>
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{lesson.subtitle}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-600">{lesson.estimatedMinutes} min</span>
                        {!lesson.isFree && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 border border-accent-500/15">PRO</span>
                        )}
                        {isLive ? (
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
        ))}

        {/* Coming Soon */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-2">Levels 2–9 Coming Soon</p>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Technical Analysis · Smart Money · Indicator Intelligence · Options · Risk Management · Psychology · Prop Trading · ATLAS Mastery
          </p>
        </motion.div>
      </section>
    </div>
  );
}
