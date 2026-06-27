/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Send, RotateCcw, CircleAlert as AlertCircle } from 'lucide-react';
import FeedbackHub from './FeedbackHub';
import { AIFeedbackResponse, Question } from '../types';

interface QuizPageProps {
  lessonId: string;
  lessonTitle: string;
  questions: Question[];
  onComplete?: (passed: boolean, feedback: AIFeedbackResponse) => void;
}

export default function QuizPage({
  lessonId,
  lessonTitle,
  questions,
  onComplete
}: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    passed: boolean;
    feedback: AIFeedbackResponse | null;
  } | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          profileId: 'demo-profile',
          lessonId,
          answers
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          score: data.score,
          totalQuestions: data.totalQuestions,
          passed: data.passed,
          feedback: data.feedback
        });
        setSubmitted(true);
        onComplete?.(data.passed, data.feedback);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  // Show results after submission
  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Result Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div
            className="rounded-lg border p-6 text-center"
            style={{ backgroundColor: result.passed ? '#F0FDF4' : '#FFFFFF', borderColor: '#E5E5E5' }}
          >
            <span className="text-5xl mb-4 block">
              {result.passed ? '🎉' : '💪'}
            </span>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {result.passed ? 'Hoàn Thành!' : 'Động Viên!'}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
              {result.passed
                ? 'Em đã đạt yêu cầu làm chủ. Bài học này đã mở khóa.'
                : 'Không sao cả! Em có thể thử lại bất kỳ lúc nào.'}
            </p>

            <div className="flex items-center justify-center gap-4">
              <div
                className="text-center px-4 py-2 rounded-lg"
                style={{ backgroundColor: result.passed ? '#DCFCE7' : '#FEF3C7' }}
              >
                <p className="text-3xl font-semibold" style={{ color: '#2F2F2F' }}>
                  {result.score}/{result.totalQuestions}
                </p>
                <p className="text-xs" style={{ color: '#9B9B9B' }}>Số câu đúng</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: '#F3F4F6', color: '#2F2F2F' }}
              >
                <RotateCcw className="w-4 h-4" />
                Làm lại bài
              </button>
            </div>
          </div>
        </motion.div>

        {/* AI Feedback */}
        <FeedbackHub
          feedback={result.feedback}
          score={result.score}
          totalQuestions={result.totalQuestions}
          passed={result.passed}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {lessonTitle}
            </h1>
            <p className="text-sm" style={{ color: '#9B9B9B' }}>
              Quiz - {totalQuestions} câu hỏi
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
            <Clock className="w-4 h-4" style={{ color: '#9B9B9B' }} />
            <span className="text-sm font-medium" style={{ color: '#6B6B6B' }}>
              Câu {currentIndex + 1}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: '#C5A880' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
        >
          {/* Question */}
          <div className="p-6 border-b" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
              >
                <span className="text-sm font-semibold">{currentIndex + 1}</span>
              </div>
              <div>
                <p className="text-base leading-relaxed" style={{ color: '#2F2F2F' }}>
                  {currentQuestion.text}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4">
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-150 flex items-center gap-3`}
                    style={{
                      borderColor: isSelected ? '#C5A880' : '#E5E5E5',
                      backgroundColor: isSelected ? '#F5EBE0' : '#FFFFFF'
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border"
                      style={{
                        borderColor: isSelected ? '#C5A880' : '#E5E5E5',
                        backgroundColor: isSelected ? '#C5A880' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#9B9B9B'
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm" style={{ color: '#2F2F2F' }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div
            className="p-4 border-t flex items-center justify-between"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}
          >
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                color: currentIndex === 0 ? '#9B9B9B' : '#2F2F2F',
                backgroundColor: currentIndex === 0 ? '#F3F4F6' : '#FFFFFF',
                border: currentIndex === 0 ? 'none' : '1px solid #E5E5E5',
                opacity: currentIndex === 0 ? 0.5 : 1
              }}
            >
              Câu trước
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(answers).length < totalQuestions}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: '#2F2F2F',
                  color: '#FFFFFF',
                  opacity: isSubmitting || Object.keys(answers).length < totalQuestions ? 0.5 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Nộp bài
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: answers[currentQuestion.id] === undefined ? '#F3F4F6' : '#C5A880',
                  color: answers[currentQuestion.id] === undefined ? '#9B9B9B' : '#2F2F2F'
                }}
              >
                Câu tiếp theo
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question Navigator */}
      <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <p className="text-xs font-medium mb-3" style={{ color: '#9B9B9B' }}>
          Tiến độ làm bài
        </p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: isCurrent
                    ? '#C5A880'
                    : isAnswered
                      ? '#F5EBE0'
                      : '#F3F4F6',
                  color: isCurrent ? '#FFFFFF' : '#2F2F2F',
                  border: isCurrent ? 'none' : '1px solid #E5E5E5'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
