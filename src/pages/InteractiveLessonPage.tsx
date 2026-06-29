/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Clock, Save, Check, CircleAlert as AlertCircle, Download, ChevronDown, ChevronRight, BookOpen, Video, FileText, FolderOpenDot, LockKeyhole, NotebookPen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lesson, Quiz, AIFeedbackResponse, LessonNote } from '../types';

function getStoredNotes(userId: string, lessonId: string) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`cacao:notes:${userId}:${lessonId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredNotes(userId: string, lessonId: string, content: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`cacao:notes:${userId}:${lessonId}`, JSON.stringify({ content }));
}

// ─── Utility: parse timestamp (MM:SS or HH:MM:SS) to seconds ─────────────────────
function parseTimestampToSeconds(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// ─── Utility: format seconds to MM:SS ───────────────────────────────────────────
function formatSecondsToTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ─── YouTube Player Hook ────────────────────────────────────────────────────────
function useYouTubePlayer(videoId: string | null) {
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Declare callback on window
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            setDuration(playerRef.current?.getDuration?.() || 0);
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          },
        },
      });
    };

    // Poll for current time
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerReadyRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime?.() || 0);
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.seekTo?.(seconds, true);
      playerRef.current.playVideo?.();
    }
  }, []);

  return { currentTime, duration, isPlaying, seekTo };
}

// ─── Vimeo Player Hook (simplified) ─────────────────────────────────────────────
function useVimeoPlayer(videoId: string | null) {
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!videoId) return;

    // Simulated Vimeo player (for demo; real Vimeo would use Vimeo Player SDK)
    intervalRef.current = setInterval(() => {
      // Simulated time progression
      setCurrentTime((prev) => {
        const next = prev + 0.5;
        if (next >= 120) {
          setIsPlaying(false);
          return 120;
        }
        return next;
      });
    }, 500);

    setDuration(120); // 2 minutes simulated duration
    setIsPlaying(true);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  }, []);

  return { currentTime, duration, isPlaying, seekTo };
}

// ─── Parse video URL to extract platform and ID ──────────────────────────────────
function parseVideoUrl(url: string): { platform: 'youtube' | 'vimeo' | 'other'; id: string | null } {
  // YouTube patterns
  const ytMatch1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  if (ytMatch1) return { platform: 'youtube', id: ytMatch1[1] };

  // Vimeo patterns
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };

  return { platform: 'other', id: null };
}

// ─── Notion-style Toggle Block for Reading Material ─────────────────────────────
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

// ─── Concept Glossary Section ─────────────────────────────────────────────────────
const CONCEPT_DESCRIPTIONS: Record<string, string> = {
  'select-basic': 'Câu lệnh SELECT cơ bản dùng để truy xuất dữ liệu từ một hoặc nhiều bảng trong cơ sở dữ liệu.',
  'select-columns': 'Chỉ định các cột cụ thể cần lấy thay vì SELECT *, giúp tiết kiệm băng thông và tăng hiệu suất.',
  'where-filter': 'Mệnh đề WHERE lọc các hàng theo điều kiện logic, chỉ trả về những bản ghi thoả mãn điều kiện.',
  'order-by': 'ORDER BY sắp xếp kết quả theo cột chỉ định — ASC (tăng dần) hoặc DESC (giảm dần).',
  'inner-join': 'INNER JOIN chỉ lấy các hàng có dữ liệu khớp ở cả hai bảng theo điều kiện ON.',
  'left-join': 'LEFT JOIN giữ lại tất cả hàng từ bảng bên trái; các hàng không khớp ở bảng phải sẽ có giá trị NULL.',
  'table-alias': 'Alias (bí danh) rút gọn tên bảng trong câu truy vấn bằng từ khoá AS hoặc khoảng trắng.',
  'index-optimization': 'INDEX tạo một cấu trúc tra cứu nhanh, giúp cơ sở dữ liệu tìm hàng mà không phải quét toàn bộ bảng.',
  'group-by': 'GROUP BY gom các hàng có cùng giá trị cột thành một nhóm, thường dùng kết hợp với hàm tổng hợp như COUNT, SUM, AVG.',
  'having-clause': 'HAVING lọc kết quả SAU khi GROUP BY đã gộp nhóm — khác WHERE là lọc trước khi nhóm.',
};

function ConceptsSection({ concepts }: { concepts: string[] }) {
  if (concepts.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpenDot className="h-4 w-4" strokeWidth={1.5} />
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

// ─── Lesson Content Renderer ───────────────────────────────────────────────────
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

// ─── Main Interactive Lesson Page ───────────────────────────────────────────────
type Tab = 'video' | 'reading' | 'quiz';

interface InteractiveLessonPageProps {
  lesson: Lesson;
  quiz: Quiz | null;
  isLocked: boolean;
  onBack: () => void;
  onQuizComplete?: (passed: boolean, feedback: AIFeedbackResponse) => void;
}

export default function InteractiveLessonPage({
  lesson,
  quiz,
  isLocked,
  onBack,
  onQuizComplete,
}: InteractiveLessonPageProps) {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('video');
  const [noteContent, setNoteContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse video URL
  const { platform, id: videoId } = parseVideoUrl(lesson.videoUrl);

  // Use appropriate player hook
  const ytPlayer = useYouTubePlayer(platform === 'youtube' ? videoId : null);
  const vimeoPlayer = useVimeoPlayer(platform === 'vimeo' ? videoId : null);

  const { currentTime, duration, seekTo } = platform === 'youtube' ? ytPlayer : vimeoPlayer;

  // Load existing note
  useEffect(() => {
    if (!user || !lesson.id) return;
    const saved = getStoredNotes(user.id, lesson.id);
    if (saved?.content) {
      setNoteContent(saved.content);
      setNoteId(`local-${lesson.id}`);
    }
  }, [user, lesson.id]);

  // Scroll to top on lesson change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lesson.id]);

  // Auto-save with debounce
  const saveNote = useCallback(async (content: string) => {
    if (!user || !lesson.id) return;
    setSaving(true);
    setSaveError(null);

    try {
      saveStoredNotes(user.id, lesson.id, content);
      setNoteId((prev) => prev ?? `local-${lesson.id}`);
      setLastSaved(new Date());
      setShowSavedConfirm(true);
      setTimeout(() => setShowSavedConfirm(false), 2000);
    } catch (err: any) {
      setSaveError(err.message || t('lesson_saveError'));
    } finally {
      setSaving(false);
    }
  }, [user, lesson.id, noteId, t]);

  const debouncedSave = useCallback((content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(content);
    }, 1500);
  }, [saveNote]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);
    debouncedSave(content);
  };

  // Add timestamp note
  const handleAddTimestamp = () => {
    const timestamp = formatSecondsToTimestamp(currentTime);
    const timestampLine = t('lesson_timestampFormat', { time: timestamp }) + '\n';
    const newContent = noteContent + timestampLine;
    setNoteContent(newContent);

    // Focus textarea and place cursor at end
    setTimeout(() => {
      if (notesTextareaRef.current) {
        notesTextareaRef.current.focus();
        notesTextareaRef.current.setSelectionRange(newContent.length, newContent.length);
      }
    }, 50);

    debouncedSave(newContent);
  };

  // Handle clicking timestamp in notes to seek video
  const handleTimestampClick = (ts: string) => {
    const seconds = parseTimestampToSeconds(ts);
    seekTo(seconds);
  };

  // Export notes
  const handleExportNotes = () => {
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.title.replace(/\s+/g, '_')}_notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Locked state ─────────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-100 mb-4">
          <LockKeyhole className="h-7 w-7" strokeWidth={1.5} />
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
          <ArrowLeft className="w-4 h-4" /> {t('feedBackBtn')}
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Video }[] = [
    { id: 'video', label: t('lesson_videoLecture'), icon: Video },
    { id: 'reading', label: t('lesson_readingMaterial'), icon: BookOpen },
    { id: 'quiz', label: 'Bài kiểm tra', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                      >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('feedBackBtn')}
          </button>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-1 rounded bg-[#F5EBE0] text-[#C5A880]"
                          >
              Lesson {lesson.order}
            </span>
          </div>
        </div>
      </header>

      {/* Title Banner */}
      <div className="border-b border-neutral-100 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1
            className="text-xl font-semibold text-neutral-800 leading-tight"
                      >
            {lesson.title}
          </h1>
          <p
            className="text-sm text-neutral-500 mt-1"
                      >
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-neutral-100">
        {/* LEFT PANEL: The Lecture */}
        <div className="min-h-[80vh] overflow-y-auto">
          {/* Tabs for mobile/tablet */}
          <nav className="border-b border-neutral-100 bg-white lg:hidden">
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#F5EBE0] text-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                                      >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content based on active tab (mobile) or always visible (desktop) */}
          <div className="p-6 space-y-6">
            {/* Video Section */}
            <section className={(activeTab !== 'video' && 'lg:block hidden')}>
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-neutral-400" />
                <h2
                  className="text-sm font-semibold text-neutral-700"
                                  >
                  {t('lesson_videoLecture')}
                </h2>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200">
                {platform === 'youtube' && videoId ? (
                  <iframe
                    id="youtube-player"
                    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : platform === 'vimeo' && videoId ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <p className="text-sm">{t('lesson_noVideo')}</p>
                    <p className="text-xs mt-2">Vimeo ID: {videoId}</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <p className="text-sm">{t('lesson_noVideo')}</p>
                  </div>
                )}
              </div>

              {/* Video progress indicator */}
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatSecondsToTimestamp(currentTime)} / {formatSecondsToTimestamp(duration || 120)}
                </span>
                <span className="flex items-center gap-1">
                  {saving ? (
                    <>
                      <Save className="w-3 h-3 animate-pulse" />
                      Saving...
                    </>
                  ) : lastSaved ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      {t('lesson_saveSuccess')}
                    </>
                  ) : null}
                </span>
              </div>
            </section>

            {/* Reading Material Section */}
            <section className={(activeTab !== 'reading' && 'lg:block hidden')}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <h2
                  className="text-sm font-semibold text-neutral-700"
                                  >
                  {t('lesson_readingMaterial')}
                </h2>
              </div>

              {/* Concepts */}
              <ConceptsSection concepts={lesson.concepts} />

              {/* Lesson content */}
              <div
                className="rounded-lg border border-neutral-100 bg-white p-5"
                              >
                <LessonContent markdown={lesson.content} />
              </div>
            </section>

            {/* Quiz placeholder */}
            {activeTab === 'quiz' && (
              <section className="lg:hidden">
                <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center">
                  <p className="text-sm text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                    Quiz section available in full lesson view.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: The Dynamic Notepad */}
        <div className="min-h-[80vh] bg-[#FAFAFA] border-l border-neutral-100 hidden lg:block">
          <div className="p-6 h-full flex flex-col">
            {/* Notes Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                <h2
                  className="text-sm font-semibold text-neutral-700"
                                  >
                  {t('lesson_yourNotes')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddTimestamp}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
                                  >
                  <Plus className="w-3 h-3" />
                  {t('lesson_addTimestamp').slice(2)}
                </button>
                <button
                  onClick={handleExportNotes}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Export notes"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timestamp hint */}
            <p
              className="text-[10px] text-neutral-400 mb-3"
                          >
              {t('lesson_timestampHint')}
            </p>

            {/* Notes Textarea Container */}
            <div className="flex-1 relative">
              <textarea
                ref={notesTextareaRef}
                value={noteContent}
                onChange={handleNoteChange}
                placeholder={t('lesson_notesPlaceholder')}
                className="w-full h-full min-h-[500px] p-4 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg outline-none resize-none transition-colors focus:border-neutral-300"
                style={{ fontFamily: 'var(--font-body)', lineHeight: '1.75' }}
              />

              {/* Custom timestamp click handler overlay */}
              <TimestampClickLayer
                content={noteContent}
                onTimestampClick={handleTimestampClick}
                textareaRef={notesTextareaRef}
              />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('lesson_autoSaveHint')}
              </span>
              <span className="flex items-center gap-1">
                {showSavedConfirm ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <Check className="w-3 h-3" />
                    {t('lesson_saveSuccess')}
                  </motion.span>
                ) : saving ? (
                  <span className="flex items-center gap-1">
                    <Save className="w-3 h-3 animate-pulse" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span>
                    Last saved: {lastSaved.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : null}
              </span>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-2 flex items-center gap-2 text-xs text-red-500"
                                  >
                  <AlertCircle className="w-3 h-3" />
                  {saveError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Notes Panel */}
      <div className="lg:hidden border-t border-neutral-100 bg-[#FAFAFA]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold text-neutral-700"
                          >
              {t('lesson_yourNotes')}
            </h3>
            <button
              onClick={handleAddTimestamp}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-neutral-200 text-neutral-600"
                          >
              <Plus className="w-3 h-3" />
              Timestamp
            </button>
          </div>
          <textarea
            value={noteContent}
            onChange={handleNoteChange}
            placeholder={t('lesson_notesPlaceholder')}
            className="w-full h-48 p-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg outline-none resize-none"
            style={{ fontFamily: 'var(--font-body)', lineHeight: '1.6' }}
          />
          <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
            <span>{t('lesson_autoSaveHint')}</span>
            {showSavedConfirm && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Timestamp Click Layer (detects timestamp clicks in notes) ──────────────────
function TimestampClickLayer({
  content,
  onTimestampClick,
  textareaRef,
}: {
  content: string;
  onTimestampClick: (ts: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  // Parse timestamps from content
  const timestampRegex = /⏱️\s*(\d{1,2}:\d{2}(?::\d{2})?)/g;
  const timestamps: { ts: string; index: number }[] = [];
  let match;
  while ((match = timestampRegex.exec(content)) !== null) {
    timestamps.push({ ts: match[1], index: match.index });
  }

  // Handle click on timestamp in the rendered overlay
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('timestamp-link')) {
      const ts = target.getAttribute('data-timestamp');
      if (ts) {
        onTimestampClick(ts);
      }
    }
  };

  // Render content with clickable timestamps (mirrors textarea positioning)
  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    timestamps.forEach((item, idx) => {
      // Text before timestamp
      if (item.index > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {content.slice(lastIndex, item.index)}
          </span>
        );
      }
      // Timestamp emoji + clickable link
      const tsEndIndex = content.indexOf('\n', item.index);
      const endIdx = tsEndIndex === -1 ? content.length : tsEndIndex;
      parts.push(
        <span key={`ts-${idx}`}>
          <span className="text-neutral-600">⏱️</span>
          <span
            className="timestamp-link cursor-pointer text-[#C5A880] hover:underline font-medium"
            data-timestamp={item.ts}
            onClick={() => onTimestampClick(item.ts)}
          >
            {item.ts}
          </span>
          <span className="text-neutral-600">
            {content.slice(item.index + `⏱️ ${item.ts}`.length, endIdx)}
          </span>
        </span>
      );
      lastIndex = endIdx;
    });

    // Remaining text
    if (lastIndex < content.length) {
      parts.push(<span key="remaining">{content.slice(lastIndex)}</span>);
    }

    return parts;
  };

  if (timestamps.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          >
      <div
        className="absolute inset-0 p-4 text-sm whitespace-pre-wrap break-words overflow-hidden opacity-0 select-none"
        style={{ lineHeight: '1.75' }}
        onClick={handleClick}
      >
        {renderContent()}
      </div>
    </div>
  );
}
