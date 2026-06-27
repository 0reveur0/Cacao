/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import InteractiveLessonPage from './InteractiveLessonPage';
import PomodoroTimer from '../components/PomodoroTimer';
import CalendarView from '../components/CalendarView';
import {
  Plus,
  MessageSquare,
  Calendar,
  BookOpen,
  LayoutDashboard,
  ClipboardList,
  Settings,
  ChevronRight,
  Lock,
  CircleCheck as CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Layers,
  Info,
} from 'lucide-react';
import { AIFeedbackResponse } from '../types';

// ─── Static course meta ────────────────────────────────────────────────────────
const COURSE_META: Record<
  string,
  { cover: string; icon: string; subject: string; type: string; scheduleVi: string; scheduleEn: string }
> = {
  'lesson-1': {
    cover:       'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
    icon:        '🛡️',
    subject:     'TypeScript',
    type:        'Lecture',
    scheduleVi:  'Thứ 2 & 4',
    scheduleEn:  'Mon & Wed',
  },
  'lesson-2': {
    cover:       'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
    icon:        '🧪',
    subject:     'TypeScript',
    type:        'Workshop',
    scheduleVi:  'Thứ 3 & 5',
    scheduleEn:  'Tue & Thu',
  },
  'lesson-3': {
    cover:       'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
    icon:        '🚀',
    subject:     'Architecture',
    type:        'Deep Dive',
    scheduleVi:  'Thứ 6',
    scheduleEn:  'Friday',
  },
  'lesson-4': {
    cover:       'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
    icon:        '🧠',
    subject:     'AI & Prompting',
    type:        'Seminar',
    scheduleVi:  'Thứ 7',
    scheduleEn:  'Saturday',
  },
};

const FALLBACK_META = {
  cover:      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1',
  icon:       '📖',
  subject:    'General',
  type:       'Lecture',
  scheduleVi: 'TBD',
  scheduleEn: 'TBD',
};

// ─── Status helpers ────────────────────────────────────────────────────────────
type LessonStatus = 'completed' | 'in-progress' | 'locked';

function getStatus(isCompleted: boolean, isLocked: boolean): LessonStatus {
  if (isCompleted) return 'completed';
  if (!isLocked) return 'in-progress';
  return 'locked';
}

// ─── Page component ────────────────────────────────────────────────────────────
export default function DashboardPage({
  onNavigateToAdmin,
  onNavigateToFeed,
}: {
  onNavigateToAdmin?: () => void;
  onNavigateToFeed?: () => void;
}) {
  const { profile } = useAuth();
  const { lessons, quizzes, roadmap, progress, loading, onQuizComplete } = useProgress();
  const { locale, t, toggle } = useLanguage();
  const [activeItem, setActiveItem] = useState('workspace');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [goalDismissed, setGoalDismissed] = useState(false);

  const totalConcepts   = lessons.reduce((sum, l) => sum + l.concepts.length, 0);
  const totalMastered   = progress?.masteredConcepts.length ?? 0;
  const overallProgress = totalConcepts > 0 ? Math.round((totalMastered / totalConcepts) * 100) : 0;
  const completedCount  = roadmap.filter((r) => r.isCompleted).length;
  const inProgressCount = roadmap.filter((r) => !r.isLocked && !r.isCompleted).length;
  const lockedCount     = roadmap.filter((r) => r.isLocked).length;

  // Status config uses translated labels
  const STATUS_CONFIG: Record<LessonStatus, { label: string; className: string; dot: string }> = {
    completed:     { label: t('completed'),  className: 'bg-[#E2F0D9] text-[#385723]', dot: 'bg-[#385723]' },
    'in-progress': { label: t('inProgress'), className: 'bg-[#FFF2CC] text-[#7F6000]', dot: 'bg-[#E6AC00]' },
    locked:        { label: t('locked'),     className: 'bg-[#F2F2F2] text-[#595959]', dot: 'bg-[#ADADAD]' },
  };

  const NAV_ITEMS = [
    { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: t('nav_workspace'), badge: null },
    { icon: <BookOpen className="w-3.5 h-3.5" />,        label: t('nav_courses'),   badge: '4'  },
    { icon: <ClipboardList className="w-3.5 h-3.5" />,   label: t('nav_roadmap'),   badge: null },
    { icon: <MessageSquare className="w-3.5 h-3.5" />,   label: t('nav_discussion'),badge: '3'  },
    { icon: <Calendar className="w-3.5 h-3.5" />,        label: t('nav_schedule'),  badge: null },
    { icon: <Settings className="w-3.5 h-3.5" />,        label: t('nav_settings'),  badge: null },
  ];

  const handleLessonClick = (lessonId: string) => {
    const item = roadmap.find((r) => r.lessonId === lessonId);
    if (item && !item.isLocked) setSelectedLessonId(lessonId);
  };

  const handleQuizComplete = (passed: boolean, feedback: AIFeedbackResponse) => {
    if (selectedLessonId) onQuizComplete(selectedLessonId, passed, feedback);
  };

  // ── Lesson detail view ─────────────────────────────────────────────────────
  if (selectedLessonId) {
    const lesson = lessons.find((l) => l.id === selectedLessonId);
    const quiz   = quizzes[selectedLessonId];
    const item   = roadmap.find((r) => r.lessonId === selectedLessonId);
    if (lesson) {
      return (
        <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
          <Sidebar
            activeItem={activeItem}
            onItemClick={setActiveItem}
            lessons={roadmap.map((r) => ({
              id: r.lessonId, title: r.title,
              status: r.isCompleted ? 'completed' : r.isLocked ? 'locked' : 'active',
            }))}
            onLessonClick={handleLessonClick}
          />
          <main className="flex-1 overflow-y-auto">
            <InteractiveLessonPage
              lesson={lesson}
              quiz={quiz || null}
              isLocked={item?.isLocked ?? false}
              onBack={() => setSelectedLessonId(null)}
              onQuizComplete={handleQuizComplete}
            />
          </main>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3" style={{ backgroundColor: '#F5EBE0' }}>
            <span className="text-xl">☕</span>
          </div>
          <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  const welcomeStr = profile?.name
    ? t('welcome', { name: profile.name })
    : t('welcomeGuest');

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        lessons={roadmap.map((r) => ({
          id: r.lessonId, title: r.title,
          status: r.isCompleted ? 'completed' : r.isLocked ? 'locked' : 'active',
        }))}
        onLessonClick={handleLessonClick}
      />

      {/* ── Main canvas ── */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        {/* Cover banner */}
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src="https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1400&h=400&dpr=1"
            alt="cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

          {/* Language toggle — top-right of banner */}
          <div className="absolute top-3 right-4">
            <button
              onClick={toggle}
              title={t('langToggleTitle')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all duration-200 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#2F2F2F',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span className="text-sm">{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
              {locale === 'vi' ? 'VI' : 'EN'}
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8">
          {/* Page header */}
          <div className="-mt-6 mb-6 flex items-end gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border border-neutral-100 bg-white flex-shrink-0">
              ☕
            </div>
            <div className="pb-1">
              <h1
                className="text-2xl font-semibold leading-tight text-neutral-800"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Cacao TLMS
              </h1>
              <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                {locale === 'vi'
                  ? 'Mastery Learning · Không bảng xếp hạng · Không áp lực'
                  : 'Mastery Learning · No Leaderboards · No Pressure'}
              </p>
            </div>
          </div>

          {/* ── 2-column asymmetric grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-16">

            {/* ══════════════════════════════
                LEFT COLUMN  (1/4 width)
            ══════════════════════════════ */}
            <aside className="lg:col-span-1 space-y-4">

              {/* Quick Actions */}
              <div className="rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {t('quickAction')}
                  </p>
                </div>
                <div className="p-2 space-y-0.5">
                  {onNavigateToAdmin && (
                    <button
                      onClick={onNavigateToAdmin}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#9A6A2A] bg-[#FEF4E8] hover:bg-[#F5EBE0] transition-all duration-200 ease-in-out"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className="text-sm">⚙️</span>
                      {t('adminWorkspace')}
                    </button>
                  )}
                  {onNavigateToFeed && (
                    <button
                      onClick={onNavigateToFeed}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-200 ease-in-out"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className="text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
                        </svg>
                      </span>
                      {t('feedLink')}
                    </button>
                  )}
                  {([
                    { icon: <Plus className="w-3.5 h-3.5" />,         key: 'newCourse'     },
                    { icon: <MessageSquare className="w-3.5 h-3.5" />, key: 'askQuestion'   },
                    { icon: <Calendar className="w-3.5 h-3.5" />,      key: 'viewSchedule'  },
                    { icon: <GraduationCap className="w-3.5 h-3.5" />, key: 'newAssignment' },
                  ] as const).map(({ icon, key }) => (
                    <button
                      key={key}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-all duration-200 ease-in-out"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className="text-neutral-400">{icon}</span>
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pomodoro Focus Timer */}
              <PomodoroTimer />

              {/* Navigation */}
              <div className="rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Navigation
                  </p>
                </div>
                <div className="p-2 space-y-0.5">
                  {NAV_ITEMS.map(({ icon, label, badge }) => (
                    <button
                      key={label}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-200 ease-in-out"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className="flex items-center gap-2.5 text-neutral-500">
                        {icon}
                        {label}
                      </span>
                      {badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 font-medium">
                          {badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Snapshot */}
              <div className="rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {t('reminders')}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <SnapshotRow label={t('completed')}  value={completedCount}  color="#385723" bg="#E2F0D9" />
                  <SnapshotRow label={t('inProgress')} value={inProgressCount} color="#7F6000" bg="#FFF2CC" />
                  <SnapshotRow label={t('locked')}     value={lockedCount}     color="#595959" bg="#F2F2F2" />
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('masteryTotal')}
                      </span>
                      <span className="text-[11px] font-semibold text-[#C5A880]">
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-neutral-100">
                      <motion.div
                        className="h-1 rounded-full"
                        style={{ backgroundColor: '#C5A880' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ══════════════════════════════
                RIGHT COLUMN (3/4 width)
            ══════════════════════════════ */}
            <div className="lg:col-span-3 space-y-8">

              {/* Welcome block */}
              <section>
                <h2
                  className="text-2xl font-semibold text-neutral-800 leading-snug mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {welcomeStr}
                </h2>
                <p className="text-sm text-neutral-400 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                  {t('subWelcome', { count: inProgressCount })}
                </p>
                <AnimatePresence>
                  {!goalDismissed && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#FFF2CC] bg-[#FFFDF0]"
                    >
                      <Info className="w-4 h-4 text-[#E6AC00] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold text-[#7F6000] mb-0.5"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {t('goalTitle')}
                        </p>
                        <p className="text-xs text-[#9B7A00]" style={{ fontFamily: 'var(--font-body)' }}>
                          {t('goalBody')}
                        </p>
                      </div>
                      <button
                        onClick={() => setGoalDismissed(true)}
                        className="text-[#C5A254] hover:text-[#9B7A00] text-xs ml-1 flex-shrink-0 transition-colors"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Courses gallery grid */}
              <section>
                <SectionHeader
                  icon={<BookOpen className="w-4 h-4" />}
                  title={t('section_courses')}
                  tabs={[t('tab_gallery'), t('tab_schedule'), t('tab_details')]}
                />
                {lessons.length === 0 ? (
                  <EmptyState label={t('noCoursesYet')} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {lessons.map((lesson) => {
                      const meta        = COURSE_META[lesson.id] ?? FALLBACK_META;
                      const roadmapItem = roadmap.find((r) => r.lessonId === lesson.id);
                      const status      = getStatus(roadmapItem?.isCompleted ?? false, roadmapItem?.isLocked ?? true);
                      const isClickable = status !== 'locked';
                      const schedule    = locale === 'vi' ? meta.scheduleVi : meta.scheduleEn;
                      return (
                        <CourseGalleryCard
                          key={lesson.id}
                          lesson={lesson}
                          meta={{ ...meta, schedule }}
                          status={status}
                          statusLabel={STATUS_CONFIG[status].label}
                          statusClassName={STATUS_CONFIG[status].className}
                          isClickable={isClickable}
                          onClick={() => isClickable && handleLessonClick(lesson.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Roadmap table */}
              <section>
                <SectionHeader
                  icon={<Layers className="w-4 h-4" />}
                  title={t('section_roadmap')}
                  tabs={[t('tab_table'), t('tab_todo'), t('tab_upcoming')]}
                />
                <div className="mt-4 rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                  {/* Table header */}
                  <div
                    className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/60"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {[
                      t('col_title'),
                      t('col_subject'),
                      t('col_schedule'),
                      t('col_priority'),
                      t('col_status'),
                    ].map((h, i) => (
                      <div
                        key={h}
                        className={`text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1 ${
                          i === 0 ? 'col-span-4' : 'col-span-2'
                        }`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  {roadmap.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-neutral-400">{t('noData')}</div>
                  ) : (
                    <div className="divide-y divide-neutral-50">
                      {roadmap.map((item, idx) => {
                        const lesson      = lessons.find((l) => l.id === item.lessonId);
                        const meta        = COURSE_META[item.lessonId] ?? FALLBACK_META;
                        const schedule    = locale === 'vi' ? meta.scheduleVi : meta.scheduleEn;
                        const status      = getStatus(item.isCompleted, item.isLocked);
                        const statusCfg   = STATUS_CONFIG[status];
                        const priorityLabel =
                          idx === 0
                            ? t('priority_high')
                            : idx === 1
                              ? t('priority_mid')
                              : t('priority_low');
                        const priorityStyle =
                          idx === 0
                            ? 'bg-[#FCE4D6] text-[#843C0C]'
                            : idx === 1
                              ? 'bg-[#FFF2CC] text-[#7F6000]'
                              : 'bg-[#E2EFDA] text-[#375623]';
                        return (
                          <motion.div
                            key={item.lessonId}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.2 }}
                            onClick={() => !item.isLocked && handleLessonClick(item.lessonId)}
                            className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all duration-200 ease-in-out group ${
                              item.isLocked
                                ? 'opacity-50 cursor-default'
                                : 'cursor-pointer hover:bg-neutral-50'
                            }`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                              <span className="flex-shrink-0">
                                {status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#385723]" />
                                ) : status === 'in-progress' ? (
                                  <Circle className="w-4 h-4 text-[#E6AC00]" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-neutral-300" />
                                )}
                              </span>
                              <p className="text-xs font-medium text-neutral-700 truncate group-hover:text-neutral-900 transition-colors">
                                {lesson?.title ?? item.title}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-neutral-500">{meta.subject}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-300 flex-shrink-0" />
                              <span className="text-xs text-neutral-400">{schedule}</span>
                            </div>
                            <div className="col-span-2">
                              <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${priorityStyle}`}>
                                {priorityLabel}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded ${statusCfg.className}`}>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                                {statusCfg.label}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
                    <p className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('roadmapFooter', {
                        total:  roadmap.length,
                        done:   completedCount,
                        active: inProgressCount,
                      })}
                    </p>
                    <button
                      className="text-[11px] text-[#C5A880] hover:text-[#B89A70] flex items-center gap-1 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {t('viewAll')} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Calendar view */}
              <section>
                <SectionHeader
                  icon={<Calendar className="w-4 h-4" />}
                  title={t('section_calendar')}
                  tabs={[t('tab_calendar'), t('tab_list'), t('tab_week')]}
                />
                <div className="mt-4">
                  <CalendarView />
                </div>
              </section>

              {/* Motivational footer */}
              <section>
                <div
                  className="rounded-lg border border-[#F5EBE0] px-5 py-4"
                  style={{ backgroundColor: '#FFFDF8' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">☕</span>
                    <div>
                      <p
                        className="text-xs font-semibold text-neutral-600 mb-0.5"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('footerTitle')}
                      </p>
                      <p
                        className="text-xs text-neutral-500 leading-relaxed"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('footerBody')}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  tabs,
}: {
  icon: React.ReactNode;
  title: string;
  tabs: string[];
}) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-neutral-500">{icon}</span>
        <h3
          className="text-base font-semibold text-neutral-800"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-1 border-b border-neutral-100 -mb-px">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-all duration-150 -mb-px ${
              activeTab === i
                ? 'border-neutral-700 text-neutral-700'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function CourseGalleryCard({
  lesson,
  meta,
  status,
  statusLabel,
  statusClassName,
  isClickable,
  onClick,
}: {
  lesson: { id: string; title: string; description: string; order: number };
  meta: { cover: string; icon: string; subject: string; type: string; schedule: string };
  status: LessonStatus;
  statusLabel: string;
  statusClassName: string;
  isClickable: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={isClickable ? { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } : undefined}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onClick={onClick}
      className={`rounded-lg border border-neutral-100 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out ${
        isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
      }`}
    >
      <div className="relative h-28 overflow-hidden bg-neutral-100">
        <img
          src={meta.cover}
          alt={lesson.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-2 left-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Lesson {lesson.order}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusClassName}`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
          <h4
            className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {lesson.title}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ fontFamily: 'var(--font-body)' }}>
          <MetaProp icon="📅" label={meta.schedule} />
          <MetaProp icon="🏷️" label={meta.type} />
          <MetaProp icon="📚" label={meta.subject} />
        </div>
      </div>
    </motion.div>
  );
}

function MetaProp({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
      <span>{icon}</span>
      {label}
    </span>
  );
}

function SnapshotRow({
  label, value, color, bg,
}: {
  label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="flex items-center justify-between" style={{ fontFamily: 'var(--font-body)' }}>
      <span className="text-xs text-neutral-500">{label}</span>
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded"
        style={{ color, backgroundColor: bg }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-neutral-200 py-10 text-center">
      <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </p>
    </div>
  );
}
