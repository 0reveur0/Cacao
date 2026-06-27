/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { ArrowLeft, LayoutDashboard, List, Calendar, Clock, Upload, FileText, Check, CircleAlert as AlertCircle, MoveHorizontal as MoreHorizontal, Plus, Search, ListFilter as Filter, ChevronDown, ChevronRight, Trash2, CreditCard as Edit3, Send, X, Download, MessageSquare, Star, BookOpen, Code, PenTool, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────
type AssignmentStatus = 'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
type AssignmentPriority = 'HIGH' | 'MEDIUM' | 'LOW';
type AssignmentType = 'ESSAY' | 'CODE' | 'PROJECT' | 'QUIZ' | 'RESEARCH';

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  subject: string;
  type: AssignmentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  due_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name?: string;
  content?: string;
  attached_files?: AttachedFile[];
  score?: number;
  has_feedback?: boolean;
  feedback?: AssignmentFeedback | null;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

interface AssignmentFeedback {
  id: string;
  greeting: string;
  positive_points: Array<{ title: string; description: string }>;
  areas_to_improve: Array<{ title: string; description: string }>;
  suggestions: Array<{ title: string; description: string }>;
  score: number;
  created_at: string;
}

// ─── Status & Priority Config ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<AssignmentStatus, { emoji: string; bg: string; text: string; dot: string; col: string }> = {
  TODO:         { emoji: '📥', bg: '#F2F2F2', text: '#595959', dot: '#ADADAD', col: 'bg-neutral-100' },
  IN_PROGRESS:  { emoji: '⏳', bg: '#FFF2CC', text: '#7F6000', dot: '#E6AC00', col: 'bg-amber-50' },
  UNDER_REVIEW: { emoji: '🔍', bg: '#E0F2FE', text: '#0369A1', dot: '#0284C7', col: 'bg-sky-50' },
  COMPLETED:    { emoji: '✓', bg: '#E2F0D9', text: '#385723', dot: '#385723', col: 'bg-emerald-50' },
};

const PRIORITY_CONFIG: Record<AssignmentPriority, { bg: string; text: string }> = {
  HIGH:   { bg: '#FCE4D6', text: '#C65911' },
  MEDIUM: { bg: '#FFF2CC', text: '#7F6000' },
  LOW:    { bg: '#E2EFDA', text: '#375623' },
};

const TYPE_CONFIG: Record<AssignmentType, { emoji: string; label_vi: string; label_en: string }> = {
  ESSAY:    { emoji: '📝', label_vi: 'Luận văn', label_en: 'Essay' },
  CODE:     { emoji: '💻', label_vi: 'Lập trình', label_en: 'Coding' },
  PROJECT:  { emoji: '🚀', label_vi: 'Dự án', label_en: 'Project' },
  QUIZ:     { emoji: '❓', label_vi: 'Trắc nghiệm', label_en: 'Quiz' },
  RESEARCH: { emoji: '🔬', label_vi: 'Nghiên cứu', label_en: 'Research' },
};

// ─── Mock Data Seeds ───────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asn-001',
    title: 'Phân tích Kiến trúc Microservices cho Hệ Thống Thương Mại Điện Tử',
    description: 'Thiết kế sơ đồ kiến trúc và viết báo cáo phân tích về cách chia nhỏ hệ thống monolithic thành microservices.',
    instructions: `### 📋 Yêu cầu bài tập

Bạn cần hoàn thành các phần sau:

1. **Sơ đồ kiến trúc (Architecture Diagram)**
   - Vẽ sơ đồ các services chính (User, Product, Order, Payment, Notification)
   - Mô tả giao tiếp giữa các services qua Event Bus
   - Chỉ rõ ranh giới dữ liệu (Database per Service)

2. **Báo cáo phân tích (Analysis Report)**
   - Đánh giá lợi ích và thách thức khi chuyển đổi
   - Phân tích tính Idempotency và Fault Isolation
   - Đề xuất chiến lược Deployment (Blue-Green hoặc Canary)

3. **Code Demo (Optional)**
   - Viết một mini-producer/consumer demo sử dụng Kafka hoặc RabbitMQ
   - Ngôn ngữ: TypeScript hoặc Go

### 📅 Hạn nộp
Nộp trước 23:59 ngày hôm nay.

### 📎 Định dạng
- PDF cho báo cáo
- ZIP cho source code (nếu có)`,
    subject: 'TypeScript Architecture',
    type: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    author_name: 'ThS. Nguyễn Văn Giảng',
    content: '## Phần 1: Sơ đồ kiến trúc\n\nĐang soạn thảo...',
  },
  {
    id: 'asn-002',
    title: 'Bài Tập Thực Hành: Type Guards & Generics trong TypeScript',
    description: 'Viết các utility types và type guards để xử lý an toàn dữ liệu từ API không xác định.',
    instructions: `### 🎯 Mục tiêu

Hoàn thành 3 bài tập sau:

#### Bài 1: Type Guard cho User Object
Viết hàm \`isUser()\` kiểm tra một object có phải là User hợp lệ.

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}
\`\`\`

#### Bài 2: Generic Repository Pattern
Tạo một \`Repository<T>\` với các phương thức CRUD sử dụng Generic Constraints.

#### Bài 3: Mapped Type DeepPartial
Viết mapped type \`DeepPartial<T>\` biến mọi thuộc tính (kể cả nested) thành optional.

**Nộp:** 1 file TypeScript \`solutions.ts\` + file README.md giải thích.`,
    subject: 'TypeScript',
    type: 'CODE',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    author_name: 'TS. Trần Code',
  },
  {
    id: 'asn-003',
    title: 'Luận Văn: Tác động của AI đến Giáo dục Phi Điểm Số',
    description: 'Phân tích vai trò của Descriptive Feedback và Mastery Learning trong bối cảnh AI hiện đại.',
    instructions: `### 📚 Chủ đề nghiên cứu

Viết một bài luận (1500-2000 từ) về chủ đề:

**"Trí tuệ nhân tạo và sự chuyển dịch từ chấm điểm truyền thống sang phản hồi mô tả chẩn đoán"**

Nội dung cần bao gồm:

1. **Giới thiệu** - Bối cảnh giáo dục hiện đại
2. **Triết lý Mastery Learning** - Cơ sở lý thuyết
3. **AI Diagnostic Feedback** - Ứng dụng công nghệ
4. **Case Study** - Phân tích một hệ thống thực tế (Cacao TLMS)
5. **Thách thức và Triển vọng**
6. **Kết luận**

### 📝 Yêu cầu định dạng
- Font: Times New Roman, 12pt
- Line spacing: 1.5
- Định dạng: PDF`,
    subject: 'Pedagogy',
    type: 'ESSAY',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    author_name: 'PGS.TS. Lê Giáo Dục',
    content: '## Trí tuệ nhân tạo và sự chuyển dịch giáo dục\n\nTrong bối cảnh giáo dục hiện đại...',
    has_feedback: true,
    score: 85,
    feedback: {
      id: 'fb-003',
      greeting: 'Chào em! Cacao đã đọc kỹ bài luận của em và rất印象深刻...',
      positive_points: [
        { title: 'Tư duy hệ thống', description: 'Em đã phân tích rất sâu mối liên hệ giữa Mastery Learning và AI' },
        { title: 'Cấu trúc chặt chẽ', description: 'Các luận điểm được sắp xếp logic, dẫn dắt tự nhiên' },
      ],
      areas_to_improve: [
        { title: 'Dẫn chứng thực tế', description: 'Có thể thêm số liệu thống kê về hiệu quả áp dụng Mastery Learning' },
      ],
      suggestions: [
        { title: 'Mở rộng case study', description: 'Đề xuất phân tích thêm các platforms như Khan Academy, Duolingo' },
      ],
      score: 85,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'asn-004',
    title: 'Nghiên Cứu: So Sánh Gemma vs. Gemini cho Ứng Dụng Giáo Dục',
    description: 'Phân tích so sánh hai mô hình ngôn ngữ lớn và đề xuất case sử dụng phù hợp.',
    instructions: `### 🔬 Nhiệm vụ

Thực hiện nghiên cứu so sánh giữa Gemma và Gemini:

1. **Hiệu năng** - Độ chính xác, tốc độ phản hồi
2. **Chi phí** - Phân tích cost-per-inference
3. **Khả năng tùy chỉnh** - Fine-tuning, RAG integration
4. **Ứng dụng giáo dục** - Đề xuất use-case cho từng mô hình`,
    subject: 'AI Research',
    type: 'RESEARCH',
    status: 'COMPLETED',
    priority: 'LOW',
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    author_name: 'Dr. AI Researcher',
    has_feedback: true,
    score: 92,
    feedback: {
      id: 'fb-004',
      greeting: 'Xuất sắc! Bài nghiên cứu của em rất có giá trị tham khảo.',
      positive_points: [
        { title: 'Phân tích chuyên sâu', description: 'So sánh định lượng rất rõ ràng với benchmark thực tế' },
      ],
      areas_to_improve: [],
      suggestions: [
        { title: 'Cập nhật', description: 'Theo dõi các bản cập nhật mới của Google' },
      ],
      score: 92,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'asn-005',
    title: 'Quiz: Kiểm Tra Kiến Thức Event-Driven Architecture',
    description: 'Bài trắc nghiệm nhanh 15 câu về Kafka, Message Broker và Idempotency.',
    instructions: 'Hoàn thành bài quiz 15 câu hỏi trong 20 phút.',
    subject: 'Microservices',
    type: 'QUIZ',
    status: 'TODO',
    priority: 'LOW',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'demo-user',
    author_name: 'Hệ thống',
  },
];

// ─── Utility Functions ─────────────────────────────────────────────────────────
function formatRelativeTime(dateStr: string, locale: 'vi' | 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return locale === 'vi' ? `Quá hạn ${Math.abs(diffDays)} ngày` : `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return locale === 'vi' ? 'Hôm nay' : 'Today';
  } else if (diffDays === 1) {
    return locale === 'vi' ? 'Ngày mai' : 'Tomorrow';
  } else if (diffDays < 7) {
    return locale === 'vi' ? `${diffDays} ngày nữa` : `In ${diffDays} days`;
  } else {
    return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' });
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Time Remaining Badge ─────────────────────────────────────────────────────
function TimeBadge({ dueDate, locale }: { dueDate: string; locale: 'vi' | 'en' }) {
  const date = new Date(dueDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 2;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
        isOverdue
          ? 'bg-red-50 text-red-600'
          : isUrgent
            ? 'bg-amber-50 text-amber-700'
            : 'bg-neutral-100 text-neutral-500'
      }`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <Clock className="w-3 h-3" />
      {formatRelativeTime(dueDate, locale)}
    </span>
  );
}

// ─── Status Pill Badge ────────────────────────────────────────────────────────
function StatusPill({ status, t }: { status: AssignmentStatus; t: (key: string) => string }) {
  const cfg = STATUS_CONFIG[status];
  const labelMap: Record<AssignmentStatus, string> = {
    TODO: t('assignmentStatusTodo'),
    IN_PROGRESS: t('assignmentStatusProgress'),
    UNDER_REVIEW: t('assignmentStatusReview'),
    COMPLETED: t('assignmentStatusDone'),
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'var(--font-body)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.emoji} {labelMap[status]}
    </span>
  );
}

// ─── Priority Pill Badge ──────────────────────────────────────────────────────
function PriorityPill({ priority, t }: { priority: AssignmentPriority; t: (key: string) => string }) {
  const cfg = PRIORITY_CONFIG[priority];
  const labelMap: Record<AssignmentPriority, string> = {
    HIGH: t('assignmentPriorityHigh'),
    MEDIUM: t('assignmentPriorityMid'),
    LOW: t('assignmentPriorityLow'),
  };

  return (
    <span
      className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded"
      style={{ backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'var(--font-body)' }}
    >
      {labelMap[priority]}
    </span>
  );
}

// ─── Assignment Detail Modal ───────────────────────────────────────────────────
interface AssignmentModalProps {
  assignment: Assignment;
  onClose: () => void;
  onStatusChange: (id: string, status: AssignmentStatus) => void;
  onSubmit: (id: string, content: string, files: File[]) => void;
  locale: 'vi' | 'en';
  t: (key: string, vars?: Record<string, string | number>) => string;
}

function AssignmentModal({ assignment, onClose, onStatusChange, onSubmit, locale, t }: AssignmentModalProps) {
  const [content, setContent] = useState(assignment.content || '');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeCfg = TYPE_CONFIG[assignment.type];
  const cfg = STATUS_CONFIG[assignment.status];

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!confirm(t('assignmentSubmitConfirm'))) return;
    setUploading(true);
    await onSubmit(assignment.id, content, files);
    setUploading(false);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  };

  const isOverdue = new Date(assignment.due_date) < new Date();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <motion.div
        className="relative bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-4xl mx-4"
        initial={{ scale: 0.97, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{typeCfg.emoji}</span>
              <StatusPill status={assignment.status} t={t} />
              {assignment.has_feedback && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                  <MessageSquare className="w-3 h-3" />
                  {t('assignmentFeedbackAvailable')}
                </span>
              )}
            </div>
            <h2
              className="text-lg font-semibold text-neutral-800 leading-snug"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {assignment.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <TimeBadge dueDate={assignment.due_date} locale={locale} />
              <PriorityPill priority={assignment.priority} t={t} />
              {assignment.score !== undefined && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Star className="w-3 h-3" />
                  {assignment.score}/100
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-100">
          <div className="flex items-center gap-1 px-6">
            <button
              onClick={() => setShowFeedback(false)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                !showFeedback
                  ? 'border-neutral-800 text-neutral-800'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {t('assignmentInstructions')}
            </button>
            {assignment.has_feedback && (
              <button
                onClick={() => setShowFeedback(true)}
                className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                  showFeedback
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {t('assignmentViewFeedback')}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px] max-h-[60vh] overflow-y-auto">
          {!showFeedback ? (
            <div className="p-6">
              {/* Instructions */}
              <div
                className="prose prose-sm prose-neutral max-w-none mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {assignment.instructions}
                </div>
              </div>

              {/* Your Work Section */}
              <div className="border-t border-neutral-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-sm font-semibold text-neutral-700"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {t('assignmentYourWork')}
                  </h3>
                  {assignment.status !== 'COMPLETED' && assignment.status !== 'UNDER_REVIEW' && (
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {saving ? t('assignmentSaving') : t('assignmentSaveDraft')}
                    </button>
                  )}
                </div>

                {/* Text Editor */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('assignmentWriteHere')}
                  disabled={assignment.status === 'COMPLETED' || assignment.status === 'UNDER_REVIEW'}
                  className="w-full min-h-[180px] p-4 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg outline-none resize-y transition-colors focus:border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)', lineHeight: '1.75' }}
                />

                {/* File Upload Zone */}
                {assignment.status !== 'COMPLETED' && assignment.status !== 'UNDER_REVIEW' && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-[#C5A880] bg-[#F5EBE0]/50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('assignmentDragDrop')}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('assignmentUploadHint')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.txt,.zip,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Attached Files */}
                {(files.length > 0 || assignment.attached_files?.length) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('assignmentAttached')}
                    </p>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-white border border-neutral-200 rounded-md"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-xs text-neutral-700 truncate">{file.name}</span>
                          <span className="text-[10px] text-neutral-400">{formatBytes(file.size)}</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AI/Mentor Feedback Section */
            <div className="p-6">
              {assignment.feedback ? (
                <div className="space-y-6">
                  {/* Greeting */}
                  <div className="px-4 py-3 bg-[#F5EBE0]/40 rounded-lg border border-[#F5EBE0]">
                    <p
                      className="text-sm text-neutral-700 leading-relaxed"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {assignment.feedback.greeting}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="text-center px-6 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: 'var(--font-heading)' }}>
                        {assignment.feedback.score}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1">{t('assignmentScore')}</p>
                    </div>
                  </div>

                  {/* Positive Points */}
                  {assignment.feedback.positive_points.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        {locale === 'vi' ? 'Điểm mạnh' : 'Strengths'}
                      </h4>
                      <div className="space-y-2">
                        {assignment.feedback.positive_points.map((point, idx) => (
                          <div key={idx} className="px-3 py-2 bg-emerald-50 rounded-md border border-emerald-100">
                            <p className="text-xs font-medium text-neutral-800">{point.title}</p>
                            <p className="text-xs text-neutral-600 mt-0.5">{point.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas to Improve */}
                  {assignment.feedback.areas_to_improve.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {locale === 'vi' ? 'Cần cải thiện' : 'Areas to Improve'}
                      </h4>
                      <div className="space-y-2">
                        {assignment.feedback.areas_to_improve.map((point, idx) => (
                          <div key={idx} className="px-3 py-2 bg-amber-50 rounded-md border border-amber-100">
                            <p className="text-xs font-medium text-neutral-800">{point.title}</p>
                            <p className="text-xs text-neutral-600 mt-0.5">{point.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {assignment.feedback.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-sky-700 mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {locale === 'vi' ? 'Gợi ý' : 'Suggestions'}
                      </h4>
                      <div className="space-y-2">
                        {assignment.feedback.suggestions.map((point, idx) => (
                          <div key={idx} className="px-3 py-2 bg-sky-50 rounded-md border border-sky-100">
                            <p className="text-xs font-medium text-neutral-800">{point.title}</p>
                            <p className="text-xs text-neutral-600 mt-0.5">{point.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-neutral-400">{t('assignmentNoFeedback')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {assignment.status !== 'COMPLETED' && !showFeedback && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={assignment.status}
                onChange={(e) => onStatusChange(assignment.id, e.target.value as AssignmentStatus)}
                className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-700 outline-none"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <option value="TODO">{t('assignmentStatusTodo')}</option>
                <option value="IN_PROGRESS">{t('assignmentStatusProgress')}</option>
                <option value="UNDER_REVIEW">{t('assignmentStatusReview')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {assignment.status === 'UNDER_REVIEW' ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs text-sky-600 px-3 py-1.5 rounded-md bg-sky-50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  {t('assignmentPendingReview')}
                </span>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading || (!content.trim() && files.length === 0)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {locale === 'vi' ? 'Đang gửi...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {t('assignmentSubmit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Kanban Column Card ───────────────────────────────────────────────────────
function KanbanCard({
  assignment,
  onClick,
  locale,
  t,
}: {
  assignment: Assignment;
  onClick: () => void;
  locale: 'vi' | 'en';
  t: (key: string) => string;
}) {
  const typeCfg = TYPE_CONFIG[assignment.type];
  const statusCfg = STATUS_CONFIG[assignment.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="rounded-lg border border-neutral-100 bg-white overflow-hidden cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
    >
      {/* Priority strip */}
      <div
        className="h-1"
        style={{ backgroundColor: PRIORITY_CONFIG[assignment.priority].bg }}
      />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm">{typeCfg.emoji}</span>
          <TimeBadge dueDate={assignment.due_date} locale={locale} />
        </div>

        {/* Title */}
        <h4
          className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-2 mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {assignment.title}
        </h4>

        {/* Subject */}
        <p className="text-[10px] text-neutral-400 mb-2">{assignment.subject}</p>

        {/* Status & priority */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text, fontFamily: 'var(--font-body)' }}
          >
            {statusCfg.emoji} {t(`assignment${assignment.status.charAt(0) + assignment.status.slice(1).toLowerCase().replace(/_/g, '')}`)}
          </span>
          {assignment.score !== undefined && (
            <span className="text-[10px] font-semibold text-emerald-600">
              {assignment.score}%
            </span>
          )}
        </div>

        {/* Has feedback indicator */}
        {assignment.has_feedback && (
          <div className="mt-2 pt-2 border-t border-neutral-100">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
              <MessageSquare className="w-3 h-3" />
              {t('assignmentFeedbackAvailable')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Kanban Board Column ───────────────────────────────────────────────────────
function KanbanColumn({
  status,
  assignments,
  onCardClick,
  locale,
  t,
}: {
  status: AssignmentStatus;
  assignments: Assignment[];
  onCardClick: (a: Assignment) => void;
  locale: 'vi' | 'en';
  t: (key: string) => string;
}) {
  const statusCfg = STATUS_CONFIG[status];
  const labelMap: Record<AssignmentStatus, string> = {
    TODO: t('assignmentToDo'),
    IN_PROGRESS: t('assignmentInProgress'),
    UNDER_REVIEW: t('assignmentUnderReview'),
    COMPLETED: t('assignmentCompleted'),
  };

  return (
    <div className="flex-1 min-w-[260px] max-w-[320px]">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-lg mb-2"
        style={{ backgroundColor: statusCfg.bg }}
      >
        <div className="flex items-center gap-2">
          <span>{statusCfg.emoji}</span>
          <span
            className="text-xs font-semibold"
            style={{ color: statusCfg.text, fontFamily: 'var(--font-body)' }}
          >
            {labelMap[status]}
          </span>
        </div>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/50"
          style={{ color: statusCfg.text, fontFamily: 'var(--font-body)' }}
        >
          {assignments.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[200px] p-1">
        <AnimatePresence>
          {assignments.map((a) => (
            <KanbanCard
              key={a.id}
              assignment={a}
              onClick={() => onCardClick(a)}
              locale={locale}
              t={t}
            />
          ))}
        </AnimatePresence>

        {assignments.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-300" style={{ fontFamily: 'var(--font-body)' }}>
            {t('noData')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List View Row ─────────────────────────────────────────────────────────────
function ListRow({
  assignment,
  onClick,
  locale,
  t,
}: {
  assignment: Assignment;
  onClick: () => void;
  locale: 'vi' | 'en';
  t: (key: string) => string;
}) {
  const typeCfg = TYPE_CONFIG[assignment.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      onClick={onClick}
      className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/70 transition-colors group"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Title */}
      <div className="col-span-4 flex items-center gap-2.5 min-w-0">
        <span className="text-base flex-shrink-0">{typeCfg.emoji}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-700 truncate group-hover:text-neutral-900 transition-colors">
            {assignment.title}
          </p>
          <p className="text-[10px] text-neutral-400 truncate">{assignment.subject}</p>
        </div>
      </div>

      {/* Due Date */}
      <div className="col-span-2">
        <TimeBadge dueDate={assignment.due_date} locale={locale} />
      </div>

      {/* Status */}
      <div className="col-span-2">
        <StatusPill status={assignment.status} t={t} />
      </div>

      {/* Priority */}
      <div className="col-span-2">
        <PriorityPill priority={assignment.priority} t={t} />
      </div>

      {/* Score / Feedback */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        {assignment.has_feedback && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
            <MessageSquare className="w-3 h-3" />
          </span>
        )}
        {assignment.score !== undefined ? (
          <span className="text-xs font-semibold text-emerald-600">{assignment.score}%</span>
        ) : assignment.status === 'UNDER_REVIEW' ? (
          <span className="text-[10px] text-sky-500 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-pulse" />
            {t('assignmentPendingReview')}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

// ─── Main Assignment Page ─────────────────────────────────────────────────────
type ViewMode = 'board' | 'list';

export default function AssignmentPage({ onBack }: { onBack: () => void }) {
  const { user, profile } = useAuth();
  const { locale, t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'ALL'>('ALL');

  // Load assignments
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Try Supabase first
      if (user) {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        if (!error && data && data.length > 0) {
          setAssignments(data as Assignment[]);
          setLoading(false);
          return;
        }
      }

      // Fallback to mock data
      await new Promise((r) => setTimeout(r, 400));
      setAssignments(MOCK_ASSIGNMENTS);
      setLoading(false);
    };

    load();
  }, [user]);

  // Handle status change
  const handleStatusChange = async (id: string, status: AssignmentStatus) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a))
    );
    setSelected(null);

    // Sync to Supabase if available
    if (user) {
      await supabase
        .from('assignments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
  };

  // Handle submit
  const handleSubmit = async (id: string, content: string, files: File[]) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'UNDER_REVIEW' as AssignmentStatus,
              content,
              updated_at: new Date().toISOString(),
            }
          : a
      )
    );
    setSelected(null);
  };

  // Filter assignments
  const filtered = assignments.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group by status for Kanban
  const todoList = filtered.filter((a) => a.status === 'TODO');
  const progressList = filtered.filter((a) => a.status === 'IN_PROGRESS');
  const reviewList = filtered.filter((a) => a.status === 'UNDER_REVIEW');
  const completedList = filtered.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('assignmentBack')}
          </button>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                placeholder={t('assignmentSearch')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors w-48"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'ALL')}
              className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-600 outline-none focus:border-neutral-300"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="ALL">{t('assignmentTabAll')}</option>
              <option value="TODO">{t('assignmentToDo')}</option>
              <option value="IN_PROGRESS">{t('assignmentInProgress')}</option>
              <option value="UNDER_REVIEW">{t('assignmentUnderReview')}</option>
              <option value="COMPLETED">{t('assignmentCompleted')}</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-neutral-200 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'board'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
                title={t('assignmentBoardView')}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
                title={t('assignmentListView')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Hero */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">📋</span>
          <h1
            className="text-2xl font-semibold text-neutral-800"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('assignmentTitle')}
          </h1>
        </div>
        <p
          className="text-sm text-neutral-500 max-w-xl"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('assignmentSubtitle')}
        </p>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-300" />
            <span className="text-xs text-neutral-500">{t('assignmentToDo')}: {todoList.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E6AC00' }} />
            <span className="text-xs text-amber-600">{t('assignmentInProgress')}: {progressList.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-xs text-sky-600">{t('assignmentUnderReview')}: {reviewList.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-600">{t('assignmentCompleted')}: {completedList.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 pb-12">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F5EBE0] mb-4">
              <div className="w-5 h-5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-neutral-400">{t('loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-sm font-medium text-neutral-500 mb-1">{t('assignmentEmpty')}</p>
            <p className="text-xs text-neutral-400">{t('assignmentEmptyHint')}</p>
          </div>
        ) : viewMode === 'board' ? (
          /* Kanban Board View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              status="TODO"
              assignments={todoList}
              onCardClick={setSelected}
              locale={locale}
              t={t}
            />
            <KanbanColumn
              status="IN_PROGRESS"
              assignments={progressList}
              onCardClick={setSelected}
              locale={locale}
              t={t}
            />
            <KanbanColumn
              status="UNDER_REVIEW"
              assignments={reviewList}
              onCardClick={setSelected}
              locale={locale}
              t={t}
            />
            <KanbanColumn
              status="COMPLETED"
              assignments={completedList}
              onCardClick={setSelected}
              locale={locale}
              t={t}
            />
          </div>
        ) : (
          /* List View */
          <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden">
            {/* Table Header */}
            <div
              className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <div className="col-span-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('assignmentName')}
              </div>
              <div className="col-span-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('assignmentDueDate')}
              </div>
              <div className="col-span-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('assignmentStatus')}
              </div>
              <div className="col-span-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {t('assignmentPriority')}
              </div>
              <div className="col-span-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-right">
                {t('assignmentScore')}
              </div>
            </div>

            {/* Rows */}
            <div>
              <AnimatePresence>
                {filtered.map((a) => (
                  <ListRow
                    key={a.id}
                    assignment={a}
                    onClick={() => setSelected(a)}
                    locale={locale}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
              <p className="text-xs text-neutral-400">{filtered.length} assignments</p>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {selected && (
          <AssignmentModal
            assignment={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
            locale={locale}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
