import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plan prices in cents (USD) — mirrors pricing page.
// Source of truth: app/lib/indicators-data.ts
const PLAN_PRICES = {
  starter:   { monthly: 5000,  annual: 50000  },
  advantage: { monthly: 7500,  annual: 75000  },
  elite:     { monthly: 10000, annual: 100000 },
} as const;

function monthlyValueCents(plan: string, billing: string): number {
  const p = (PLAN_PRICES as any)[plan];
  if (!p) return 0;
  if (billing === 'annual') return Math.round(p.annual / 12);
  return p.monthly;
}

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

const safeQuery = async (fn: () => any): Promise<{ data: any[] }> => {
  try {
    const res = await fn();
    return { data: res.data || [] };
  } catch {
    return { data: [] };
  }
};

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [subsRes, churnRes] = await Promise.all([
      supabase.from('subscriptions').select('*'),
      safeQuery(() => supabase.from('churn_reasons').select('*')),
    ]);

    const allSubs = subsRes.data || [];
    const churn = churnRes.data || [];

    // ── 1. MRR trend — last 12 months ──
    // For each month end, what was MRR at that point in time?
    // A sub contributes to month M's MRR if:
    //   - created_at <= last day of M
    //   - AND (current_period_end >= first day of M OR status in active/cancelling)
    // Simpler approximation: count active+cancelling subs as of each month
    const mrrTrend: { month: string; mrrCents: number; activeCount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const activeSubs = allSubs.filter((s: any) => {
        const created = new Date(s.created_at);
        if (created > monthEnd) return false;
        // If sub was cancelled, only count if cancellation happened AFTER this month
        if (s.status === 'cancelled') {
          const cancelledAt = new Date(s.updated_at);
          if (cancelledAt <= monthEnd) return false;
        }
        return true;
      });

      const mrr = activeSubs.reduce((sum: number, s: any) => sum + monthlyValueCents(s.plan, s.billing), 0);
      mrrTrend.push({
        month: formatYearMonth(monthStart),
        mrrCents: mrr,
        activeCount: activeSubs.length,
      });
    }

    // ── 2. Cohort retention ──
    // Cohort = month a user first subscribed.
    // Retention: for cohort X at month M, what % of cohort X still had an active sub?
    // Build cohorts by signup month, then walk each month checking active status
    const cohortMap = new Map<string, { ids: Set<string>; months: Map<string, number> }>();

    for (const s of allSubs) {
      const created = new Date(s.created_at);
      const cohortKey = formatYearMonth(created);
      if (!cohortMap.has(cohortKey)) {
        cohortMap.set(cohortKey, { ids: new Set(), months: new Map() });
      }
      const cohort = cohortMap.get(cohortKey)!;
      const userKey = s.user_id || s.user_email; // group by user
      cohort.ids.add(userKey);
    }

    // For each cohort month, count how many were still active N months later
    const cohortRows: Array<{
      cohort: string;
      size: number;
      retention: (number | null)[]; // index 0 = month 0, index 1 = month 1 ...
    }> = [];

    const sortedCohortKeys = Array.from(cohortMap.keys()).sort();
    for (const cohortKey of sortedCohortKeys) {
      const cohort = cohortMap.get(cohortKey)!;
      const [y, m] = cohortKey.split('-').map(Number);
      const cohortDate = new Date(y, m - 1, 1);
      const monthsToShow = Math.min(12, Math.floor((now.getTime() - cohortDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1);

      const retention: (number | null)[] = [];
      for (let offset = 0; offset < 12; offset++) {
        if (offset >= monthsToShow) {
          retention.push(null);
          continue;
        }
        const targetMonthEnd = new Date(y, m - 1 + offset + 1, 0, 23, 59, 59);

        let stillActive = 0;
        for (const userKey of cohort.ids) {
          // Check if this user had ANY active sub at targetMonthEnd
          const userSubs = allSubs.filter((s: any) => (s.user_id || s.user_email) === userKey);
          const activeAtTarget = userSubs.some((s: any) => {
            const created = new Date(s.created_at);
            if (created > targetMonthEnd) return false;
            if (s.status === 'cancelled') {
              const cancelledAt = new Date(s.updated_at);
              if (cancelledAt <= targetMonthEnd) return false;
            }
            return true;
          });
          if (activeAtTarget) stillActive++;
        }
        retention.push(cohort.ids.size > 0 ? Math.round((stillActive / cohort.ids.size) * 100) : 0);
      }

      cohortRows.push({
        cohort: cohortKey,
        size: cohort.ids.size,
        retention,
      });
    }

    // ── 3. LTV per plan ──
    // For each plan, avg of (monthly value * avg months a sub stayed active)
    const ltvByPlan: Record<string, { avgLifetimeMonths: number; avgMonthlyValueCents: number; ltvCents: number; subCount: number }> = {};

    for (const plan of ['starter', 'advantage', 'elite']) {
      const planSubs = allSubs.filter((s: any) => s.plan === plan);
      if (planSubs.length === 0) continue;

      // Avg monthly value
      const totalMonthly = planSubs.reduce((sum: number, s: any) => sum + monthlyValueCents(s.plan, s.billing), 0);
      const avgMonthly = Math.round(totalMonthly / planSubs.length);

      // Avg lifetime: for cancelled subs, months from created_at → updated_at
      // For active subs, months from created_at → now (lower-bound of final LTV)
      const lifetimes = planSubs.map((s: any) => {
        const start = new Date(s.created_at).getTime();
        const end = s.status === 'cancelled'
          ? new Date(s.updated_at).getTime()
          : now.getTime();
        return Math.max(1, (end - start) / (1000 * 60 * 60 * 24 * 30));
      });
      const avgLifetime = lifetimes.reduce((s: number, x: number) => s + x, 0) / lifetimes.length;

      ltvByPlan[plan] = {
        avgLifetimeMonths: Math.round(avgLifetime * 10) / 10,
        avgMonthlyValueCents: avgMonthly,
        ltvCents: Math.round(avgLifetime * avgMonthly),
        subCount: planSubs.length,
      };
    }

    // ── 4. Billing mix ──
    const active = allSubs.filter((s: any) => s.status === 'active' || s.status === 'cancelling');
    const monthlyActive = active.filter((s: any) => s.billing === 'monthly').length;
    const annualActive = active.filter((s: any) => s.billing === 'annual').length;

    // ── 5. Churn reasons aggregation ──
    const reasonCounts: Record<string, number> = {};
    for (const c of churn) {
      reasonCounts[c.reason_code] = (reasonCounts[c.reason_code] || 0) + 1;
    }
    const churnReasons = Object.entries(reasonCounts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    // ── 6. Recent churn entries (last 20 with detail) ──
    const recentChurn = churn
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    return NextResponse.json({
      mrrTrend,
      cohortRetention: cohortRows.slice(-12), // last 12 cohorts max
      ltvByPlan,
      billingMix: {
        monthly: monthlyActive,
        annual: annualActive,
        totalActive: active.length,
      },
      churnReasons,
      recentChurn,
      totalChurnCount: churn.length,
    });
  } catch (err: any) {
    console.error('Revenue error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load revenue' }, { status: 500 });
  }
}
