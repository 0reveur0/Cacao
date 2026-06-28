/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { FeedbackPoint, AIFeedbackResponse } from '../types';

interface FeedbackHubProps {
  feedback: AIFeedbackResponse | null;
  isLoading?: boolean;
  score?: number;
  totalQuestions?: number;
  passed?: boolean;
}

export default function FeedbackHub({
  feedback,
  isLoading = false,
  score = 0,
  totalQuestions = 0,
  passed = false,
}: FeedbackHubProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!feedback) {
    return null;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>☕</span>
          <div>
            <h2 className="text-base font-semibold text-neutral-800">
              Phản hồi chẩn đoán
            </h2>
            <p className="text-xs text-neutral-500">
              AI Diagnostic · Mastery Learning
            </p>
          </div>
        </div>
        <ScoreBadge score={score} total={totalQuestions} passed={passed} />
      </header>

      {/* Greeting */}
      <div className="px-6 py-5 bg-neutral-50/60">
        <p className="text-sm leading-relaxed text-neutral-700">
          {feedback.greeting}
        </p>
      </div>

      {/* Positive Points */}
      {feedback.positive_points.length > 0 && (
        <FeedbackSection
          title="Điểm tốt"
          emoji="💡"
          items={feedback.positive_points}
          tint="bg-emerald-50"
          accent="text-emerald-700"
          chipBg="bg-emerald-100"
        />
      )}

      {/* Gap Analysis */}
      {feedback.gap_analysis.length > 0 && (
        <FeedbackSection
          title="Điểm cần lưu ý"
          emoji="🔍"
          items={feedback.gap_analysis}
          tint="bg-amber-50"
          accent="text-amber-700"
          chipBg="bg-amber-100"
        />
      )}

      {/* Action Plan */}
      {feedback.action_plan.length > 0 && (
        <FeedbackSection
          title="Gợi ý hành động"
          emoji="🧭"
          items={feedback.action_plan}
          tint="bg-sky-50"
          accent="text-sky-700"
          chipBg="bg-sky-100"
        />
      )}

      {/* Encouragement */}
      <div
        className={`px-6 py-5 border-t border-neutral-200 ${
          passed ? 'bg-emerald-50/50' : 'bg-[#F5EBE0]/40'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden>{passed ? '🌱' : '💪'}</span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
              Lời động viên
            </h4>
            <p className="text-sm leading-relaxed text-neutral-700">
              {feedback.encouragement}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-neutral-200 flex items-center justify-between">
        <p className="font-sans text-xs text-neutral-400">
          Powered by Cacao AI · Mastery Learning Philosophy
        </p>
      </footer>
    </motion.article>
  );
}

function ScoreBadge({ score, total, passed }: { score: number; total: number; passed: boolean }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const palette = passed
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', value: 'text-emerald-700', label: 'text-emerald-600' }
    : { bg: 'bg-amber-50', border: 'border-amber-200', value: 'text-amber-700', label: 'text-amber-600' };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${palette.bg} ${palette.border}`}>
      <div className="text-right">
        <p className={`font-heading text-lg font-semibold ${palette.value}`}>
          {score}/{total}
        </p>
        <p className={`font-sans text-xs ${palette.label}`}>{percentage}%</p>
      </div>
      <span className="text-xl" aria-hidden>{passed ? '✅' : '📖'}</span>
    </div>
  );
}

function FeedbackSection({
  title,
  emoji,
  items,
  tint,
  accent,
  chipBg,
}: {
  title: string;
  emoji: string;
  items: FeedbackPoint[];
  tint: string;
  accent: string;
  chipBg: string;
}) {
  return (
    <section className="px-6 py-5 border-t border-neutral-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg" aria-hidden>{emoji}</span>
        <h3 className="font-sans text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
            className={`flex gap-3 p-4 rounded-lg ${tint}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${chipBg} ${accent}`}
            >
              <span className="text-xs font-semibold">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-neutral-800 mb-1">
                {item.title}
              </h4>
              <p className="text-sm leading-relaxed text-neutral-600">
                {item.description}
              </p>
              {item.concept && (
                <span className="inline-block mt-2 font-sans text-xs px-2 py-0.5 rounded bg-white/70 text-neutral-500">
                  {item.concept}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-10">
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-[3px] border-neutral-200 border-t-[#C5A880] mb-4"
        />
        <h3 className="text-sm font-medium text-neutral-700 mb-1">
          Đang phân tích bài làm...
        </h3>
        <p className="text-sm text-center max-w-xs text-neutral-400">
          AI Cacao đang soạn lời khuyên phù hợp theo phương pháp Mastery Learning
        </p>
      </div>
    </div>
  );
}
