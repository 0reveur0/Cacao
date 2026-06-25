/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { ChevronRight, Clock, BookOpen, Award, TrendingUp } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  progress?: number;
  concepts: number;
  masteredConcepts: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeItem, setActiveItem] = useState('workspace');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buoi sang tot lanh';
    if (hour < 18) return 'Buoi chieu an la';
    return 'Buoi toi yen tinh';
  };

  const lessons: Lesson[] = [
    {
      id: 'lesson-1',
      title: 'Lesson 1: Type Safety & Su Chat Che trong Kien Truc He Thong',
      description: 'Khám phá bản chất của sự an toàn kiểu dữ liệu để triệt tiêu lỗi vận hành.',
      status: 'completed',
      progress: 100,
      concepts: 3,
      masteredConcepts: 3,
    },
    {
      id: 'lesson-2',
      title: 'Lesson 2: Mastering Generics & Mapped Types',
      description: 'Kiến tạo Utility Types thông minh và tái sử dụng code linh hoạt.',
      status: 'active',
      progress: 65,
      concepts: 3,
      masteredConcepts: 2,
    },
    {
      id: 'lesson-3',
      title: 'Lesson 3: Event-Driven Microservices voi Apache Kafka',
      description: 'Thiết kế hệ thống phân tán chịu tải cao, giao tiếp bất đồng bộ.',
      status: 'locked',
      concepts: 3,
      masteredConcepts: 0,
    },
    {
      id: 'lesson-4',
      title: 'Lesson 4: Ung Dung Tri Tue Nhan Tao & Chan Doan AI',
      description: 'Thiết kế Prompt chẩn đoán lỗi sai, định hướng tư duy sư phạm.',
      status: 'locked',
      concepts: 3,
      masteredConcepts: 0,
    },
  ];

  const currentLesson = lessons.find(l => l.status === 'active');
  const overallProgress = Math.round(
    (lessons.reduce((sum, l) => sum + (l.masteredConcepts || 0), 0) /
      lessons.reduce((sum, l) => sum + l.concepts, 0)) * 100
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* ===== BLOCK 1: Personalized Greeting ===== */}
          <section className="mb-10">
            <p className="text-sm mb-2" style={{ color: '#6B6B6B' }}>
              {getGreeting()}
            </p>
            <h1 className="text-3xl font-semibold mb-3" style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}>
              {profile?.name ? `👋 Hi, ${profile.name}! Thong thả học nhé.` : '👋 Chao ban!'}
            </h1>
            <p className="text-base" style={{ color: '#6B6B6B' }}>
              Hom nay ban co <span className="font-medium" style={{ color: '#C5A880' }}>1 bai hoc moi</span> va{' '}
              <span className="font-medium" style={{ color: '#C5A880' }}>1 bai tap</span> can hoan thien.
            </p>
          </section>

          {/* ===== BLOCK 2: Personal Progress Bar ===== */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-wide mb-4" style={{ color: '#9B9B9B' }}>
              TIEN DO CA NHAN
            </h2>
            <div
              className="rounded-lg border p-5 transition-all duration-200"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#2F2F2F' }}>
                      Lam chu kien thuc: {overallProgress}%
                    </h3>
                    <p className="text-xs" style={{ color: '#9B9B9B' }}>
                      Chi so sanh voi chinh ban - Khong co bang xep hang
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold" style={{ color: '#C5A880' }}>
                    {lessons.reduce((sum, l) => sum + l.masteredConcepts, 0)}/{lessons.reduce((sum, l) => sum + l.concepts, 0)}
                  </p>
                  <p className="text-xs" style={{ color: '#9B9B9B' }}>Khai niem</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%`, backgroundColor: '#C5A880' }}
                />
              </div>

              {/* Current Lesson Highlight */}
              {currentLesson && (
                <div
                  className="mt-4 p-4 rounded-lg border-l-4 flex items-center gap-4"
                  style={{ backgroundColor: '#FAFAFA', borderLeftColor: '#C5A880' }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium mb-1" style={{ color: '#9B9B9B' }}>
                      Dang hoc:
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#2F2F2F' }}>
                      {currentLesson.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold" style={{ color: '#C5A880' }}>
                      {currentLesson.progress}%
                    </p>
                    <p className="text-xs" style={{ color: '#9B9B9B' }}>Hoan thanh</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===== BLOCK 3: Mastery Learning Path ===== */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-wide mb-4" style={{ color: '#9B9B9B' }}>
              LO TRINH HOC TAP (MASTERY LEARNING)
            </h2>

            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index + 1}
                  previousIncomplete={index > 0 && lessons[index - 1].status !== 'completed'}
                />
              ))}
            </div>
          </section>

          {/* ===== BLOCK 4: Quick Stats ===== */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-wide mb-4" style={{ color: '#9B9B9B' }}>
              THONG KE HOC TAP
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon="📚" label="Bai hoc da mo" value="2" />
              <StatCard icon="✅" label="Bai da hoan thanh" value="1" />
              <StatCard icon="⭐" label="Khai niem lam chu" value="5" />
              <StatCard icon="🔥" label="Chuoi hoc tap" value="3 ngay" />
            </div>
          </section>

          {/* ===== BLOCK 5: Recent Activity ===== */}
          <section>
            <h2 className="text-xs font-semibold tracking-wide mb-4" style={{ color: '#9B9B9B' }}>
              HOAT DONG GAN DAY
            </h2>
            <div
              className="rounded-lg border overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
            >
              {[
                { icon: '✅', action: 'Hoan thanh bai quiz Lesson 1', time: '2 phut truoc', score: '100%' },
                { icon: '📖', action: 'Xem bai giang Lesson 2: Generics', time: '1 gio truoc', score: null },
                { icon: '⭐', action: 'Lam chu khai niem Type Guards', time: '3 gio truoc', score: null },
                { icon: '📝', action: 'Bat dau bai tap Lesson 2', time: '5 gio truoc', score: null },
              ].map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 transition-all duration-150`}
                  style={{
                    borderBottom: index < 3 ? '1px solid #E5E5E5' : 'none',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#2F2F2F' }}>
                      {activity.action}
                    </p>
                  </div>
                  {activity.score && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                    >
                      {activity.score}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: '#9B9B9B' }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Motivational Message */}
          <section className="mt-10 p-5 rounded-lg" style={{ backgroundColor: '#F5EBE0' }}>
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#2F2F2F' }}>
                  Loi nhan tu Cacao
                </h3>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  Trong he thong Cacao, viec lam sai chi la mot phan tu nhien cua hanh trinh lam chu kien thuc.
                  Khong co diem so phan xet, khong co bang xep hang. Ban chi can so sanh voi chinh minh hom qua!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function LessonCard({ lesson, index, previousIncomplete }: { lesson: Lesson; index: number; previousIncomplete: boolean }) {
  const isLocked = lesson.status === 'locked' || previousIncomplete;

  const getStatusDisplay = () => {
    if (lesson.status === 'completed') {
      return {
        icon: '✓',
        bgColor: '#DCFCE7',
        textColor: '#166534',
        label: 'Da lam chu'
      };
    }
    if (lesson.status === 'active' && !previousIncomplete) {
      return {
        icon: '📖',
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        label: 'Dang hoc'
      };
    }
    return {
      icon: '🔒',
      bgColor: '#F3F4F6',
      textColor: '#9B9B9B',
      label: 'Bi khoa'
    };
  };

  const status = getStatusDisplay();

  return (
    <button
      className={`w-full text-left rounded-lg border p-5 transition-all duration-200 ${
        isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: lesson.status === 'active' && !previousIncomplete ? '#FFFFFF' : '#FFFFFF',
        borderColor: lesson.status === 'active' && !previousIncomplete ? '#C5A880' : '#E5E5E5',
        borderWidth: lesson.status === 'active' && !previousIncomplete ? '2px' : '1px'
      }}
      disabled={isLocked}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLocked) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ backgroundColor: status.bgColor, color: status.textColor }}
        >
          {status.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold" style={{ color: isLocked ? '#9B9B9B' : '#2F2F2F' }}>
              {lesson.title}
            </h3>
          </div>
          <p className="text-xs mb-3" style={{ color: '#9B9B9B' }}>
            {lesson.description}
          </p>

          {/* Progress Bar for active lesson */}
          {lesson.status === 'active' && !previousIncomplete && lesson.progress && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${lesson.progress}%`, backgroundColor: '#C5A880' }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: '#C5A880' }}>
                {lesson.progress}%
              </span>
            </div>
          )}

          {/* Lock message */}
          {isLocked && lesson.status === 'locked' && (
            <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>
              Se mo khi ban dat 80% bai truoc
            </p>
          )}
        </div>

        {/* Right Side */}
        <div className="text-right flex-shrink-0">
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-md"
            style={{ backgroundColor: status.bgColor, color: status.textColor }}
          >
            {status.label}
          </span>
          <div className="mt-2">
            <p className="text-xs" style={{ color: '#9B9B9B' }}>
              {lesson.masteredConcepts}/{lesson.concepts} khai niem
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      className="rounded-lg border p-4 transition-all duration-200"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#C5A880';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E5E5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs" style={{ color: '#9B9B9B' }}>
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold" style={{ color: '#2F2F2F' }}>
        {value}
      </p>
    </div>
  );
}
