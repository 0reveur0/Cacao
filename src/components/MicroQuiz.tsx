/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RotateCcw, Check, ChevronRight } from 'lucide-react';
import FeedbackHub from './FeedbackHub';
import { AIFeedbackResponse, Question } from '../types';

interface MicroQuizProps {
  lessonId: string;
  lessonTitle: string;
  questions: Question[];
  onComplete?: (passed: boolean, feedback: AIFeedbackResponse) => void;
}

type Phase = 'answering' | 'submitting' | 'result';

export default function MicroQuiz({
  lessonId,
  lessonTitle,
  questions,
  onComplete,
}: MicroQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>('answering');
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    feedback: AIFeedbackResponse | null;
  } | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleSelect = (optionIndex: number) => {
    if (phase !== 'answering') return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (phase !== 'answering' || !allAnswered) return;
    setPhase('submitting');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          profileId: 'demo-profile',
          lessonId,
          answers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          score: data.score,
          totalQuestions: data.totalQuestions,
          percentage: data.percentage,
          passed: data.passed,
          feedback: data.feedback,
        });
        setPhase('result');
        onComplete?.(data.passed, data.feedback);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setPhase('answering');
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setPhase('answering');
    setResult(null);
    setAttemptCount((prev) => prev + 1);
  };

  // ===== Result Phase =====
  if (phase === 'result' && result) {
    return (
      <div className="space-y-6">
        <ResultBanner
          passed={result.passed}
          score={result.score}
          total={result.totalQuestions}
          percentage={result.percentage}
          attemptCount={attemptCount}
          onRetry={handleRetry}
        />

        {result.feedback && (
          <FeedbackHub
            feedback={result.feedback}
            score={result.score}
            totalQuestions={result.totalQuestions}
            passed={result.passed}
          />
        )}
      </div>
    );
  }

  // ===== Submitting Phase =====
  if (phase === 'submitting') {
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

  // ===== Answering Phase =====
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">
            Micro-quiz · {lessonTitle}
          </h3>
          <p className="text-sm text-neutral-400 mt-0.5">
            {totalQuestions} câu · Thời gian tự do, không giới hạn
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-500">
          Câu {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'w-8 bg-[#C5A880]'
                  : isAnswered
                    ? 'w-4 bg-[#C5A880]/60'
                    : 'w-4 bg-neutral-200'
              }`}
              aria-label={`Câu ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
        >
          {/* Question */}
          <div className="px-6 py-5 border-b border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-[#F5EBE0] text-[#C5A880]">
                <span className="text-xs font-semibold">{currentIndex + 1}</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-800 pt-0.5">
                {currentQuestion.text}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-3.5 rounded-lg border flex items-center gap-3 transition-all duration-150 ${
                    isSelected
                      ? 'border-[#C5A880] bg-[#F5EBE0]/60'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-[#C5A880] bg-[#C5A880] text-white'
                        : 'border-neutral-300 text-neutral-400'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm text-neutral-700">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex((prev) => prev - 1)}
              disabled={currentIndex === 0}
              className="text-sm text-neutral-500 disabled:opacity-40 hover:text-neutral-800 transition-colors"
            >
              Câu trước
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                disabled={answers[currentQuestion.id] === undefined}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-neutral-800 text-white hover:bg-neutral-700"
              >
                Câu tiếp
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-neutral-800 text-white hover:bg-neutral-700"
              >
                <Send className="w-4 h-4" />
                Gửi bài
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Submit-all bar */}
      {allAnswered && currentIndex === totalQuestions - 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-neutral-400"
        >
          Bạn đã trả lời tất cả câu hỏi. Nhấn "Gửi bài" để nhận phản hồi chẩn đoán.
        </motion.p>
      )}
    </div>
  );
}

function ResultBanner({
  passed,
  score,
  total,
  percentage,
  attemptCount,
  onRetry,
}: {
  passed: boolean;
  score: number;
  total: number;
  percentage: number;
  attemptCount: number;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
    >
      <div
        className={`px-6 py-8 text-center ${passed ? 'bg-emerald-50/60' : 'bg-[#F5EBE0]/40'}`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-4xl mb-3"
        >
          {passed ? '🌟' : '💪'}
        </motion.div>

        <h3 className="text-lg font-semibold text-neutral-800 mb-1.5">
          {passed
            ? 'Bạn đã làm chủ được bài học này!'
            : 'Chưa đạt lần này — không sao cả!'}
        </h3>

        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          {passed
            ? 'Bài học tiếp theo đã được mở khóa. Hãy tiếp tục hành trình nhé.'
            : `Lần thử thứ ${attemptCount}. Hãy xem lại gợi ý từ AI bên dưới rồi thử lại nhé.`}
        </p>

        {/* Score display */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-white border border-neutral-200">
            <p className="text-xl font-semibold text-neutral-800">
              {score}/{total}
            </p>
            <p className="text-xs text-neutral-400">câu đúng</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-white border border-neutral-200">
            <p
              className="text-xl font-semibold ${
                passed ? 'text-emerald-600' : 'text-amber-600'
              }"
            >
              {percentage}%
            </p>
            <p className="text-xs text-neutral-400">mastery</p>
          </div>
        </div>

        {/* Retry button */}
        {!passed && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-700 transition-all hover:shadow-sm"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại bài
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
