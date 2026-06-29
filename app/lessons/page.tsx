'use client';

import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';

const lessonsData = [
  { id: 'l1', title: 'TypeScript Fundamentals', subtitle: 'Kiến thức nền tảng', progress: 80 },
  { id: 'l2', title: 'React Composition', subtitle: 'Thiết kế component', progress: 65 },
  { id: 'l3', title: 'Server-side Workflows', subtitle: 'Luồng backend nội bộ', progress: 45 },
  { id: 'l4', title: 'AI Learning Paths', subtitle: 'Lộ trình thông minh', progress: 20 },
];

export default function LessonsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#2F2F2F]">
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
            <span>Lessons</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Danh sách các bài học của bạn với tiến độ hiện tại.</p>
        </div>

        <div className="grid gap-5">
          {lessonsData.map((lesson) => (
            <div key={lesson.id} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2F2F2F]">{lesson.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{lesson.subtitle}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#2F2F2F]">
                  <PlayCircle className="h-4 w-4" strokeWidth={1.5} />
                  Tiến độ {lesson.progress}%
                </div>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-[#2F2F2F]" style={{ width: `${lesson.progress}%` }} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span>{lesson.progress >= 80 ? 'Sẵn sàng mở khóa nội dung tiếp theo' : 'Tiếp tục bài học để tăng tiến độ'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
