import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Safely query Academy tables which may not exist
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

    // Pull all academy data + users for enrichment
    const [lessonsRes, progressRes, certsRes, coursesRes, usersRes] = await Promise.all([
      safeQuery(() => supabase.from('academy_lessons').select('*').order('sort_order')),
      safeQuery(() => supabase.from('academy_progress').select('*')),
      safeQuery(() => supabase.from('academy_certificates').select('*')),
      safeQuery(() => supabase.from('academy_courses').select('*').order('sort_order')),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const lessons = lessonsRes.data || [];
    const progress = progressRes.data || [];
    const certs = certsRes.data || [];
    const courses = coursesRes.data || [];
    const users = usersRes.data?.users || [];

    // Map user_id → email
    const emailByUserId = new Map<string, string>();
    for (const u of users) if (u.id && u.email) emailByUserId.set(u.id, u.email);

    // Progress and certs per lesson (aggregates)
    const progressByLesson = new Map<string, any[]>();
    for (const p of progress) {
      if (!progressByLesson.has(p.lesson_id)) progressByLesson.set(p.lesson_id, []);
      progressByLesson.get(p.lesson_id)!.push(p);
    }

    const certsByLesson = new Map<string, number>();
    for (const c of certs) {
      certsByLesson.set(c.lesson_id, (certsByLesson.get(c.lesson_id) || 0) + 1);
    }

    // Enrich lessons with completion stats
    const enrichedLessons = lessons.map((l: any) => {
      const lessonProgress = progressByLesson.get(l.id) || [];
      const started = lessonProgress.length;
      const completed = lessonProgress.filter((p: any) => p.completed_at !== null).length;
      const passed = lessonProgress.filter((p: any) => p.quiz_passed).length;
      const certsIssued = certsByLesson.get(l.id) || 0;
      const avgScore = lessonProgress.filter((p: any) => p.quiz_score !== null).length > 0
        ? lessonProgress.filter((p: any) => p.quiz_score !== null).reduce((s: number, p: any) => s + p.quiz_score, 0) / lessonProgress.filter((p: any) => p.quiz_score !== null).length
        : null;

      return {
        id: l.id,
        title: l.title,
        courseId: l.course_id,
        sortOrder: l.sort_order,
        isPublished: l.is_published,
        isFree: l.is_free,
        totalSections: l.total_sections,
        started,
        completed,
        passed,
        certsIssued,
        avgScore: avgScore ? Math.round(avgScore) : null,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
      };
    });

    // Top learners
    const progressByUser = new Map<string, any[]>();
    for (const p of progress) {
      if (!progressByUser.has(p.user_id)) progressByUser.set(p.user_id, []);
      progressByUser.get(p.user_id)!.push(p);
    }

    const certsByUser = new Map<string, number>();
    for (const c of certs) {
      certsByUser.set(c.user_id, (certsByUser.get(c.user_id) || 0) + 1);
    }

    const topLearners = Array.from(progressByUser.entries())
      .map(([userId, items]) => ({
        userId,
        email: emailByUserId.get(userId) || 'unknown',
        lessonsStarted: items.length,
        lessonsCompleted: items.filter((p: any) => p.completed_at !== null).length,
        certsEarned: certsByUser.get(userId) || 0,
        avgScore: items.filter((p: any) => p.quiz_score !== null).length > 0
          ? Math.round(items.filter((p: any) => p.quiz_score !== null).reduce((s: number, p: any) => s + p.quiz_score, 0) / items.filter((p: any) => p.quiz_score !== null).length)
          : null,
      }))
      .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted);

    // Overall metrics
    const metrics = {
      totalLessons: lessons.length,
      totalCourses: courses.length,
      totalLearners: progressByUser.size,
      totalEnrollments: progress.length,
      totalCertificates: certs.length,
      totalCompletions: progress.filter((p: any) => p.completed_at !== null).length,
    };

    return NextResponse.json({
      metrics,
      courses,
      lessons: enrichedLessons,
      topLearners: topLearners.slice(0, 50), // cap to top 50
    });
  } catch (err: any) {
    console.error('Academy overview error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load academy' }, { status: 500 });
  }
}
