'use client';

import { ClipboardList, Clock, Circle, Check } from 'lucide-react';

const assignments = [
  { id: 'a1', title: 'Bài tập TypeScript', status: 'in-progress', due: 'Hôm nay' },
  { id: 'a2', title: 'Bản đồ tư duy React', status: 'review', due: 'Ngày mai' },
  { id: 'a3', title: 'Thuyết trình AI Learning', status: 'done', due: 'Tuần trước' },
];

export default function AssignmentsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#2F2F2F]">
            <ClipboardList className="h-5 w-5" strokeWidth={1.5} />
            <span>Assignments</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Theo dõi nhiệm vụ hiện tại và trạng thái chấm bài.</p>
        </div>

        <div className="grid gap-5">
          {assignments.map((item) => (
            <div key={item.id} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2F2F2F]">{item.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600">Hạn nộp: {item.due}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'done' ? 'bg-[#DEF7EC] text-[#166534]' : item.status === 'review' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#E0E7FF] text-[#312E81]'}`}> 
                  {item.status === 'done' ? 'Hoàn thành' : item.status === 'review' ? 'Chờ chấm' : 'Đang làm'}
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm font-medium text-neutral-700">
                {item.status === 'done' ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Clock className="h-4 w-4" strokeWidth={1.5} />}
                <span>{item.status === 'done' ? 'Nộp thành công và đã nhận phản hồi' : item.status === 'review' ? 'Đang chờ mentor/phản hồi AI' : 'Tiếp tục hoàn thành để kịp deadline'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
