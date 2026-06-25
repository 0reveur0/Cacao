/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, ListChecks } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import MicroQuiz from './MicroQuiz';
import { Lesson, Quiz, AIFeedbackResponse } from '../types';

interface LessonDetailPageProps {
  lesson: Lesson;
  quiz: Quiz | null;
  isLocked: boolean;
  onBack: () => void;
  onQuizComplete?: (passed: boolean, feedback: AIFeedbackResponse) => void;
}

type Tab = 'video' | 'reading' | 'quiz';

export default function LessonDetailPage({
  lesson,
  quiz,
  isLocked,
  onBack,
  onQuizComplete,
}: LessonDetailPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('video');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lesson.id]);

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-100 mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-2">
          Bài học chưa mở khóa
        </h2>
        <p className="font-sans text-sm text-neutral-500 mb-6 max-w-md mx-auto">
          Hãy hoàn thành bài quiz của bài học trước đó với mức làm chủ (Mastery) để mở khóa bài học này.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-sans text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Video }[] = [
    { id: 'video', label: 'Bài giảng video', icon: Video },
    { id: 'reading', label: 'Tài liệu đọc', icon: BookOpen },
    { id: 'quiz', label: 'Bài kiểm tra', icon: ListChecks },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-sans text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Bảng làm việc
      </button>

      {/* Lesson header */}
      <header className="mb-6">
        <p className="font-sans text-xs font-medium text-[#C5A880] mb-2">
          Bài học {lesson.order}
        </p>
        <h1 className="font-heading text-2xl font-semibold text-neutral-800 mb-2 leading-tight">
          {lesson.title}
        </h1>
        <p className="font-sans text-sm text-neutral-500 leading-relaxed max-w-2xl">
          {lesson.description}
        </p>
      </header>

      {/* Tabs */}
      <nav className="flex items-center gap-1 border-b border-neutral-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-sans text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-[#C5A880] text-neutral-800'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      {activeTab === 'video' && (
        <section>
          <CustomVideoPlayer
            videoUrl={lesson.videoUrl}
            lessonTitle={lesson.title}
            onVideoEnd={() => setActiveTab('reading')}
          />
          <p className="font-sans text-xs text-neutral-400 mt-3 text-center">
            Xem hết video để chuyển sang phần tài liệu đọc, hoặc chọn tab bên trên.
          </p>
        </section>
      )}

      {activeTab === 'reading' && (
        <article className="prose prose-neutral max-w-none">
          <LessonContent markdown={lesson.content} />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setActiveTab('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-sans text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              <ListChecks className="w-4 h-4" />
              Làm bài kiểm tra
            </button>
          </div>
        </article>
      )}

      {activeTab === 'quiz' && (
        <section>
          {quiz && quiz.questions.length > 0 ? (
            <MicroQuiz
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              questions={quiz.questions}
              onComplete={onQuizComplete}
            />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
              <span className="text-2xl block mb-3">📝</span>
              <p className="font-sans text-sm text-neutral-500">
                Bài học này chưa có bài kiểm tra.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/**
 * Lightweight Markdown renderer for lesson content.
 * Handles headings (###, ####), bold, inline code, and code blocks.
 */
function LessonContent({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/```/);
  return (
    <div className="font-sans text-neutral-700 leading-relaxed">
      {blocks.map((block, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="bg-neutral-900 text-neutral-100 rounded-lg p-4 overflow-x-auto my-4 text-xs font-mono"
          >
            <code>{block.replace(/^\w*\n/, '')}</code>
          </pre>
        ) : (
          <RenderInline key={i} text={block} />
        )
      )}
    </div>
  );
}

function RenderInline({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('#### ')) {
          return (
            <h4 key={i} className="font-heading text-base font-semibold text-neutral-800 mt-5 mb-2">
              {line.slice(5)}
            </h4>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="font-heading text-lg font-semibold text-neutral-800 mt-6 mb-3">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('*   ') || line.startsWith('-   ')) {
          return (
            <p key={i} className="ml-4 mb-1.5 text-sm">
              <span className="text-[#C5A880] mr-2">•</span>
              <FormattedText text={line.slice(4)} />
            </p>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-3" />;
        }
        return (
          <p key={i} className="mb-2 text-sm">
            <FormattedText text={line} />
          </p>
        );
      })}
    </>
  );
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-neutral-800">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
