/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LessonDetailPage from '../components/LessonDetailPage';
import { Lesson, Quiz, TLMSState, AIFeedbackResponse } from '../types';

interface DashboardLesson {
  id: string;
  title: string;
  description: string;
  order: number;
  concepts: string[];
  status: 'completed' | 'active' | 'locked';
  progress: number;
  masteredConcepts: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeItem, setActiveItem] = useState('workspace');
  const [state, setState] = useState<TLMSState | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tlms/state')
      .then((res) => res.json())
      .then((data) => {
        setState(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load state:', err);
        setLoading(false);
      });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buổi sáng tốt lành';
    if (hour < 18) return 'Buổi chiều an la';
    return 'Buổi tối yên tĩnh';
  };

  const lessons: DashboardLesson[] = (state?.lessons || []).map((lesson) => {
    const isUnlocked = state?.progress.unlockedLessonIds.includes(lesson.id) ?? false;
    const isCompleted = state?.progress.completedLessonIds.includes(lesson.id) ?? false;
    const masteredCount = lesson.concepts.filter((c) =>
      state?.progress.masteredConcepts.includes(c)
    ).length;

    let status: DashboardLesson['status'] = 'locked';
    if (isCompleted) status = 'completed';
    else if (isUnlocked) status = 'active';

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      concepts: lesson.concepts,
      status,
      progress: isCompleted ? 100 : 0,
      masteredConcepts: masteredCount,
    };
  });

  const currentLesson = lessons.find((l) => l.status === 'active');
  const totalConcepts = lessons.reduce((sum, l) => sum + l.concepts.length, 0);
  const totalMastered = lessons.reduce((sum, l) => sum + l.masteredConcepts, 0);
  const overallProgress = totalConcepts > 0 ? Math.round((totalMastered / totalConcepts) * 100) : 0;

  const handleLessonClick = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson && lesson.status !== 'locked') {
      setSelectedLessonId(lessonId);
    }
  };

  const handleBack = () => setSelectedLessonId(null);

  const handleQuizComplete = (passed: boolean, _feedback: AIFeedbackResponse) => {
    if (passed) {
      fetch('/api/tlms/state')
        .then((res) => res.json())
        .then(setState)
        .catch(() => {});
    }
  };

  // Lesson detail view
  if (selectedLessonId && state) {
    const lesson = state.lessons.find((l) => l.id === selectedLessonId);
    const quiz = state.quizzes[selectedLessonId];
    const dashboardLesson = lessons.find((l) => l.id === selectedLessonId);
    const isLocked = dashboardLesson?.status === 'locked';

    if (lesson) {
      return (
        <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
          <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        lessons={lessons}
        onLessonClick={handleLessonClick}
      />
          <main className="flex-1 overflow-y-auto">
            <LessonDetailPage
              lesson={lesson}
              quiz={quiz || null}
              isLocked={isLocked}
              onBack={handleBack}
              onQuizComplete={handleQuizComplete}
            />
          </main>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#F5EBE0' }}>
            <span className="text-2xl">☕</span>
          </div>
          <p className="font-sans text-sm text-neutral-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        lessons={lessons}
        onLessonClick={handleLessonClick}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Greeting */}
          <section className="mb-10">
            <p className="font-sans text-sm mb-2 text-neutral-500">{getGreeting()}</p>
            <h1 className="font-heading text-3xl font-semibold mb-3 text-neutral-800">
              {profile?.name ? `👋 Hi, ${profile.name}! Thong thả học nhé.` : '👋 Chào bạn!'}
            </h1>
            <p className="font-sans text-base text-neutral-500">
              Hôm nay bạn có{' '}
              <span className="font-medium text-[#C5A880]">{lessons.filter((l) => l.status === 'active').length} bài học</span>{' '}
              đang chờ hoàn thiện.
            </p>
          </section>

          {/* Progress */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-semibold tracking-wide mb-4 text-neutral-400">
              TIẾN ĐỘ CÁ NHÂN
            </h2>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-neutral-800">
                      Làm chủ kiến thức: {overallProgress}%
                    </h3>
                    <p className="font-sans text-xs text-neutral-400">
                      Chỉ so sánh với chính bạn · Không có bảng xếp hạng
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl font-semibold text-[#C5A880]">
                    {totalMastered}/{totalConcepts}
                  </p>
                  <p className="font-sans text-xs text-neutral-400">Khái niệm</p>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%`, backgroundColor: '#C5A880' }}
                />
              </div>

              {currentLesson && (
                <button
                  onClick={() => handleLessonClick(currentLesson.id)}
                  className="mt-4 w-full text-left p-4 rounded-lg border-l-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
                  style={{ backgroundColor: '#FAFAFA', borderLeftColor: '#C5A880' }}
                >
                  <div className="flex-1">
                    <p className="font-sans text-xs font-medium mb-1 text-neutral-400">Đang học:</p>
                    <p className="font-sans text-sm font-semibold text-neutral-800">
                      {currentLesson.title}
                    </p>
                  </div>
                  <span className="font-sans text-xs text-[#C5A880] font-medium">Tiếp tục →</span>
                </button>
              )}
            </div>
          </section>

          {/* Learning path */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-semibold tracking-wide mb-4 text-neutral-400">
              LỘ TRÌNH HỌC TẬP (MASTERY LEARNING)
            </h2>
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index + 1}
                  onClick={() => handleLessonClick(lesson.id)}
                />
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-semibold tracking-wide mb-4 text-neutral-400">
              THỐNG KÊ HỌC TẬP
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon="📚" label="Bài học đã mở" value={String(lessons.filter((l) => l.status !== 'locked').length)} />
              <StatCard icon="✅" label="Bài đã hoàn thành" value={String(lessons.filter((l) => l.status === 'completed').length)} />
              <StatCard icon="⭐" label="Khái niệm làm chủ" value={String(totalMastered)} />
              <StatCard icon="🔥" label="Chuỗi học tập" value="3 ngày" />
            </div>
          </section>

          {/* Motivational */}
          <section className="mt-10 p-5 rounded-xl" style={{ backgroundColor: '#F5EBE0' }}>
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-sans text-sm font-semibold mb-1 text-neutral-800">
                  Lời nhắn từ Cacao
                </h3>
                <p className="font-sans text-sm text-neutral-600 leading-relaxed">
                  Trong hệ thống Cacao, việc làm sai chỉ là một phần tự nhiên của hành trình làm chủ kiến thức.
                  Không có điểm số phán xét, không có bảng xếp hạng. Bạn chỉ cần so sánh với chính mình của hôm qua!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  onClick,
}: {
  lesson: DashboardLesson;
  index: number;
  onClick: () => void;
}) {
  const isLocked = lesson.status === 'locked';

  const getStatusDisplay = () => {
    if (lesson.status === 'completed') {
      return { icon: '✓', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Đã làm chủ' };
    }
    if (lesson.status === 'active') {
      return { icon: '📖', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Đang học' };
    }
    return { icon: '🔒', bg: 'bg-neutral-100', text: 'text-neutral-400', label: 'Bị khóa' };
  };

  const status = getStatusDisplay();

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left rounded-xl border p-5 transition-all duration-200 ${
        isLocked
          ? 'cursor-not-allowed opacity-60 border-neutral-200 bg-white'
          : 'cursor-pointer hover:shadow-sm hover:-translate-y-0.5 border-neutral-200 bg-white'
      } ${lesson.status === 'active' ? 'ring-1 ring-[#C5A880]/40' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${status.bg} ${status.text}`}
        >
          {status.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-sans text-sm font-semibold mb-1 ${isLocked ? 'text-neutral-400' : 'text-neutral-800'}`}>
            {lesson.title}
          </h3>
          <p className="font-sans text-xs text-neutral-400 mb-3">{lesson.description}</p>

          {lesson.status === 'active' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-neutral-100">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${lesson.progress}%`, backgroundColor: '#C5A880' }}
                />
              </div>
              <span className="font-sans text-xs font-medium text-[#C5A880]">{lesson.progress}%</span>
            </div>
          )}

          {isLocked && (
            <p className="font-sans text-xs text-neutral-400">Sẽ mở khi bạn đạt Mastery bài trước</p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <span className={`inline-block font-sans text-xs font-medium px-2.5 py-1 rounded-md ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <p className="font-sans text-xs text-neutral-400 mt-2">
            {lesson.masteredConcepts}/{lesson.concepts.length} khái niệm
          </p>
        </div>
      </div>
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-[#C5A880]/40 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="font-sans text-xs text-neutral-400">{label}</p>
      </div>
      <p className="font-heading text-xl font-semibold text-neutral-800">{value}</p>
    </div>
  );
}
