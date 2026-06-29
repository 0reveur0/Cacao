'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';

const dashboardTranslations = {
  vi: {
    greetingMorning: 'Chào buổi sáng',
    greetingAfternoon: 'Chào buổi chiều',
    greetingEvening: 'Chào buổi tối',
    tagline: 'Thong thả học nhé. Hôm nay bạn muốn tìm hiểu thêm về chủ đề gì?',
    sectionMyCourses: 'Sổ tay môn học',
    sectionQuickAccess: 'Lối tắt không gian',
    courseActive: 'Đang học',
    courseCompleted: 'Đã xong',
    lastAccessed: 'Mở gần nhất:',
    noActiveCourses: 'Bạn chưa đăng ký môn học nào.',
    shortcutRoadmap: 'Lộ trình học tập',
    shortcutDiscussions: 'Góc thảo luận',
    shortcutAssignments: 'Bài tập Kanban',
    btnViewAll: 'Xem tất cả',
  },
  en: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    tagline: 'Take your time. What topic would you like to explore today?',
    sectionMyCourses: 'Subject Notebooks',
    sectionQuickAccess: 'Workspace Shortcuts',
    courseActive: 'In progress',
    courseCompleted: 'Done',
    lastAccessed: 'Last accessed:',
    noActiveCourses: 'No registered courses found.',
    shortcutRoadmap: 'Learning Roadmap',
    shortcutDiscussions: 'Discussion Board',
    shortcutAssignments: 'Kanban Board',
    btnViewAll: 'View all',
  },
} as const;

const initialCourses = [
  {
    id: 'lesson-1',
    title: 'TypeScript Fundamentals',
    subtitle: 'Nền tảng vững chắc',
    status: 'active',
    lastAccessed: 'Hôm qua',
  },
  {
    id: 'lesson-2',
    title: 'Microservices Architecture',
    subtitle: 'Thiết kế dịch vụ',
    status: 'active',
    lastAccessed: '2 ngày trước',
  },
  {
    id: 'lesson-3',
    title: 'Advanced AI Prompting',
    subtitle: 'Kỹ thuật nâng cao',
    status: 'completed',
    lastAccessed: 'Tuần trước',
  },
];

export default function DashboardPage() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [courses, setCourses] = useState(initialCourses);
  const [summary, setSummary] = useState({ active: 2, completed: 1, topic: 'TypeScript Fundamentals' });
  const [loading, setLoading] = useState(true);
  const t = dashboardTranslations[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem('cacao_tlms_locale');
    if (saved === 'en' || saved === 'vi') setLocale(saved);

    const loadSummary = async () => {
      try {
        const response = await fetch('/api/dashboard/summary');
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setSummary({
          active: data.activeCourses ?? 2,
          completed: data.completedCourses ?? 1,
          topic: data.currentTopic ?? 'TypeScript Fundamentals',
        });
        setCourses(data.courses ?? initialCourses);
      } catch {
        setCourses(initialCourses);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  }, [locale]);

  const toggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
    window.localStorage.setItem('cacao_tlms_locale', next);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white px-6 py-6">
            <div>
              <p className="text-sm font-medium text-neutral-600">{greeting}</p>
              <h1 className="mt-2 text-3xl font-medium leading-tight text-[#2F2F2F]">{t.tagline}</h1>
            </div>
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-2 text-sm font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
            >
              {locale === 'vi' ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
              {locale === 'vi' ? 'English' : 'Tiếng Việt'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-medium text-neutral-500">{t.sectionMyCourses}</p>
              <p className="mt-4 text-3xl font-medium text-[#2F2F2F]">{summary.active}</p>
              <p className="mt-2 text-sm font-normal text-neutral-600">{t.courseActive}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-medium text-neutral-500">{t.sectionMyCourses}</p>
              <p className="mt-4 text-3xl font-medium text-[#2F2F2F]">{summary.completed}</p>
              <p className="mt-2 text-sm font-normal text-neutral-600">{t.courseCompleted}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-medium text-neutral-500">{t.lastAccessed}</p>
              <p className="mt-4 text-lg font-medium text-[#2F2F2F]">{summary.topic}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-medium text-[#2F2F2F]">{t.sectionMyCourses}</p>
                <p className="mt-2 text-sm font-normal text-neutral-600">{t.tagline}</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium transition-colors duration-100 hover:bg-[#F1F1EF]" type="button">
                {t.btnViewAll}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {loading ? (
                <div className="col-span-full rounded-3xl border border-neutral-200 bg-[#FAFAFA] px-5 py-6 text-neutral-500">Loading...</div>
              ) : courses.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-neutral-200 bg-[#FAFAFA] px-5 py-6 text-neutral-600">{t.noActiveCourses}</div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="rounded-3xl border border-neutral-200 bg-[#FAFAFA] px-5 py-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-medium text-[#2F2F2F]">{course.title}</p>
                        <p className="mt-2 text-sm font-normal text-neutral-600">{course.subtitle}</p>
                      </div>
                      <div className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700">{course.status === 'active' ? t.courseActive : t.courseCompleted}</div>
                    </div>
                    <p className="mt-4 text-sm font-normal text-neutral-600">{t.lastAccessed} {course.lastAccessed}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
              <span>{t.sectionQuickAccess}</span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: t.shortcutRoadmap, icon: BookOpen },
                { label: t.shortcutDiscussions, icon: MessageSquare },
                { label: t.shortcutAssignments, icon: Clock },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-4 text-left text-sm font-medium text-[#2F2F2F] transition-colors duration-100 hover:bg-[#F1F1EF]"
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <Shield className="h-5 w-5" strokeWidth={1.5} />
              <span>Workspace overview</span>
            </div>
            <p className="mt-4 text-sm font-normal leading-6 text-neutral-600">
              {locale === 'vi'
                ? 'Mỗi ngày là một bước tiến nhỏ. Hãy dùng không gian này để xây dựng thói quen học tập bền vững.'
                : 'Every day is a small step forward. Use this workspace to build a sustainable learning habit.'}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
