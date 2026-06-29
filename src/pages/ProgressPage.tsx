/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lock, CircleCheck as CheckCircle2, Circle, ChevronDown, ChevronRight, Check, Send, RotateCcw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { AIFeedbackResponse, Question } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────
type MilestoneStatus = 'done' | 'available' | 'locked';
type QuizPhase = 'idle' | 'open' | 'submitting' | 'passed' | 'failed';

interface QuizState {
  answers: Record<string, number>;
  currentIndex: number;
  phase: QuizPhase;
  score: number;
  percentage: number;
  feedback: AIFeedbackResponse | null;
  attemptCount: number;
}

function freshQuizState(): QuizState {
  return {
    answers: {},
    currentIndex: 0,
    phase: 'idle',
    score: 0,
    percentage: 0,
    feedback: null,
    attemptCount: 1,
  };
}

// ─── Status config ─────────────────────────────────────────────────────────────
function useMilestoneStatus(isCompleted: boolean, isLocked: boolean): MilestoneStatus {
  if (isCompleted) return 'done';
  if (!isLocked) return 'available';
  return 'locked';
}

// ─── Inline Option Button ───────────────────────────────────────────────────────
function OptionButton({
  label,
  letter,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  letter: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-md border transition-colors duration-100"
      style={{
        borderColor: selected ? '#C5A880' : '#E5E5E5',
        backgroundColor: selected ? '#FDF6EE' : '#FFFFFF',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.backgroundColor = '#F1F1EF';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold border mt-0.5"
        style={{
          borderColor: selected ? '#C5A880' : '#D4D4D4',
          backgroundColor: selected ? '#C5A880' : 'transparent',
          color: selected ? '#FFFFFF' : '#9B9B9B',
        }}
      >
        {selected ? <Check className="w-3 h-3" /> : letter}
      </span>
      <span
        className="text-sm text-neutral-700 leading-snug"
              >
        {label}
      </span>
    </button>
  );
}

// ─── Inline Quiz Panel ──────────────────────────────────────────────────────────
function InlineQuizPanel({
  lessonId,
  questions,
  quizState,
  onAnswerSelect,
  onNavigate,
  onSubmit,
  onRetry,
  onComplete,
}: {
  lessonId: string;
  questions: Question[];
  quizState: QuizState;
  onAnswerSelect: (qId: string, idx: number) => void;
  onNavigate: (idx: number) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onComplete: (passed: boolean, feedback: AIFeedbackResponse) => void;
}) {
  const { t } = useLanguage();
  const { currentIndex, answers, phase, score, percentage, feedback, attemptCount } = quizState;
  const total = questions.length;
  const allAnswered = Object.keys(answers).length === total;
  const currentQ = questions[currentIndex];

  // ── Submitting ────────────────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-[#C5A880] mb-4"
        />
        <p className="text-sm font-medium text-neutral-600" style={{ fontFamily: 'var(--font-body)' }}>
          {t('progress_analyzing')}
        </p>
        <p className="text-xs text-neutral-400 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
          {t('progress_analyzingHint')}
        </p>
      </div>
    );
  }

  // ── Pass result ───────────────────────────────────────────────────────────────
  if (phase === 'passed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-8 px-2"
      >
        <div
          className="rounded-lg p-5 text-center"
          style={{ backgroundColor: '#E2F0D9', border: '1px solid #C6E0B4' }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#385723', fontFamily: 'var(--font-heading)' }}
          >
            {t('progress_passMessage')}
          </p>
          <p className="text-xs mt-2" style={{ color: '#385723', fontFamily: 'var(--font-body)' }}>
            {t('progress_scoreLabel')} {score}/{total} — {percentage}% {t('progress_mastery')}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Fail result ───────────────────────────────────────────────────────────────
  if (phase === 'failed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-8 px-2"
      >
        <div
          className="rounded-lg p-5"
          style={{ backgroundColor: '#FFF8F0', border: '1px solid #F5EBE0' }}
        >
          <p
            className="text-sm font-medium text-neutral-700 mb-1"
                      >
            {t('progress_failMessage')}
          </p>
          <p className="text-xs text-neutral-400 mt-1.5 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            {t('progress_scoreLabel')} {score}/{total} — {percentage}%
            {attemptCount > 1 && ` · ${attemptCount - 1}x`}
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-100"
            style={{
              backgroundColor: '#F5EBE0',
              color: '#9A6A2A',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EDD5B7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F5EBE0')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('progress_retryBtn')}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Answering ─────────────────────────────────────────────────────────────────
  return (
    <div className="py-5 px-1 space-y-4">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCurrent  = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => onNavigate(i)}
              className="rounded-full transition-all duration-150"
              style={{
                width:           isCurrent ? 28 : 14,
                height:          6,
                backgroundColor: isCurrent
                  ? '#C5A880'
                  : isAnswered
                    ? 'rgba(197,168,128,0.5)'
                    : '#E5E5E5',
              }}
              aria-label={`Q${i + 1}`}
            />
          );
        })}
        <span
          className="ml-auto text-[11px] text-neutral-400"
                  >
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <p
            className="text-sm font-medium text-neutral-800 mb-3 leading-snug"
                      >
            {currentIndex + 1}. {currentQ.text}
          </p>
          <div className="space-y-2">
            {currentQ.options.map((opt, i) => (
              <OptionButton
                key={i}
                label={opt}
                letter={String.fromCharCode(65 + i)}
                selected={answers[currentQ.id] === i}
                disabled={false}
                onClick={() => onAnswerSelect(currentQ.id, i)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav + submit */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition-colors duration-100"
                  >
          {t('progress_prevBtn')}
        </button>

        {currentIndex < total - 1 ? (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={answers[currentQ.id] === undefined}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors duration-100 disabled:opacity-40"
            style={{
              borderColor: '#D4D4D4',
              color: '#2F2F2F',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F1EF')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            {t('progress_nextBtn')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-md transition-colors duration-100 disabled:opacity-40"
            style={{
              backgroundColor: '#2F2F2F',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2F2F2F')}
          >
            <Send className="w-3.5 h-3.5" />
            {t('progress_btnSubmit')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Milestone Row ──────────────────────────────────────────────────────────────
function MilestoneRow({
  item,
  status,
  statusLabel,
  order,
  questions,
  quizState,
  onToggle,
  onAnswerSelect,
  onNavigate,
  onSubmit,
  onRetry,
  onComplete,
}: {
  item: {
    lessonId: string;
    title: string;
    description: string;
    order: number;
    masteredConcepts: number;
    totalConcepts: number;
  };
  status: MilestoneStatus;
  statusLabel: string;
  order: number;
  questions: Question[] | undefined;
  quizState: QuizState;
  onToggle: () => void;
  onAnswerSelect: (qId: string, idx: number) => void;
  onNavigate: (idx: number) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onComplete: (passed: boolean, feedback: AIFeedbackResponse) => void;
}) {
  const isOpen     = quizState.phase !== 'idle';
  const hasQuiz    = !!questions && questions.length > 0;
  const isClickable = status !== 'locked';

  const statusStyle: Record<MilestoneStatus, { bg: string; text: string; dot: string }> = {
    done:      { bg: '#E2F0D9', text: '#385723', dot: '#385723' },
    available: { bg: '#FFF2CC', text: '#7F6000', dot: '#E6AC00' },
    locked:    { bg: '#F2F2F2', text: '#9B9B9B', dot: '#ADADAD' },
  };
  const ss = statusStyle[status];

  return (
    <div
      className="border rounded-lg overflow-hidden transition-colors duration-100"
      style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
    >
      {/* Row header */}
      <button
        onClick={isClickable && hasQuiz ? onToggle : undefined}
        disabled={!isClickable || !hasQuiz}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors duration-100"
        style={{ cursor: isClickable && hasQuiz ? 'pointer' : 'default' }}
        onMouseEnter={(e) => {
          if (isClickable) e.currentTarget.style.backgroundColor = '#F1F1EF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Step number */}
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{
            backgroundColor: status === 'done' ? '#E2F0D9' : status === 'available' ? '#FFF2CC' : '#F2F2F2',
            color: ss.text,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {String(order).padStart(2, '0')}
        </div>

        {/* Icon */}
        <div className="flex-shrink-0">
          {status === 'done' ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: '#385723' }} />
          ) : status === 'available' ? (
            <Circle className="w-4 h-4" style={{ color: '#E6AC00' }} />
          ) : (
            <Lock className="w-4 h-4" style={{ color: '#ADADAD' }} />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold text-neutral-800 truncate"
                      >
            {item.title}
          </p>
          {item.description && (
            <p
              className="text-xs text-neutral-400 mt-0.5 truncate"
                          >
              {item.description}
            </p>
          )}
        </div>

        {/* Mastery micro-bar */}
        {item.totalConcepts > 0 && (
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <div className="w-16 h-1 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((item.masteredConcepts / item.totalConcepts) * 100)}%`,
                  backgroundColor: '#C5A880',
                }}
              />
            </div>
            <span className="text-[10px]" style={{ color: '#C5A880', fontFamily: 'var(--font-body)' }}>
              {Math.round((item.masteredConcepts / item.totalConcepts) * 100)}%
            </span>
          </div>
        )}

        {/* Status badge */}
        <span
          className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded flex-shrink-0"
          style={{ backgroundColor: ss.bg, color: ss.text, fontFamily: 'var(--font-body)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
          {statusLabel}
        </span>

        {/* Expand chevron */}
        {isClickable && hasQuiz && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </motion.span>
        )}
      </button>

      {/* Inline quiz accordion */}
      <AnimatePresence initial={false}>
        {isOpen && questions && questions.length > 0 && (
          <motion.div
            key="quiz-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t"
            style={{ borderColor: '#F0F0F0' }}
          >
            <div className="px-5 pb-4" style={{ backgroundColor: '#FAFAFA' }}>
              <InlineQuizPanel
                lessonId={item.lessonId}
                questions={questions}
                quizState={quizState}
                onAnswerSelect={onAnswerSelect}
                onNavigate={onNavigate}
                onSubmit={onSubmit}
                onRetry={onRetry}
                onComplete={onComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Progress Page ──────────────────────────────────────────────────────────────
export default function ProgressPage({ onBack }: { onBack: () => void }) {
  const { roadmap, quizzes, onQuizComplete, loading } = useProgress();
  const { t } = useLanguage();

  // Per-lesson quiz state
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({});

  const getQuizState = (lessonId: string): QuizState =>
    quizStates[lessonId] ?? freshQuizState();

  const updateQuizState = (lessonId: string, patch: Partial<QuizState>) =>
    setQuizStates((prev) => ({
      ...prev,
      [lessonId]: { ...getQuizState(lessonId), ...patch },
    }));

  const handleToggle = (lessonId: string) => {
    const current = getQuizState(lessonId);
    if (current.phase === 'idle') {
      updateQuizState(lessonId, { phase: 'open', currentIndex: 0, answers: {} });
    } else {
      // Collapse (unless result is showing)
      if (current.phase === 'open') {
        updateQuizState(lessonId, { phase: 'idle' });
      }
    }
  };

  const handleAnswerSelect = (lessonId: string, qId: string, idx: number) =>
    updateQuizState(lessonId, {
      answers: { ...getQuizState(lessonId).answers, [qId]: idx },
    });

  const handleNavigate = (lessonId: string, idx: number) =>
    updateQuizState(lessonId, { currentIndex: idx });

  const handleSubmit = async (lessonId: string) => {
    const state   = getQuizState(lessonId);
    const quiz    = quizzes[lessonId];
    if (!quiz) return;

    updateQuizState(lessonId, { phase: 'submitting' });

    try {
      const res  = await fetch('/api/submissions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId:    'demo-user',
          profileId: 'demo-profile',
          lessonId,
          answers:   state.answers,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const passed = data.passed as boolean;
        updateQuizState(lessonId, {
          phase:      passed ? 'passed' : 'failed',
          score:      data.score,
          percentage: data.percentage,
          feedback:   data.feedback,
          attemptCount: state.attemptCount,
        });
        if (passed) {
          onQuizComplete(lessonId, true, data.feedback);
        }
      } else {
        updateQuizState(lessonId, { phase: 'open' });
      }
    } catch {
      updateQuizState(lessonId, { phase: 'open' });
    }
  };

  const handleRetry = (lessonId: string) => {
    const prev = getQuizState(lessonId);
    setQuizStates((s) => ({
      ...s,
      [lessonId]: {
        ...freshQuizState(),
        phase:        'open',
        attemptCount: prev.attemptCount + 1,
      },
    }));
  };

  const allDone = roadmap.length > 0 && roadmap.every((r) => r.isCompleted);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-[#C5A880] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b bg-white"
        style={{ borderColor: '#E9E9E9' }}
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors duration-100"
                      >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('progress_backBtn')}
          </button>
          <span
            className="text-[11px] font-medium px-2 py-1 rounded"
            style={{ backgroundColor: '#F5EBE0', color: '#C5A880', fontFamily: 'var(--font-body)' }}
          >
            <span className="text-sm font-medium">Cacao</span>
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mb-10"
        >
          <h1
            className="text-2xl font-semibold text-neutral-900 mb-2 leading-tight"
                      >
            {t('progress_pageTitle')}
          </h1>
          <p
            className="text-sm text-neutral-500 max-w-lg leading-relaxed"
                      >
            {t('progress_pageSubtitle')}
          </p>
        </motion.div>

        {/* All-done banner */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 rounded-lg px-5 py-4"
              style={{ backgroundColor: '#E2F0D9', border: '1px solid #C6E0B4' }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: '#385723', fontFamily: 'var(--font-heading)' }}
              >
                {t('progress_allDone')}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: '#4E7A34', fontFamily: 'var(--font-body)' }}
              >
                {t('progress_allDoneHint')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone list */}
        <div className="space-y-2">
          {roadmap.map((item, idx) => {
            const status      = item.isCompleted ? 'done' : item.isLocked ? 'locked' : 'available';
            const statusLabel =
              status === 'done'
                ? t('progress_statusDone')
                : status === 'available'
                  ? t('progress_statusAvail')
                  : t('progress_statusLocked');
            const questions   = quizzes[item.lessonId]?.questions;
            const qState      = getQuizState(item.lessonId);

            return (
              <motion.div
                key={item.lessonId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
              >
                <MilestoneRow
                  item={item}
                  status={status as MilestoneStatus}
                  statusLabel={statusLabel}
                  order={item.order}
                  questions={questions}
                  quizState={qState}
                  onToggle={() => handleToggle(item.lessonId)}
                  onAnswerSelect={(qId, i) => handleAnswerSelect(item.lessonId, qId, i)}
                  onNavigate={(i) => handleNavigate(item.lessonId, i)}
                  onSubmit={() => handleSubmit(item.lessonId)}
                  onRetry={() => handleRetry(item.lessonId)}
                  onComplete={(passed, feedback) => {
                    if (passed) onQuizComplete(item.lessonId, true, feedback);
                  }}
                />

                {/* Connector line between rows */}
                {idx < roadmap.length - 1 && (
                  <div className="flex justify-center">
                    <div
                      className="w-px h-4"
                      style={{
                        backgroundColor: item.isCompleted ? '#C5A880' : '#E5E5E5',
                      }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {roadmap.length === 0 && (
          <div
            className="rounded-lg border border-dashed border-neutral-200 py-16 text-center"
          >
            <p className="text-sm text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {t('noCoursesYet')}
            </p>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-16" />
      </main>
    </div>
  );
}
