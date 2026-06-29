'use client';

import { MessageSquare, Users, Sparkles } from 'lucide-react';

const threads = [
  { id: 'd1', user: 'Hung', topic: 'Làm sao để gộp state trong React?', replies: 4, updated: '1 giờ trước' },
  { id: 'd2', user: 'Mai', topic: 'Tối ưu hóa ghi chú thời gian thực với video', replies: 2, updated: '3 giờ trước' },
  { id: 'd3', user: 'Lan', topic: 'Phản hồi AI nên sửa như thế nào?', replies: 1, updated: 'Hôm qua' },
];

export default function DiscussionsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#2F2F2F]">
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
            <span>Discussions</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Không gian thảo luận như ghi chú nhóm. Hỏi, trả lời và nhận hướng dẫn nhanh.</p>
        </div>

        <div className="grid gap-5">
          {threads.map((thread) => (
            <div key={thread.id} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2F2F2F]">{thread.topic}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{thread.user} • {thread.updated}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-neutral-700">
                  <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {thread.replies} replies
                </span>
              </div>
              <div className="mt-6 text-sm text-neutral-600">
                <p>Không gian này giúp bạn nhận phản hồi từ Mentor và chia sẻ kinh nghiệm với nhóm học.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
