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
  passed = false
}: FeedbackHubProps) {

  if (isLoading) {
    return <LoadingState />;
  }

  if (!feedback) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
    >
      {/* Header with Score Badge */}
      <div className="p-5 border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}>
                Phan Hoi Chuan Doan
              </h2>
              <p className="text-xs" style={{ color: '#9B9B9B' }}>
                AI Diagnostic - Mastery Learning
              </p>
            </div>
          </div>
          <ScoreBadge score={score} total={totalQuestions} passed={passed} />
        </div>
      </div>

      {/* Greeting */}
      <div className="p-5 bg-gradient-to-r from-transparent" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#2F2F2F' }}>
          {feedback.greeting}
        </p>
      </div>

      {/* Positive Points - Light Green tint */}
      {feedback.positive_points.length > 0 && (
        <FeedbackSection
          title="Diem TOT"
          emoji="💡"
          items={feedback.positive_points}
          bgTint="#ECFDF5"
          borderColor="#D1FAE5"
          iconColor="#059669"
        />
      )}

      {/* Gap Analysis - Light Yellow tint */}
      {feedback.gap_analysis.length > 0 && (
        <FeedbackSection
          title="Diem CAN LUU Y"
          emoji="🔍"
          items={feedback.gap_analysis}
          bgTint="#FFFBEB"
          borderColor="#FEF3C7"
          iconColor="#D97706"
        />
      )}

      {/* Action Plan - Light Blue tint */}
      {feedback.action_plan.length > 0 && (
        <FeedbackSection
          title="Goi y HANH DONG"
          emoji="🧭"
          items={feedback.action_plan}
          bgTint="#EFF6FF"
          borderColor="#DBEAFE"
          iconColor="#2563EB"
        />
      )}

      {/* Encouragement */}
      <div
        className="p-5 border-t"
        style={{
          borderColor: '#E5E5E5',
          backgroundColor: passed ? '#F0FDF4' : '#F5EBE0'
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{passed ? '🌱' : '💪'}</span>
          <div>
            <h4 className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
              Loi Dong Vien
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#2F2F2F' }}>
              {feedback.encouragement}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: '#E5E5E5' }}>
        <p className="text-xs" style={{ color: '#9B9B9B' }}>
          Powered by Cacao AI - Mastery Learning Philosophy
        </p>
        <button
          className="text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150"
          style={{ color: '#2F2F2F', backgroundColor: '#F3F4F6' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E5E5E5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
        >
          Xem chi tiet
        </button>
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score, total, passed }: { score: number; total: number; passed: boolean }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg"
      style={{
        backgroundColor: passed ? '#DCFCE7' : '#FEF3C7',
        border: `1px solid ${passed ? '#BBF7D0' : '#FDE68A'}`
      }}
    >
      <div className="text-right">
        <p className="text-lg font-semibold" style={{ color: passed ? '#166534' : '#92400E' }}>
          {score}/{total}
        </p>
        <p className="text-xs" style={{ color: passed ? '#15803D' : '#B45309' }}>
          {percentage}%
        </p>
      </div>
      <span className="text-xl">{passed ? '✅' : '📖'}</span>
    </div>
  );
}

function FeedbackSection({
  title,
  emoji,
  items,
  bgTint,
  borderColor,
  iconColor
}: {
  title: string;
  emoji: string;
  items: FeedbackPoint[];
  bgTint: string;
  borderColor: string;
  iconColor: string;
}) {
  return (
    <div className="p-5 border-t" style={{ borderColor: '#E5E5E5' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{emoji}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 p-3 rounded-md"
            style={{ backgroundColor: bgTint, border: `1px solid ${borderColor}` }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: iconColor, color: '#FFFFFF' }}
            >
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium mb-1" style={{ color: '#2F2F2F' }}>
                {item.title}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                {item.description}
              </p>
              {item.concept && (
                <span
                  className="inline-block mt-2 text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: '#9B9B9B' }}
                >
                  {item.concept}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="rounded-lg border p-8"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
    >
      <div className="flex flex-col items-center justify-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-t-transparent mb-4"
          style={{ borderColor: '#C5A880', borderTopColor: 'transparent' }}
        />
        <h3 className="text-sm font-medium mb-1" style={{ color: '#2F2F2F' }}>
          Dang phan tich bai lam...
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: '#9B9B9B' }}>
          AI Cacao dang dua ra loi khuyen phu hop theo phuong phap Mastery Learning
        </p>
      </div>
    </div>
  );
}
