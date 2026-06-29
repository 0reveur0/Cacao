'use client';

import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

const feedItems = [
  { id: 'f1', title: 'Bạn hoàn thành TypeScript Fundamentals', time: '1 ngày trước', badge: 'Great job' },
  { id: 'f2', title: 'Bài tập React đã được chấm', time: '2 ngày trước', badge: 'Đã cập nhật' },
  { id: 'f3', title: 'Mentor gợi ý thêm về AI prompt', time: '3 ngày trước', badge: 'Tin mới' },
];

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#2F2F2F]">
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
            <span>Feed</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Những cập nhật gần nhất cho lộ trình học của bạn.</p>
        </div>

        <div className="grid gap-5">
          {feedItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2F2F2F]">{item.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{item.time}</p>
                </div>
                <span className="rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-semibold text-[#312E81]">{item.badge}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span>Không bỏ lỡ tiến trình và phản hồi quan trọng.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
