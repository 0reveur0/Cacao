/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Circle as HelpCircle, Search, Plus, Send, X, Cpu, User, CircleCheck as CheckCircle2, Clock, BookOpen, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Bilingual Dictionary ─────────────────────────────────────────────────────
const discussionI18n = {
  vi: {
    pageTitle: 'Khong gian thao luan',
    pageSubtitle: 'Noi ban trao doi ve bai hoc. Moi cau hoi deu duoc Mentor va AI ho tro giai dap.',
    searchPlaceholder: 'Tim kiem cau hoi hoac chu de...',
    btnAsk: 'Dat cau hoi moi',
    labelTitle: 'Tieu de cau hoi',
    labelContent: 'Noi dung chi tiet',
    inputContentPlaceholder: 'Viet cau hoi cua ban tai day...',
    tagLesson: 'Bai hoc lien quan',
    responseAi: 'Phan hoi tu AI',
    responseMentor: 'Phan hoi tu Mentor',
    statusResolved: 'Da giai dap',
    statusPending: 'Cho phan hoi',
    noQuestions: 'Chua co cau hoi nao',
    noQuestionsHint: 'Hay dat cau hoi dau tien cua ban.',
    noResults: 'Khong tim thay ket qua',
    noResultsHint: 'Thu tu khoa khac hoac xoa bo loc.',
    composeNew: 'Cau hoi moi',
    composeTitlePh: 'Tieu de cau hoi...',
    composeBodyPh: 'Viet cau hoi cua ban tai day...',
    composeCancel: 'Huy',
    composeSubmit: 'Gui cau hoi',
    composeSubmitting: 'Dang gui...',
    backBtn: 'Quay lai',
    byUser: 'boi',
    justNow: 'Vua xong',
    minutesAgo: 'phut truoc',
    hoursAgo: 'gio truoc',
    daysAgo: 'ngay truoc',
    selectLesson: 'Chon bai hoc...',
    noLesson: 'Khong co bai hoc cu the',
  },
  en: {
    pageTitle: 'Discussion Workspace',
    pageSubtitle: 'A space to discuss your lessons. Every question is supported by Mentors and AI.',
    searchPlaceholder: 'Search questions or topics...',
    btnAsk: 'Ask a new question',
    labelTitle: 'Question title',
    labelContent: 'Detailed content',
    inputContentPlaceholder: 'Write your question here...',
    tagLesson: 'Related lesson',
    responseAi: 'AI Response',
    responseMentor: 'Mentor Response',
    statusResolved: 'Resolved',
    statusPending: 'Pending',
    noQuestions: 'No questions yet',
    noQuestionsHint: 'Ask your first question to get started.',
    noResults: 'No results found',
    noResultsHint: 'Try a different search term or clear the filter.',
    composeNew: 'New Question',
    composeTitlePh: 'Question title...',
    composeBodyPh: 'Write your question here...',
    composeCancel: 'Cancel',
    composeSubmit: 'Submit question',
    composeSubmitting: 'Submitting...',
    backBtn: 'Back',
    byUser: 'by',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    selectLesson: 'Select a lesson...',
    noLesson: 'No specific lesson',
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type DiscussionStatus = 'PENDING' | 'RESOLVED';

interface Discussion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  lesson_id: string | null;
  status: DiscussionStatus;
  ai_response: string | null;
  mentor_response: string | null;
  mentor_id: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

// ─── Mock Data Seeds ───────────────────────────────────────────────────────────
const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-001',
    user_id: 'user-1',
    title: 'Su khac biet giua INNER JOIN va LEFT JOIN',
    content: 'Toi dang hoc ve SQL joins va chua hieu ro khi nao nen dung INNER JOIN thay vi LEFT JOIN. Co ai giai thich duoc cu the hon khong? Day la vi du minh dang nghien cuu:\n\n```sql\nSELECT * FROM users\nINNER JOIN orders ON users.id = orders.user_id;\n```\n\nSo voi:\n\n```sql\nSELECT * FROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n```',
    lesson_id: 'lesson-2',
    status: 'RESOLVED',
    ai_response: 'Chao ban! Day la cau hoi rat hay ve SQL joins.\n\n**INNER JOIN** chi tra ve cac hang co du lieu o ca hai bang. Nghia la neu mot user chua co don hang nao, ho se khong xuat hien trong ket qua.\n\n**LEFT JOIN** tra ve tat ca hang tu bang ben trai (users), va neu khong co du lieu tu bang ben phai (orders), cac cot do se la NULL.\n\nVi du cu the:\n- INNER JOIN: Chi hien thi users da co it nhat 1 don hang\n- LEFT JOIN: Hien thi TAT CA users, ke ca nhung nguoi chua tung dat hang (cac cot orders se NULL)',
    mentor_response: 'Ban da hoi rat tot! Them mot vi du thuc te: Neu ban muon xem tat ca hoc sinh va diem thi cua ho, dung LEFT JOIN de bao gom ca nhung hoc sinh chua thi. INNER JOIN chi tra ve nhung nguoi da thi.',
    mentor_id: 'mentor-1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    author_name: 'Nguyen Van A',
  },
  {
    id: 'disc-002',
    user_id: 'user-2',
    title: 'Tai sao can dung INDEX trong SQL?',
    content: 'Toi doc tren tai lieu la INDEX giup tang toc truy van, nhung khong hieu tai sao. Co phai INDEX nhu la muc luc trong sach? Va neu the thi tai sao khong luon dung INDEX cho moi cot?',
    lesson_id: 'lesson-3',
    status: 'RESOLVED',
    ai_response: 'Chinh xac! INDEX giong nhu muc luc trong sach.\n\n**Tai sao INDEX tang toc?**\n- Khong co INDEX: Database phai quet tung hang (Full Table Scan)\n- Co INDEX: Database nhay toi dung vi tri can tim\n\n**Tai sao khong dung cho moi cot?**\n- INDEX ton dung luong dia them\n- Moi lan INSERT/UPDATE/DELETE, INDEX phai duoc cap nhat => lam cham thao tac ghi\n- Chi nen dung INDEX cho cot thuong xuyen duoc tim kiem hoac dung trong WHERE, JOIN',
    mentor_response: null,
    mentor_id: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    author_name: 'Tran Thi B',
  },
  {
    id: 'disc-003',
    user_id: 'user-3',
    title: 'GROUP BY va HAVING khac nhau the nao?',
    content: 'Toi that su khong hieu su khac biet giua WHERE va HAVING. Cai nao dung truoc, cai nao dung sau? Va tai sao can ca hai?',
    lesson_id: 'lesson-3',
    status: 'PENDING',
    ai_response: null,
    mentor_response: null,
    mentor_id: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    author_name: 'Le Van C',
  },
  {
    id: 'disc-004',
    user_id: 'user-1',
    title: 'SELECT * co tot khong?',
    content: 'Trong cac vi du minh thay hay dung SELECT *. Day co phai la thuc hanh tot khong? Hay nen chi dinh tung cot cu the?',
    lesson_id: 'lesson-1',
    status: 'PENDING',
    ai_response: null,
    mentor_response: null,
    mentor_id: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    author_name: 'Nguyen Van A',
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<DiscussionStatus, { bg: string; text: string; dot: string }> = {
  RESOLVED: { bg: '#E2F0D9', text: '#385723', dot: '#385723' },
  PENDING:  { bg: '#FFF2CC', text: '#7F6000', dot: '#E6AC00' },
};

// ─── Time Formatting ───────────────────────────────────────────────────────────
function formatRelativeTime(dateStr: string, locale: 'vi' | 'en', t: (key: string) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return t('justNow');
  if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
  if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
  return `${diffDays} ${t('daysAgo')}`;
}

// ─── Compose Modal ─────────────────────────────────────────────────────────────
interface ComposeModalProps {
  onClose: () => void;
  onSubmit: (title: string, content: string, lessonId: string | null) => Promise<void>;
  lessons: { id: string; title: string }[];
  t: (key: string) => string;
  locale: 'vi' | 'en';
}

function ComposeModal({ onClose, onSubmit, lessons, t, locale }: ComposeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lessonId, setLessonId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError(locale === 'vi' ? 'Vui long dien day du thong tin.' : 'Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(title.trim(), content.trim(), lessonId || null);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error submitting question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-xl mx-4 overflow-hidden"
        initial={{ scale: 0.97, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3
            className="text-sm font-semibold text-neutral-800"
                      >
            {t('composeNew')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
              {t('labelTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('composeTitlePh')}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-colors"
                          />
          </div>

          {/* Lesson selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
              {t('tagLesson')}
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 text-neutral-700 outline-none focus:border-neutral-400 transition-colors"
                          >
              <option value="">{t('selectLesson')}</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
              {t('labelContent')}
            </label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('composeBodyPh')}
              rows={6}
              className="w-full px-3 py-3 text-sm rounded-md border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-colors resize-none"
              style={{ fontFamily: 'var(--font-body)', lineHeight: '1.65' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                      >
            {t('composeCancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md text-white bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
            {submitting ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                {t('composeSubmitting')}
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                {t('composeSubmit')}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
interface QuestionCardProps {
  discussion: Discussion;
  onClick: () => void;
  t: (key: string) => string;
  locale: 'vi' | 'en';
}

function QuestionCard({ discussion, onClick, t, locale }: QuestionCardProps) {
  const statusCfg = STATUS_CONFIG[discussion.status];
  const timeStr = formatRelativeTime(discussion.created_at, locale, t);

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-neutral-200 bg-white overflow-hidden transition-colors duration-100 hover:bg-[#F9F9F8]"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <span
              className="text-[10px] text-neutral-400"
                          >
              {timeStr}
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text, fontFamily: 'var(--font-body)' }}
          >
            {discussion.status === 'RESOLVED' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {t(discussion.status === 'RESOLVED' ? 'statusResolved' : 'statusPending')}
          </span>
        </div>

        {/* Title */}
        <h4
          className="text-sm font-semibold text-neutral-800 leading-snug mb-2"
                  >
          {discussion.title}
        </h4>

        {/* Snippet */}
        <p
          className="text-xs text-neutral-500 leading-relaxed line-clamp-2"
                  >
          {discussion.content.replace(/```[\s\S]*?```/g, '[code]').replace(/\n+/g, ' ').slice(0, 120)}...
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
            {t('byUser')} {discussion.author_name || 'User'}
          </span>
          <ChevronRight className="w-4 h-4 text-neutral-300" />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Response Callout Block ───────────────────────────────────────────────────
interface ResponseCalloutProps {
  type: 'ai' | 'mentor';
  content: string;
  t: (key: string) => string;
}

function ResponseCallout({ type, content, t }: ResponseCalloutProps) {
  const isAi = type === 'ai';

  return (
    <div
      className="rounded-md border-l-2 bg-[#F1F1EF] border-neutral-400 px-4 py-3"
          >
      <div className="flex items-start gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: isAi ? '#E0F2FE' : '#F5EBE0' }}
        >
          {isAi ? (
            <Cpu className="w-3 h-3 text-sky-600" strokeWidth={1.5} />
          ) : (
            <User className="w-3 h-3 text-amber-700" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-neutral-600 mb-2">
            {isAi ? t('responseAi') : t('responseMentor')}
          </p>
          <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question Detail View ──────────────────────────────────────────────────────
interface QuestionDetailProps {
  discussion: Discussion;
  onBack: () => void;
  t: (key: string) => string;
  locale: 'vi' | 'en';
}

function QuestionDetail({ discussion, onBack, t, locale }: QuestionDetailProps) {
  const statusCfg = STATUS_CONFIG[discussion.status];
  const timeStr = formatRelativeTime(discussion.created_at, locale, t);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
              >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('backBtn')}
      </button>

      {/* Question card */}
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text, fontFamily: 'var(--font-body)' }}
            >
              {discussion.status === 'RESOLVED' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {t(discussion.status === 'RESOLVED' ? 'statusResolved' : 'statusPending')}
            </span>
            <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {timeStr}
            </span>
          </div>

          <h2
            className="text-lg font-semibold text-neutral-800 leading-snug mb-2"
                      >
            {discussion.title}
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {t('byUser')} {discussion.author_name || 'User'}
            </span>
            {discussion.lesson_id && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-500" style={{ fontFamily: 'var(--font-body)' }}>
                <BookOpen className="w-3 h-3" />
                {discussion.lesson_id}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div
            className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap"
                      >
            {discussion.content}
          </div>
        </div>

        {/* Responses section */}
        {(discussion.ai_response || discussion.mentor_response) && (
          <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
            {discussion.ai_response && (
              <ResponseCallout type="ai" content={discussion.ai_response} t={t} />
            )}
            {discussion.mentor_response && (
              <ResponseCallout type="mentor" content={discussion.mentor_response} t={t} />
            )}
          </div>
        )}

        {/* Pending state */}
        {discussion.status === 'PENDING' && !discussion.ai_response && (
          <div className="px-6 py-6 border-t border-neutral-100 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 mb-3">
              <HelpCircle className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {locale === 'vi'
                ? 'Cau hoi dang cho phan hoi tu AI va Mentor.'
                : 'This question is awaiting a response from AI and Mentors.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Discussion Page ──────────────────────────────────────────────────────
export default function DiscussionPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const t = (key: string) => (discussionI18n[locale] as Record<string, string>)[key] || key;

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DiscussionStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Discussion | null>(null);
  const [composing, setComposing] = useState(false);

  // Mock lessons for the selector
  const lessons = [
    { id: 'lesson-1', title: locale === 'vi' ? 'Khoi dau nhe nhang voi SELECT' : 'Gentle Start with SELECT' },
    { id: 'lesson-2', title: locale === 'vi' ? 'Ket noi du lieu bang JOIN' : 'Connecting Data with JOIN' },
    { id: 'lesson-3', title: locale === 'vi' ? 'Toi uu hoa truy van nang cao' : 'Advanced Query Optimization' },
  ];

  const loadDiscussions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/discussions');
      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload.discussions) && payload.discussions.length > 0) {
          setDiscussions(payload.discussions as Discussion[]);
        } else {
          setDiscussions(MOCK_DISCUSSIONS);
        }
      } else {
        setDiscussions(MOCK_DISCUSSIONS);
      }
    } catch {
      setDiscussions(MOCK_DISCUSSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadDiscussions(true);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [loadDiscussions]);

  const handleSubmitQuestion = async (title: string, content: string, lessonId: string | null) => {
    const newDiscussion: Discussion = {
      id: `disc-${Date.now()}`,
      user_id: user?.id || 'demo-user',
      title,
      content,
      lesson_id: lessonId,
      status: 'PENDING',
      ai_response: null,
      mentor_response: null,
      mentor_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_name: user?.email?.split('@')[0] || 'User',
    };

    if (user) {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          content,
          lessonId,
        }),
      });

      if (res.ok) {
        loadDiscussions(true);
        return;
      }
    }

    setDiscussions((prev) => [newDiscussion, ...prev]);
  };

  // Filter discussions
  const filtered = discussions.filter((d) => {
    const matchesSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Detail view
  if (selected) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <span className="text-xs font-medium px-2 py-1 rounded bg-[#F5EBE0] text-[#C5A880]" style={{ fontFamily: 'var(--font-body)' }}>
              Cacao TLMS
            </span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <QuestionDetail
            discussion={selected}
            onBack={() => setSelected(null)}
            t={t}
            locale={locale}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('backBtn')}
          </button>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors w-40 md:w-52"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadDiscussions(true)}
              disabled={refreshing}
              className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Ask button */}
            <button
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('btnAsk')}
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#F1F1EF]">
              <MessageSquare className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
            </div>
            <h1
              className="text-2xl font-semibold text-neutral-900 leading-tight"
                          >
              {t('pageTitle')}
            </h1>
          </div>
          <p
            className="text-sm text-neutral-500 max-w-lg leading-relaxed"
                      >
            {t('pageSubtitle')}
          </p>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => setFilter('ALL')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors duration-100 ${
                filter === 'ALL'
                  ? 'bg-neutral-800 text-white border-transparent'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {locale === 'vi' ? 'Tat ca' : 'All'}
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors duration-100 ${
                filter === 'PENDING'
                  ? 'bg-[#FFF2CC] text-[#7F6000] border-transparent'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {t('statusPending')}
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors duration-100 ${
                filter === 'RESOLVED'
                  ? 'bg-[#E2F0D9] text-[#385723] border-transparent'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {t('statusResolved')}
            </button>
          </div>
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-neutral-200 bg-white px-5 py-4 animate-pulse">
                <div className="h-3 w-20 rounded bg-neutral-100 mb-3" />
                <div className="h-4 w-3/4 rounded bg-neutral-100 mb-2" />
                <div className="h-3 w-full rounded bg-neutral-100 mb-1" />
                <div className="h-3 w-2/3 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 py-16 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 mb-4">
              <HelpCircle className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-neutral-500 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {search ? t('noResults') : t('noQuestions')}
            </p>
            <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {search ? t('noResultsHint') : t('noQuestionsHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((d) => (
                <QuestionCard
                  key={d.id}
                  discussion={d}
                  onClick={() => setSelected(d)}
                  t={t}
                  locale={locale}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400">
              {filtered.length} {locale === 'vi' ? 'cau hoi' : 'questions'}
            </p>
          </div>
        )}
      </main>

      {/* Compose Modal */}
      <AnimatePresence>
        {composing && (
          <ComposeModal
            onClose={() => setComposing(false)}
            onSubmit={handleSubmitQuestion}
            lessons={lessons}
            t={t}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
