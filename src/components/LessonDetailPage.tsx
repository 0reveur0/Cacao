/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, ListChecks, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

// ─── Notion-style Toggle Block ────────────────────────────────────────────────
function ToggleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-neutral-100 overflow-hidden mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-[#F5EBE0] group"
              >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
        </motion.span>
        <span className="text-xs font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors">
          {title}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100"
              style={{ backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Concept Glossary Section ─────────────────────────────────────────────────
const CONCEPT_DESCRIPTIONS: Record<string, string> = {
  'select-basic':       'Câu lệnh SELECT cơ bản dùng để truy xuất dữ liệu từ một hoặc nhiều bảng trong cơ sở dữ liệu.',
  'select-columns':     'Chỉ định các cột cụ thể cần lấy thay vì SELECT *, giúp tiết kiệm băng thông và tăng hiệu suất.',
  'where-filter':       'Mệnh đề WHERE lọc các hàng theo điều kiện logic, chỉ trả về những bản ghi thoả mãn điều kiện.',
  'order-by':           'ORDER BY sắp xếp kết quả theo cột chỉ định — ASC (tăng dần) hoặc DESC (giảm dần).',
  'inner-join':         'INNER JOIN chỉ lấy các hàng có dữ liệu khớp ở cả hai bảng theo điều kiện ON.',
  'left-join':          'LEFT JOIN giữ lại tất cả hàng từ bảng bên trái; các hàng không khớp ở bảng phải sẽ có giá trị NULL.',
  'table-alias':        'Alias (bí danh) rút ngắn tên bảng trong câu truy vấn bằng từ khoá AS hoặc khoảng trắng.',
  'index-optimization': 'INDEX tạo một cấu trúc tra cứu nhanh, giúp cơ sở dữ liệu tìm hàng mà không phải quét toàn bộ bảng.',
  'group-by':           'GROUP BY gom các hàng có cùng giá trị cột thành một nhóm, thường dùng kết hợp với hàm tổng hợp như COUNT, SUM, AVG.',
  'having-clause':      'HAVING lọc kết quả SAU khi GROUP BY đã gộp nhóm — khác WHERE là lọc trước khi nhóm.',
};

function ConceptsSection({ concepts }: { concepts: string[] }) {
  if (concepts.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🗂️</span>
        <h3
          className="text-sm font-semibold text-neutral-800"
                  >
          Khái niệm trong bài học
        </h3>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F5EBE0] text-[#C5A880]"
                  >
          {concepts.length} khái niệm
        </span>
      </div>
      <div className="space-y-0.5">
        {concepts.map((concept) => (
          <ToggleBlock key={concept} title={concept.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}>
            <p>{CONCEPT_DESCRIPTIONS[concept] ?? 'Mô tả khái niệm này đang được cập nhật.'}</p>
          </ToggleBlock>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LessonDetailPage({
  lesson,
  quiz,
  isLocked,
  onBack,
  onQuizComplete,
}: LessonDetailPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('video');

  useEffect(() => { window.scrollTo(0, 0); }, [lesson.id]);

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-100 mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2
          className="text-xl font-semibold text-neutral-800 mb-2"
                  >
          Bài học chưa mở khóa
        </h2>
        <p
          className="text-sm text-neutral-500 mb-6 max-w-md mx-auto"
                  >
          Hãy hoàn thành bài quiz của bài học trước đó với mức làm chủ (Mastery) để mở khóa bài học này.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Video }[] = [
    { id: 'video',   label: 'Bài giảng video', icon: Video      },
    { id: 'reading', label: 'Tài liệu đọc',    icon: BookOpen   },
    { id: 'quiz',    label: 'Bài kiểm tra',    icon: ListChecks },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
              >
        <ArrowLeft className="w-4 h-4" /> Quay lại Bảng làm việc
      </button>

      {/* Lesson header */}
      <header className="mb-6">
        <p
          className="text-xs font-medium text-[#C5A880] mb-2"
                  >
          Bài học {lesson.order}
        </p>
        <h1
          className="text-2xl font-semibold text-neutral-800 mb-2 leading-tight"
                  >
          {lesson.title}
        </h1>
        <p
          className="text-sm text-neutral-500 leading-relaxed max-w-2xl"
                  >
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
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
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
          <p
            className="text-xs text-neutral-400 mt-3 text-center"
                      >
            Xem hết video để chuyển sang phần tài liệu đọc, hoặc chọn tab bên trên.
          </p>
        </section>
      )}

      {activeTab === 'reading' && (
        <article>
          {/* Concepts toggle section — Notion style */}
          <ConceptsSection concepts={lesson.concepts} />

          {/* Lesson markdown content */}
          <div
            className="rounded-lg border border-neutral-100 bg-white p-5 mb-4"
                      >
            <LessonContent markdown={lesson.content} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                          >
              <ListChecks className="w-4 h-4" /> Làm bài kiểm tra
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
              <p
                className="text-sm text-neutral-500"
                              >
                Bài học này chưa có bài kiểm tra.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ─── Markdown content renderer ────────────────────────────────────────────────
function LessonContent({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/```/);
  return (
    <div className="text-neutral-700 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
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
        if (line.startsWith('#### '))
          return (
            <h4 key={i} className="text-base font-semibold text-neutral-800 mt-5 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {line.slice(5)}
            </h4>
          );
        if (line.startsWith('### '))
          return (
            <h3 key={i} className="text-lg font-semibold text-neutral-800 mt-6 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith('*   ') || line.startsWith('-   '))
          return (
            <p key={i} className="ml-4 mb-1.5 text-sm">
              <span className="text-[#C5A880] mr-2">•</span>
              <FormattedText text={line.slice(4)} />
            </p>
          );
        if (line.trim() === '') return <div key={i} className="h-3" />;
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
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        if (part.startsWith('**') && part.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-neutral-800">
              {part.slice(2, -2)}
            </strong>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
