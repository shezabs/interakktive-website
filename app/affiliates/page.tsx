'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Crown, Target, Award, ShieldCheck, TrendingUp,
  CheckCircle2, AlertCircle, ArrowRight, Loader2, Mail,
  BookOpen, GraduationCap, MessageCircle, Youtube,
} from 'lucide-react';

// =============================================================================
// /affiliates — Interakktive Affiliate Program landing page
// =============================================================================
// Phase 1: marketing page + application form. Active paying customers only.
// Three tiers (Scout 5% / Partner 10% / Ambassador 15%) + cash bonuses on
// annual sales (Partner $25 / Ambassador $25/$50). Promotion at lifetime sale
// 6 (→ Partner) and 11 (→ Ambassador). Warning-first demotion: < 2 sales in
// 30 days = warning, second consecutive = one-tier demote (0 sales = full
// reset to Scout).
// =============================================================================

type AudienceSize = 'under_500' | '500_5k' | '5k_50k' | '50k_500k' | '500k_plus';
type Niche = 'forex' | 'crypto' | 'indices' | 'commodities' | 'mixed' | 'educational' | 'other';

interface FormState {
  fullName: string;
  email: string;
  tvUsername: string;
  promotionUrls: string;
  audienceSize: AudienceSize | '';
  niche: Niche | '';
  pitch: string;
  agreed: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: '', email: '', tvUsername: '', promotionUrls: '',
  audienceSize: '', niche: '', pitch: '', agreed: false,
};

// Plan pricing used by the calculator. Mirrors /pricing.
// (We compute commission off the cash-collected price the customer pays.)
const PLAN_PRICING = {
  starter:   { monthly: 50,  annual: 500 },
  advantage: { monthly: 75,  annual: 750 },
  elite:     { monthly: 100, annual: 1000 },
};

const ANNUAL_BONUS = {
  scout:      { starter: 0,  advantage: 0,  elite: 0  },
  partner:    { starter: 25, advantage: 25, elite: 25 },
  ambassador: { starter: 25, advantage: 25, elite: 50 },
};

const TIER_RATE = { scout: 0.05, partner: 0.10, ambassador: 0.15 };

export default function AffiliatesPage() {
  // ── Calculator state ──
  const [salesPerMonth, setSalesPerMonth] = useState(5);
  const [planMix, setPlanMix] = useState<'starter' | 'advantage' | 'elite'>('advantage');
  const [billingMix, setBillingMix] = useState<'mostly_monthly' | 'fifty_fifty' | 'mostly_annual'>('mostly_monthly');

  // Compute monthly earnings per tier
  const calc = useMemo(() => {
    // Translate three-bucket choice into a numeric share
    const annualShare =
      billingMix === 'mostly_monthly' ? 0.20 :
      billingMix === 'fifty_fifty'    ? 0.50 :
                                        0.80;
    const monthlyShare = 1 - annualShare;

    // Per-sale revenue based on plan + billing mix
    const monthlyPrice = PLAN_PRICING[planMix].monthly;
    const annualPrice = PLAN_PRICING[planMix].annual;

    const annualSales = salesPerMonth * annualShare;
    const monthlySales = salesPerMonth * monthlyShare;

    const computeTier = (tier: keyof typeof TIER_RATE) => {
      const rate = TIER_RATE[tier];
      const annualCommission = annualSales * annualPrice * rate;
      const monthlyCommission = monthlySales * monthlyPrice * rate;
      const bonus = annualSales * ANNUAL_BONUS[tier][planMix];
      return Math.round(annualCommission + monthlyCommission + bonus);
    };

    return {
      scout:      computeTier('scout'),
      partner:    computeTier('partner'),
      ambassador: computeTier('ambassador'),
    };
  }, [salesPerMonth, planMix, billingMix]);

  // ── Form state ──
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [hp, setHp] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/affiliate-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || 'Could not submit your application. Please try again.');
      } else {
        setSubmitOk(true);
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formValid =
    form.fullName.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) &&
    form.promotionUrls.trim().length >= 5 &&
    form.audienceSize &&
    form.niche &&
    form.pitch.trim().length >= 100 &&
    form.pitch.trim().length <= 600 &&
    form.agreed;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>

      {/* ───────────────────────── S00 — HERO ───────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-32 pb-16">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-amber-400/70 mb-6">
            Partner Program
          </p>
          <h1 className="text-[clamp(40px,7vw,68px)] font-black leading-[1.05] tracking-tight mb-6">
            Earn from the work
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              you&apos;d be doing anyway.
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Active Interakktive customers can earn 5% to 15% commission per sale plus cash bonuses on annual plans.
            Three tiers. Real progression. No fluff.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              Apply to join <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors"
            >
              See the tiers
            </a>
          </div>
        </div>

        {/* Inline tier preview rail */}
        <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto">
          {[
            { name: 'Scout', rate: '5%', from: 'from-white/[0.03]', border: 'border-white/[0.08]', text: 'text-white' },
            { name: 'Partner', rate: '10%', from: 'from-amber-500/5', border: 'border-amber-500/30', text: 'text-amber-300' },
            { name: 'Ambassador', rate: '15%', from: 'from-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-200' },
          ].map((t) => (
            <div key={t.name} className={`rounded-2xl border ${t.border} bg-gradient-to-b ${t.from} to-transparent px-3 py-4 text-center`}>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">{t.name}</p>
              <p className={`text-3xl font-black ${t.text}`}>{t.rate}</p>
              <p className="text-[10px] text-gray-500 mt-1">per sale</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── S01 — WHY THIS IS DIFFERENT ──────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            01 · Why partner with us
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Not your average affiliate program.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Customer-first</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              You have to be an active paying customer to apply. No mercenaries. Every affiliate uses what they recommend — which means the people you bring in actually get value, and the program stays clean.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Real revenue</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Interakktive plans are $50 to $100 per month. Annual subscriptions are $500 to $1,000. Your 5–15% lands on real money — not $5 trial signups that churn in a week.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <ArrowRight className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Tier progression</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Hit 6 lifetime sales → promoted to Partner (10%). Hit 11 → promoted to Ambassador (15%). Your commission rate climbs as you prove the work. No stagnant 5% forever.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Annual bonuses</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              On top of commission, annual subscriptions trigger flat cash bonuses at Partner ($25) and Ambassador ($25–$50). Stack a few annual sales and the bonuses alone justify the work.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────── S02 — WHAT YOU'D BE RECOMMENDING ─────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            02 · What you&apos;d be recommending
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            More than a few indicators.
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Interakktive isn&apos;t a script-rental business. It&apos;s a full trading intelligence stack — the tools, the education, the certifications, and the prop framework. Affiliates do better here because customers stay longer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ATLAS PRO Suite */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">ATLAS PRO Suite</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm mb-3">
              Premium TradingView indicators built on a unified intelligence architecture — CIPHER, PHANTOM, PULSE, RADAR, OPTIONS PRO and more.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Diagnostic, transparent, no black-box signals. Customers see <em>why</em>, not just what.
            </p>
          </div>

          {/* ATLAS Prop */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">ATLAS Prop</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm mb-3">
              Built for traders going through prop firm evaluations. Account tracking, drawdown discipline, kill lines, journal, R:R zones — and a dashboard that enforces the rules.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Bigger audience than retail because every prop trader needs this kind of structure.
            </p>
          </div>

          {/* ATLAS Academy */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">ATLAS Academy</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm mb-3">
              156 lessons and counting across 11 levels — from market mechanics to advanced operator-level methodology. Verifiable certifications in trading methodology, issued on lesson completion.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Customers don&apos;t just rent tools — they&apos;re learning a system. That&apos;s what makes them stay.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────── S03 — WHY CUSTOMERS STAY ─────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            03 · Why customers stay
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tools alone don&apos;t build retention.
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Every Interakktive customer gets ongoing access to the people building these tools. That&apos;s the difference between a one-off purchase and a recurring relationship — and it&apos;s why your commissions keep paying.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Live Discord discussions</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Active community on Discord where customers exchange setups, ask questions, and join scheduled discussions with the Interakktive team. Real humans, real answers — not a feedback form.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <Youtube className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">YouTube channel</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              The Interakktive YouTube channel publishes structured educational content — from fundamentals for absolute beginners to deep dives on advanced setups. Open to the public; customers get the deeper material on-site.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Recorded video library</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Past discussions, walk-throughs, and setup reviews — all archived inside the platform. Customers binge through them at their own pace, which deepens their use of the indicators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Direct messaging access</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              On-site messaging, email, and Discord DMs all reach the team directly. Customers can ask methodology questions and get personal responses — which is rare in this space at this price point.
            </p>
          </div>
        </div>

        {/* Retention payoff closing line */}
        <div className="mt-8 p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 text-center">
          <p className="text-gray-200 leading-relaxed">
            <strong className="text-amber-200">People don&apos;t churn from an ecosystem.</strong> They cancel one-off purchases. They keep paying for a community, a curriculum, and a credential. That&apos;s the math behind your commissions.
          </p>
        </div>
      </section>

      {/* ───────────────── S04 — WHO THIS IS FOR ───────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            04 · Who it&apos;s for
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Three kinds of partners thrive here.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Traders with a network',
              body: 'You don\'t need an audience. If you know a handful of serious traders, that\'s enough to cover your own subscription and then some. Most affiliates start here.',
            },
            {
              title: 'Content creators',
              body: 'YouTube, X, Telegram, Discord. From 1K to 100K followers. Recurring commission on real products beats one-off sponsor deals — and the people who bought through you stay subscribed.',
            },
            {
              title: 'Educators & desks',
              body: 'If you teach trading or run a small prop desk, your students and team are likely buyers anyway. Built-in monetization on tools they\'d use regardless.',
            },
          ].map((card, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/80 mb-3">0{i + 1}</p>
              <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── S05 — THE TIERS ─────────────────── */}
      <section id="tiers" className="max-w-6xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            05 · The tiers
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Three tiers. Climb by selling.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* SCOUT */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">Scout</p>
            </div>
            <p className="text-5xl font-black text-white mb-2">5%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">commission per sale</p>

            <ul className="space-y-3 text-sm text-gray-300 mb-6 flex-1">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span>5% commission on every paid signup</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span>Unique referral link + tracking dashboard</span>
              </li>
              <li className="flex gap-2 text-gray-500">
                <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center">—</span>
                <span>No cash bonuses</span>
              </li>
            </ul>

            <div className="pt-5 border-t border-white/[0.06]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">Promotes to Partner at</p>
              <p className="text-sm text-white font-semibold">6th lifetime sale</p>
            </div>
          </div>

          {/* PARTNER */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-7 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400">Partner</p>
            </div>
            <p className="text-5xl font-black text-amber-200 mb-2">10%</p>
            <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-6">commission per sale</p>

            <ul className="space-y-3 text-sm text-gray-300 mb-6 flex-1">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>10% commission on every paid signup</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-amber-200">$25 cash bonus</strong> on every annual sale</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Everything Scout includes</span>
              </li>
            </ul>

            <div className="pt-5 border-t border-amber-500/[0.15]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/70 mb-1">Promotes to Ambassador at</p>
              <p className="text-sm text-amber-200 font-semibold">11th lifetime sale</p>
            </div>
          </div>

          {/* AMBASSADOR */}
          <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/[0.12] via-amber-500/[0.04] to-transparent p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400/20 to-transparent px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-200">
              Top tier
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-amber-300" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-300">Ambassador</p>
            </div>
            <p className="text-5xl font-black bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent mb-2">15%</p>
            <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-6">commission per sale</p>

            <ul className="space-y-3 text-sm text-gray-300 mb-6 flex-1">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <span>15% commission on every paid signup</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <span><strong className="text-amber-200">$25 bonus</strong> on Starter/Advantage annual sales</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <span><strong className="text-amber-200">$50 bonus</strong> on Elite annual sales</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <span>Everything Partner includes</span>
              </li>
            </ul>

            <div className="pt-5 border-t border-amber-400/[0.2]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-amber-300/80 mb-1">Top tier</p>
              <p className="text-sm text-amber-100 font-semibold">Maintain with 2+ sales / 30 days</p>
            </div>
          </div>
        </div>

        {/* Tier mechanics callout */}
        <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/80 mb-4">How the tier system works</p>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p><strong className="text-white">Promotion is automatic.</strong> Your 6th lifetime sale promotes you to Partner from the next sale onward. Your 11th lifetime sale promotes you to Ambassador.</p>
            <p><strong className="text-white">Demotion gives you a warning first.</strong> If you make fewer than 2 sales in any rolling 30-day window, you get a warning — no demotion. If a second consecutive 30-day window also comes in below 2 sales, you drop one tier (or reset to Scout if you had zero sales).</p>
            <p><strong className="text-white">Sales count resets on demotion.</strong> If demoted, your lifetime count for tier purposes restarts. Historical totals are preserved in your records but don&apos;t carry forward — climbing back up is on the new clock.</p>
            <p><strong className="text-white">Bonuses are per qualifying sale.</strong> Every annual sale earns the bonus for your current tier. No one-time-per-affiliate caps.</p>
          </div>
        </div>
      </section>

      {/* ───────────────── S06 — EARNINGS CALCULATOR ───────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            06 · The math
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            What you&apos;d actually earn.
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Drag the controls. The numbers move in real time. Honest pre-tax estimates.
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] p-6 sm:p-10">
          {/* Sales per month — full width */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold tracking-widest uppercase text-amber-400/80">Sales per month</label>
              <span className="text-3xl font-black text-white tabular-nums">{salesPerMonth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={salesPerMonth}
              onChange={(e) => setSalesPerMonth(Number(e.target.value))}
              className="w-full accent-amber-400"
              aria-label="Sales per month"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 tabular-nums">
              <span>1</span><span>10</span><span>25</span>
            </div>
          </div>

          {/* Billing mix — three buttons */}
          <div className="mb-10">
            <label className="text-xs font-bold tracking-widest uppercase text-amber-400/80 block mb-3">How your referrals tend to pay</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                { key: 'mostly_monthly', label: 'Mostly monthly' },
                { key: 'fifty_fifty',    label: '50 / 50' },
                { key: 'mostly_annual',  label: 'Mostly annual' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setBillingMix(opt.key)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    billingMix === opt.key
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
              Annual plans trigger cash bonuses at Partner ($25) and Ambassador ($25–$50) — so an &ldquo;annual-heavy&rdquo; mix pays more.
            </p>
          </div>

          {/* Plan mix */}
          <div className="mb-10">
            <label className="text-xs font-bold tracking-widest uppercase text-amber-400/80 block mb-3">Most referrals buy</label>
            <div className="grid grid-cols-3 gap-2">
              {(['starter', 'advantage', 'elite'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlanMix(p)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    planMix === p
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {p === 'starter' ? 'Starter ($50/mo)' : p === 'advantage' ? 'Advantage ($75/mo)' : 'Elite ($100/mo)'}
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'scout', label: 'Scout · 5%', value: calc.scout, accent: 'text-white' },
              { key: 'partner', label: 'Partner · 10%', value: calc.partner, accent: 'text-amber-200' },
              { key: 'ambassador', label: 'Ambassador · 15%', value: calc.ambassador, accent: 'text-amber-100' },
            ].map((row) => (
              <div
                key={row.key}
                className={`rounded-2xl p-5 ${
                  row.key === 'ambassador'
                    ? 'border-2 border-amber-400/50 bg-amber-500/[0.06]'
                    : row.key === 'partner'
                    ? 'border border-amber-500/25 bg-amber-500/[0.03]'
                    : 'border border-white/10 bg-white/[0.02]'
                }`}
              >
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{row.label}</p>
                <p className={`text-4xl font-black tabular-nums ${row.accent}`}>
                  ${row.value.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-500 mt-1">per month</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
            Pre-tax estimate. Includes commission + annual bonuses. Assumes referrals stay subscribed for the period shown.
            Real earnings depend on referral retention, the actual plan/billing split of who you refer, and refunds.
          </p>
        </div>
      </section>

      {/* ───────────────── S07 — WHAT YOU GET ───────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            07 · What you get
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            When you&apos;re approved.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Unique referral link', body: 'Your personal link tracks every signup. Share it on socials, in your community, or one-to-one — every conversion attributes to you.' },
            { title: 'Real-time dashboard', body: 'See pending commission, cleared earnings, and paid-out totals. Track each referral by status — active, cancelled, or refunded.' },
            { title: 'Monthly payouts', body: 'Paid monthly via PayPal, Wise, or bank transfer — whichever you prefer. $50 minimum threshold, 30-day clearance window after each sale.' },
            { title: 'Brand assets', body: 'Clean logos, indicator screenshots, suggested copy. We add to this library as the program grows; in the early phase we hand-deliver assets you request.' },
          ].map((card, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/80 mb-2">0{i + 1}</p>
              <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── S08 — THE RULES ───────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            08 · The rules
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Honest fine print.
          </h2>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
          {[
            ['You must be an active paying Interakktive customer to apply — and to remain in the program. If your subscription lapses, your affiliate status is paused and previously-earned commissions remain payable; future commissions stop until you re-subscribe and re-apply.'],
            ['Sales made before you were approved as an affiliate don\'t count toward anything.'],
            ['No self-referrals. You can\'t use your link to upgrade your own account, or refer accounts you control.'],
            ['Cancelled sales (before the payout clears our account, typically the 30-day refund window) earn no commission.'],
            ['Demotion: fewer than 2 sales in a rolling 30-day window triggers a warning email. Two consecutive low windows demotes you one tier. Zero sales in the second window resets you to Scout.'],
            ['Commissions are paid pre-tax in USD. Affiliates handle their own taxes, conversion costs, and transfer fees.'],
            ['Promotion management — tier progression, demotion, and approval — is administered by Interakktive. Affiliates can\'t self-promote or manage other affiliates.'],
          ].map((rule, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-amber-400/70 font-mono text-xs flex-shrink-0 mt-1">0{i + 1}</span>
              <p className="text-gray-300 leading-relaxed text-sm">{rule[0]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── S09 — FAQ ───────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            09 · Common questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            FAQ.
          </h2>
        </div>

        <div className="space-y-3">
          {[
            { q: 'Do I need a big audience?',
              a: 'No. The program is open to active customers with any size of network. Most successful affiliates start by recommending Interakktive to a handful of trader friends and grow from there. The tier system rewards consistency, not raw scale.' },
            { q: 'What happens to my earnings if I cancel my Interakktive subscription?',
              a: 'Any commission you\'ve already earned (passed the 30-day clearance window) remains payable. Future commissions stop the moment your subscription lapses. To re-enter the program you re-subscribe and re-apply.' },
            { q: 'How do you track referrals?',
              a: 'Each approved affiliate gets a unique referral link. When someone clicks it and signs up within the attribution window, the sale attributes to you automatically. Real-time tracking is visible in your affiliate dashboard.' },
            { q: 'When and how do I get paid?',
              a: 'Payouts run monthly via PayPal, Wise, or bank transfer (your choice). $50 minimum threshold — balances below that roll over to the next month. Every sale has a 30-day clearance window before commission becomes payable, which protects against refunds.' },
            { q: 'Can I run paid ads with my link?',
              a: 'Yes with restrictions. You cannot bid on Interakktive brand terms, run misleading creative, or impersonate the brand. We supply approved creative on request. Unapproved paid promotion can result in disqualification from the program.' },
            { q: 'How do I apply?',
              a: 'Fill out the application below. We review every application personally within 48 hours. Approval is at our discretion — primarily based on alignment with the brand and the seriousness of the application.' },
          ].map((item, i) => (
            <details key={i} className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-colors">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="text-base font-bold text-white">{item.q}</span>
                <span className="text-amber-400 text-2xl group-open:rotate-45 transition-transform select-none">+</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────────────── S10 — APPLICATION FORM ───────────────── */}
      <section id="apply" className="max-w-2xl mx-auto px-5 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400/60 mb-3">
            10 · Apply
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to partner with us?
          </h2>
          <p className="text-gray-400 mt-4">
            Active Interakktive customers only. We review every application within 48 hours.
          </p>
        </div>

        {submitOk ? (
          <div className="p-8 rounded-2xl bg-amber-500/[0.05] border border-amber-500/30 text-center">
            <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold mb-2">Application received.</h3>
            <p className="text-gray-300 leading-relaxed">
              Thanks for applying. We review every application personally — usually within 48 hours.
              You&apos;ll hear back at <strong className="text-amber-200">{form.email}</strong>.
            </p>
            <p className="text-gray-500 text-sm mt-6">
              If you don&apos;t hear from us within 5 business days, email{' '}
              <a href="mailto:support@interakktive.com" className="text-amber-300 hover:underline">support@interakktive.com</a>.
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5">
            {/* Honeypot — hidden field, bots fill it */}
            <input
              type="text"
              name="website"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
              aria-hidden="true"
            />

            <Field label="Full name" required>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                placeholder="Your name"
              />
            </Field>

            <Field label="Email (must match your Interakktive account)" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="TradingView username (optional)">
              <input
                type="text"
                value={form.tvUsername}
                onChange={(e) => set('tvUsername', e.target.value)}
                maxLength={64}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                placeholder="Your TV handle"
              />
            </Field>

            <Field label="Where you'd promote" required hint="Paste the URLs — YouTube channels, X profiles, blog, Telegram, Discord. One per line is fine.">
              <textarea
                value={form.promotionUrls}
                onChange={(e) => set('promotionUrls', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors resize-y"
                placeholder="https://youtube.com/@yourchannel&#10;https://x.com/yourhandle"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Audience size" required>
                <select
                  value={form.audienceSize}
                  onChange={(e) => set('audienceSize', e.target.value as AudienceSize)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                >
                  <option value="">Select…</option>
                  <option value="under_500">Under 500</option>
                  <option value="500_5k">500 — 5K</option>
                  <option value="5k_50k">5K — 50K</option>
                  <option value="50k_500k">50K — 500K</option>
                  <option value="500k_plus">500K+</option>
                </select>
              </Field>

              <Field label="Primary niche" required>
                <select
                  value={form.niche}
                  onChange={(e) => set('niche', e.target.value as Niche)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                >
                  <option value="">Select…</option>
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                  <option value="indices">Indices</option>
                  <option value="commodities">Commodities</option>
                  <option value="mixed">Mixed</option>
                  <option value="educational">Educational</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <Field
              label="Why you want to partner with us"
              required
              hint={`${form.pitch.trim().length} / 100–600 characters`}
            >
              <textarea
                value={form.pitch}
                onChange={(e) => set('pitch', e.target.value)}
                rows={5}
                maxLength={600}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors resize-y"
                placeholder="Tell us a bit about your audience and how you'd talk about Interakktive…"
              />
            </Field>

            <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => set('agreed', e.target.checked)}
                className="mt-1 accent-amber-400"
              />
              <span className="text-xs text-gray-300 leading-relaxed">
                I confirm I&apos;m an active paying Interakktive customer and I&apos;ve read the program rules above. I understand commissions are paid pre-tax in USD and I&apos;m responsible for my own taxes and transfer fees.
              </span>
            </label>

            {submitError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 leading-relaxed">{submitError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formValid || submitting}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-black font-bold text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <>Submit application <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Or email us directly at{' '}
              <a href="mailto:support@interakktive.com" className="text-amber-300 hover:underline">
                support@interakktive.com
              </a>
            </p>
          </div>
        )}
      </section>

      {/* ───────────────── S11 — FOOTER NOTE ───────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-16 text-center border-t border-white/[0.06]">
        <Mail className="w-6 h-6 text-amber-400/60 mx-auto mb-4" />
        <p className="text-gray-400 text-sm leading-relaxed">
          Questions before you apply? Email{' '}
          <a href="mailto:support@interakktive.com" className="text-amber-300 hover:underline">
            support@interakktive.com
          </a>
          {' '}— or jump into{' '}
          <a href="https://discord.gg/kzrcwN7DVT" target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">
            our Discord
          </a>.
        </p>
        <p className="text-gray-600 text-xs mt-6 max-w-md mx-auto">
          Already an affiliate? Affiliate dashboard launches with the first wave of approvals.
        </p>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local field-wrapper for form layout (label + hint + slot)
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-amber-400/80 mb-2">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}
