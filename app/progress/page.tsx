'use client';

import { BarChart3, Sparkles, Trophy } from 'lucide-react';

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#2F2F2F]">
            <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
            <span>Progress</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Một cái nhìn tổng quan về tiến độ học tập và mục tiêu của bạn.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              <span>Giải đoán</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#2F2F2F]">85%</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Tỷ lệ hoàn thành mục tiêu cá nhân trong tháng.</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <Trophy className="h-4 w-4" strokeWidth={1.5} />
              <span>Thành tựu</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#2F2F2F]">3</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Bài học và thử thách đã hoàn thành trong tuần này.</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
              <span>Hành trình</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#2F2F2F]">4</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Số bước học chính bạn đã mở khóa.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-[#2F2F2F]">Chi tiết tiến độ</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: 'Bài học đã hoàn thành', value: '8/12' },
              { label: 'Phản hồi còn mở', value: '2 bài' },
              { label: 'Thời gian học tuần này', value: '5h 20p' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-4 text-sm">
                <span className="text-neutral-700">{item.label}</span>
                <span className="font-medium text-[#2F2F2F]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
