// app/academy/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Clock, Trophy, BookOpen } from 'lucide-react';
import { academyCourses } from '@/app/lib/academy-data';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      {/* Back to site */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 bg-[rgba(6,10,18,0.9)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
        <Link href="/" className="flex items-center gap-2 text-[#4a5e78] hover:text-[#8fa0b8] transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          interakktive.com
        </Link>
        <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-[#26A69A] to-[#FFB300] bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
          ATLAS ACADEMY
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 text-center">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(38,166,154,0.15),transparent_70%)] pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(38,166,154,0.08)] border border-[rgba(38,166,154,0.2)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-[#26A69A]">Interactive Trading Education</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
            Learn to Trade{' '}
            <span className="bg-gradient-to-r from-[#26A69A] via-[#5de6d8] to-[#FFB300] bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
              From Zero to Pro
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-lg max-w-lg mx-auto leading-relaxed">
            Interactive lessons, animated explanations, simulated trades, and certificates at every level.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-8 text-sm text-[#4a5e78]">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> 9 Levels</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Certificates</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Self-paced</span>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26A69A] to-[#1a8a80] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_16px_rgba(38,166,154,0.25)]">
                {course.level}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{course.title}</h2>
                <p className="text-sm text-[#4a5e78]">{course.description}</p>
              </div>
              {course.isFree && (
                <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-[rgba(38,166,154,0.1)] text-[#26A69A] border border-[rgba(38,166,154,0.2)]">
                  Free
                </span>
              )}
            </div>

            {/* Lesson Cards */}
            <div className="space-y-2.5 mb-16">
              {course.lessons.map((lesson, li) => {
                const isLive = lesson.id === 'what-is-trading';
                return (
                  <Link
                    key={lesson.id}
                    href={isLive ? `/academy/lesson/what-is-trading` : '#'}
                    className={`block group ${!isLive ? 'pointer-events-none' : ''}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: li * 0.06 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        isLive
                          ? 'bg-[#0d1320] border-[rgba(255,255,255,0.05)] hover:border-[rgba(38,166,154,0.25)] hover:bg-[#111827] group-hover:translate-x-1'
                          : 'bg-[#0a0e17] border-[rgba(255,255,255,0.03)] opacity-40'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm transition-colors ${
                        isLive ? 'bg-[#141c2e] text-[#4a5e78] group-hover:text-[#26A69A] group-hover:bg-[rgba(38,166,154,0.1)]' : 'bg-[#0d1320] text-[#2a3548]'
                      }`}>
                        {li + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-[15px] transition-colors ${isLive ? 'group-hover:text-[#26A69A]' : ''}`}>
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-[#4a5e78] truncate">{lesson.subtitle}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-mono text-[#4a5e78]">{lesson.estimatedMinutes} min</span>
                        {!lesson.isFree && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(255,179,0,0.08)] text-[#FFB300] border border-[rgba(255,179,0,0.15)]">PRO</span>
                        )}
                        {isLive ? (
                          <ArrowRight className="w-4 h-4 text-[#4a5e78] group-hover:text-[#26A69A] transition-colors" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#2a3548]" />
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
          className="text-center py-16 border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl"
        >
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#4a5e78] mb-2">Levels 2–9 Coming Soon</p>
          <p className="text-sm text-[#4a5e78] max-w-md mx-auto">
            Technical Analysis · Smart Money · Indicator Intelligence · Options · Risk Management · Psychology · Prop Trading · ATLAS Mastery
          </p>
        </motion.div>
      </section>
    </div>
  );
}
