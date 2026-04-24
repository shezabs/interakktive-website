'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, BookOpen, Award, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { adminFetch } from '../lib-client';
import DataTable, { Column } from '../components/DataTable';
import { formatRelative } from '../components/shared';

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  sortOrder: number;
  isPublished: boolean;
  isFree: boolean;
  totalSections: number;
  started: number;
  completed: number;
  passed: number;
  certsIssued: number;
  avgScore: number | null;
  completionRate: number;
}

interface TopLearner {
  userId: string;
  email: string;
  lessonsStarted: number;
  lessonsCompleted: number;
  certsEarned: number;
  avgScore: number | null;
}

interface AcademyData {
  metrics: {
    totalLessons: number;
    totalCourses: number;
    totalLearners: number;
    totalEnrollments: number;
    totalCertificates: number;
    totalCompletions: number;
  };
  courses: any[];
  lessons: Lesson[];
  topLearners: TopLearner[];
}

export default function AdminAcademyPage() {
  const [data, setData] = useState<AcademyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'lessons' | 'learners'>('lessons');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/academy')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredLessons = (data?.lessons || []).filter((l) => {
    if (courseFilter === 'all') return true;
    return l.courseId === courseFilter;
  });

  const lessonColumns: Column<Lesson>[] = [
    {
      key: 'sortOrder', header: '#', sortable: true,
      render: (l) => <span className="text-xs text-gray-500">{l.sortOrder}</span>,
    },
    {
      key: 'title', header: 'Lesson', sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">{l.title}</span>
          {!l.isPublished && <span className="text-xs text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">draft</span>}
          {l.isFree && <span className="text-xs text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">free</span>}
        </div>
      ),
    },
    {
      key: 'courseId', header: 'Course',
      render: (l) => <span className="text-xs text-gray-500">{l.courseId.replace('level-', 'L').replace('-', ' ')}</span>,
    },
    {
      key: 'started', header: 'Started', sortable: true,
      render: (l) => <span className="text-xs text-gray-400">{l.started}</span>,
    },
    {
      key: 'completed', header: 'Completed', sortable: true,
      render: (l) => <span className="text-xs text-teal-400">{l.completed}</span>,
    },
    {
      key: 'completionRate', header: 'Rate', sortable: true,
      render: (l) => (
        l.started > 0
          ? <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${l.completionRate >= 70 ? 'bg-teal-400' : l.completionRate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${l.completionRate}%` }} />
              </div>
              <span className="text-xs text-gray-400">{l.completionRate}%</span>
            </div>
          : <span className="text-xs text-gray-600">—</span>
      ),
    },
    {
      key: 'avgScore', header: 'Avg score', sortable: true,
      render: (l) => l.avgScore !== null ? <span className="text-xs text-gray-400">{l.avgScore}%</span> : <span className="text-xs text-gray-600">—</span>,
    },
    {
      key: 'certsIssued', header: 'Certs', sortable: true,
      render: (l) => <span className="text-xs text-amber-400">{l.certsIssued}</span>,
    },
  ];

  const learnerColumns: Column<TopLearner>[] = [
    {
      key: 'email', header: 'Email', sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2">
          <span className="text-white truncate max-w-[260px]">{l.email}</span>
          <Link
            href={`/admin/timeline/${l.userId}`}
            className="text-xs text-amber-400 hover:text-amber-300"
            title="View timeline"
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
    {
      key: 'lessonsStarted', header: 'Started', sortable: true,
      render: (l) => <span className="text-xs text-gray-400">{l.lessonsStarted}</span>,
    },
    {
      key: 'lessonsCompleted', header: 'Completed', sortable: true,
      render: (l) => <span className="text-xs text-teal-400">{l.lessonsCompleted}</span>,
    },
    {
      key: 'certsEarned', header: 'Certs earned', sortable: true,
      render: (l) => <span className="text-xs text-amber-400">{l.certsEarned}</span>,
    },
    {
      key: 'avgScore', header: 'Avg score', sortable: true,
      render: (l) => l.avgScore !== null ? <span className="text-xs text-gray-400">{l.avgScore}%</span> : <span className="text-xs text-gray-600">—</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Academy</h1>
          <p className="text-sm text-gray-500">Lesson engagement and learner progress.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Total lessons</p>
              <p className="text-xl font-bold text-white">{data.metrics.totalLessons}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Total learners</p>
              <p className="text-xl font-bold text-white">{data.metrics.totalLearners}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Completions</p>
              <p className="text-xl font-bold text-teal-400">{data.metrics.totalCompletions.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500">Certificates issued</p>
              <p className="text-xl font-bold text-amber-400">{data.metrics.totalCertificates.toLocaleString()}</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 border-b border-white/10">
            <button
              onClick={() => setTab('lessons')}
              className={`px-4 py-2 text-sm transition-colors ${
                tab === 'lessons' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Lessons ({data.lessons.length})
            </button>
            <button
              onClick={() => setTab('learners')}
              className={`px-4 py-2 text-sm transition-colors ${
                tab === 'learners' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Top learners ({data.topLearners.length})
            </button>
          </div>

          {tab === 'lessons' && (
            <>
              {/* Course filter chips */}
              {data.courses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCourseFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      courseFilter === 'all'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >All courses</button>
                  {data.courses.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setCourseFilter(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        courseFilter === c.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >L{c.level} {c.title}</button>
                  ))}
                </div>
              )}

              <DataTable
                columns={lessonColumns}
                rows={filteredLessons}
                rowKey={(l) => l.id}
                searchFields={(l) => `${l.title} ${l.courseId}`}
                searchPlaceholder="Search by lesson title..."
                pageSize={100}
              />
            </>
          )}

          {tab === 'learners' && (
            <DataTable
              columns={learnerColumns}
              rows={data.topLearners}
              rowKey={(l) => l.userId}
              searchFields={(l) => l.email}
              searchPlaceholder="Search by learner email..."
              pageSize={50}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
