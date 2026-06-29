import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    activeCourses: 2,
    completedCourses: 1,
    currentTopic: 'TypeScript Fundamentals',
    courses: [
      { id: 'lesson-1', title: 'TypeScript Fundamentals', subtitle: 'Nền tảng vững chắc', status: 'active', lastAccessed: 'Hôm qua' },
      { id: 'lesson-2', title: 'Microservices Architecture', subtitle: 'Thiết kế dịch vụ', status: 'active', lastAccessed: '2 ngày trước' },
      { id: 'lesson-3', title: 'Advanced AI Prompting', subtitle: 'Kỹ thuật nâng cao', status: 'completed', lastAccessed: 'Tuần trước' },
    ],
  });
}
