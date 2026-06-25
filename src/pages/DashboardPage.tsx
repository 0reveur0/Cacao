/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import Sidebar from '../components/Sidebar';
import LessonDetailPage from '../components/LessonDetailPage';
import { AIFeedbackResponse } from '../types';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { lessons, quizzes, roadmap, progress, loading, onQuizComplete } = useProgress();
  const [activeItem, setActiveItem] = useState('workspace');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buổi sáng tốt lành';
    if (hour < 18) return 'Buổi chiều an la';
    return 'Buổi tối yên tĩnh';
  };

  const totalConcepts = lessons.reduce((sum, l) => sum + l.concepts.length, 0);
  const totalMastered = progress?.masteredConcepts.length ?? 0;
  const overallProgress = totalConcepts > 0 ? Math.round((totalMastered / totalConcepts) * 100) : 0;
  const activeLesson = roadmap.find((r) => !r.isCompleted && !r.isLocked);

  const handleLessonClick = (lessonId: string) => {
    const item = roadmap.find((r) => r.lessonId === lessonId);
    if (item && !item.isLocked) {
      setSelectedLessonId(lessonId);
    }
  };

  const handleQuizComplete = (passed: boolean, feedback: AIFeedbackResponse) => {
    if (selectedLessonId) {
      onQuizComplete(selectedLessonId, passed, feedback);
    }
  };

  // Lesson detail view
  if (selectedLessonId) {
    const lesson = lessons.find((l) => l.id === selectedLessonId);
    const quiz = quizzes[selectedLessonId];
    const item = roadmap.find((r) => r.lessonId === selectedLessonId);

    if (lesson) {
      return (
        <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
          <Sidebar
            activeItem={activeItem}
            onItemClick={setActiveItem}
            lessons={roadmap.map((r) => ({
              id: r.lessonId,
              title: r.title,
              status: r.isCompleted ? 'completed' : r.isLocked ? 'locked' : 'active',
            }))}
            onLessonClick={handleLessonClick}
          />
          <main className="flex-1 overflow-y-auto">
            <LessonDetailPage
              lesson={lesson}
              quiz={quiz || null}
              isLocked={item?.isLocked ?? false}
              onBack={() => setSelectedLessonId(null)}
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
          <p className="font-sans text-sm text-neutral-500">Đang tải lộ trình học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        lessons={roadmap.map((r) => ({
          id: r.lessonId,
          title: r.title,
          status: r.isCompleted ? 'completed' : r.isLocked ? 'locked' : 'active',
        }))}
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
              <span className="font-medium text-[#C5A880]">
                {roadmap.filter((r) => !r.isLocked && !r.isCompleted).length} bài học
              </span>{' '}
              đang chờ hoàn thiện.
            </p>
          </section>

          {/* Course title */}
          <section className="mb-8">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☕</span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-neutral-800">
                    Lập trình hướng tư duy tối giản cùng SQL
                  </h2>
                  <p className="font-sans text-xs text-neutral-400">
                    Mastery Learning · 3 bài học · Không có bảng xếp hạng
                  </p>
                </div>
              </div>
            </div>
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
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: '#C5A880' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>

              {activeLesson && (
                <button
                  onClick={() => handleLessonClick(activeLesson.lessonId)}
                  className="mt-4 w-full text-left p-4 rounded-lg border-l-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
                  style={{ backgroundColor: '#FAFAFA', borderLeftColor: '#C5A880' }}
                >
                  <div className="flex-1">
                    <p className="font-sans text-xs font-medium mb-1 text-neutral-400">Đang học:</p>
                    <p className="font-sans text-sm font-semibold text-neutral-800">
                      {activeLesson.title}
                    </p>
                  </div>
                  <span className="font-sans text-xs text-[#C5A880] font-medium">Tiếp tục →</span>
                </button>
              )}
            </div>
          </section>

          {/* Learning path with unlock animations */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-semibold tracking-wide mb-4 text-neutral-400">
              LỘ TRÌNH HỌC TẬP (MASTERY LEARNING)
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {roadmap.map((item, index) => (
                  <LessonCard
                    key={item.lessonId}
                    item={item}
                    index={index + 1}
                    onClick={() => handleLessonClick(item.lessonId)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-semibold tracking-wide mb-4 text-neutral-400">
              THỐNG KÊ HỌC TẬP
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon="📚" label="Bài học đã mở" value={String(roadmap.filter((r) => !r.isLocked).length)} />
              <StatCard icon="✅" label="Bài đã hoàn thành" value={String(roadmap.filter((r) => r.isCompleted).length)} />
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

interface RoadmapItem {
  lessonId: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  masteredConcepts: number;
  totalConcepts: number;
}

function LessonCard({
  item,
  index,
  onClick,
}: {
  item: RoadmapItem;
  index: number;
  onClick: () => void;
}) {
  const isLocked = item.isLocked;

  const getStatusDisplay = () => {
    if (item.isCompleted) {
      return { icon: '✓', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Đã làm chủ' };
    }
    if (!isLocked) {
      return { icon: '📖', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Đang học' };
    }
    return { icon: '🔒', bg: 'bg-neutral-100', text: 'text-neutral-400', label: 'Bị khóa' };
  };

  const status = getStatusDisplay();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={!isLocked ? { y: -2 } : undefined}
    >
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`w-full text-left rounded-xl border p-5 transition-all duration-200 ${
          isLocked
            ? 'cursor-not-allowed opacity-60 border-neutral-200 bg-white'
            : 'cursor-pointer hover:shadow-sm border-neutral-200 bg-white'
        } ${!isLocked && !item.isCompleted ? 'ring-1 ring-[#C5A880]/40' : ''}`}
      >
        <div className="flex items-start gap-4">
          {/* Status icon with unlock animation */}
          <motion.div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${status.bg} ${status.text}`}
            key={status.icon}
            initial={{ scale: 0.6, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {status.icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-sans text-sm font-semibold mb-1 ${isLocked ? 'text-neutral-400' : 'text-neutral-800'}`}>
              {item.title}
            </h3>
            <p className="font-sans text-xs text-neutral-400 mb-3">{item.description}</p>

            {!isLocked && !item.isCompleted && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-neutral-100">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: '#C5A880' }}
                    initial={{ width: 0 }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="font-sans text-xs font-medium text-[#C5A880]">0%</span>
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
              {item.masteredConcepts}/{item.totalConcepts} khái niệm
            </p>
          </div>
        </div>
      </button>
    </motion.div>
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
