/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { BookOpen, Clock, Star, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeItem, setActiveItem] = useState('courses');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buoi sang tot lanh';
    if (hour < 18) return 'Buoi chieu an la';
    return 'Buoi toi yen tinh';
  };

  const getQuickActions = () => {
    switch (profile?.role) {
      case 'STUDENT':
        return [
          { icon: '📚', label: 'Bai hoc dang mo', count: '4' },
          { icon: '⭐', label: 'Khai niem da lam chu', count: '12' },
          { icon: '⏰', label: 'Bai tap can hoan thanh', count: '2' },
        ];
      case 'TEACHER':
        return [
          { icon: '📖', label: 'Quan ly bai giang', count: '8' },
          { icon: '👥', label: 'Hoc vien phu trach', count: '150' },
          { icon: '📅', label: 'Lich day trong tuan', count: '5' },
        ];
      default:
        return [
          { icon: '👥', label: 'Quan ly nguoi dung', count: '' },
          { icon: '📖', label: 'Tong so bai giang', count: '12' },
          { icon: '🔔', label: 'Thong bao', count: '3' },
        ];
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Notion-style Personalized Greeting */}
          <div className="mb-10">
            <p className="text-sm mb-1" style={{ color: '#6B6B6B' }}>
              {getGreeting()}
            </p>
            <h1 className="text-3xl font-semibold" style={{ color: '#2F2F2F' }}>
              {profile?.name ? `👋 Hi, ${profile.name}! Thong thả học nhé.` : '👋 Chao ban!'}
            </h1>
          </div>

          {/* Quick Actions - Notion style callouts */}
          <div className="mb-10">
            <h2 className="text-sm font-medium mb-3" style={{ color: '#6B6B6B' }}>
              TONG QUAN
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-md border hover:bg-gray-50 transition-colors text-left"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
                >
                  <span className="text-xl">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#2F2F2F' }}>
                      {action.label}
                    </p>
                  </div>
                  {action.count && (
                    <span className="text-lg font-semibold" style={{ color: '#2F2F2F' }}>
                      {action.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Lessons - Notion style document list */}
          <div className="mb-10">
            <h2 className="text-sm font-medium mb-3" style={{ color: '#6B6B6B' }}>
              BAI HOC CLOSE
            </h2>
            <div className="rounded-md border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
              {[
                { id: 1, title: 'Lesson 1: Type Safety & Su Chat Che trong Kien Truc He Thong', status: 'done', concept: '3 khai niem' },
                { id: 2, title: 'Lesson 2: Mastering Generics & Mapped Types', status: 'progress', concept: '3 khai niem' },
                { id: 3, title: 'Lesson 3: Event-Driven Microservices voi Apache Kafka', status: 'new', concept: '3 khai niem' },
                { id: 4, title: 'Lesson 4: Ung Dung Tri Tue Nhan Tao & Chan Doan AI', status: 'locked', concept: '3 khai niem' },
              ].map((lesson, index) => (
                <button
                  key={lesson.id}
                  className="w-full flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors text-left"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <div className="flex-shrink-0">
                    {lesson.status === 'done' && <span className="text-lg">✅</span>}
                    {lesson.status === 'progress' && <span className="text-lg">📖</span>}
                    {lesson.status === 'new' && <span className="text-lg">📘</span>}
                    {lesson.status === 'locked' && <span className="text-lg">🔒</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#2F2F2F' }}>
                      {lesson.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>
                      {lesson.concept}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.status === 'done' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                      >
                        Da lam chu
                      </span>
                    )}
                    {lesson.status === 'progress' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                      >
                        Dang hoc
                      </span>
                    )}
                    {lesson.status === 'new' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
                      >
                        San sang
                      </span>
                    )}
                    {lesson.status === 'locked' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#F3F4F6', color: '#9B9B9B' }}
                      >
                        Khoa
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" style={{ color: '#9B9B9B' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity - Simple timeline style */}
          <div>
            <h2 className="text-sm font-medium mb-3" style={{ color: '#6B6B6B' }}>
              HOAT DONG GAN DAY
            </h2>
            <div className="space-y-2">
              {[
                { time: '2 phut truoc', action: 'Hoan thanh bai quiz Lesson 1', icon: '✅' },
                { time: '1 gio truoc', action: 'Xem bai giang Lesson 2', icon: '👀' },
                { time: '3 gio truoc', action: 'Lam chu khai niem Type Safety', icon: '⭐' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span className="text-base">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#2F2F2F' }}>
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: '#9B9B9B' }}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mastery Progress Card */}
          <div className="mt-10 p-5 rounded-md border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Muc do lam chu khai niem
              </h3>
              <span className="text-sm font-semibold" style={{ color: '#C5A880' }}>
                75%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: '75%', backgroundColor: '#C5A880' }}
              />
            </div>
            <p className="text-xs mt-3" style={{ color: '#6B6B6B' }}>
              Ban dang tien toi tot! Tiep tuc hoc de mo khoa cac bai tiep theo.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
