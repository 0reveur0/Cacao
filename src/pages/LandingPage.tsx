/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Brain,
  NotebookPen,
  MessageSquare,
  Bot,
  LayoutDashboard,
  Timer,
  Coffee,
  ArrowRight,
  UserPlus,
  BookOpen,
  BadgeCheck,
  Lock,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── i18n dictionary ───────────────────────────────────────────────────────────
const copy = {
  vi: {
    navIntro:   'Giới thiệu',
    navDocs:    'Tài liệu',
    navContact: 'Liên hệ',
    navLogin:   'Đăng nhập',

    heroBadge:    'Học thấu hiểu, không học vẹt. Không điểm số, không so kè.',
    heroTitle:    'Cacao TLMS — Thong thả học, thực chất master.',
    heroDesc:     'Không gian học tập bình yên, nơi bạn có thể học theo cách riêng của mình. Không áp lực, không bảng xếp hạng — chỉ có bạn và kiến thức.',
    btnStart:     'Bắt đầu ngay',
    btnLearnMore: 'Xem giới thiệu',

    mockUrl:      'cacao.tlms / workspace',
    mockDone:     'Đã xong: TypeScript Fundamentals',
    mockProgress: 'Đang làm: Microservices Architecture',
    mockLocked:   'Chưa mở: Advanced AI Prompting',

    section1Title: 'Thiết kế cho người học, không phải cho điểm số.',
    section1Desc:  'Mỗi tính năng đều giúp bạn thực sự hiểu bài — không hơn không kém.',

    feat1Title: 'Mastery Learning',
    feat1Desc:  'Hoàn thành bài kiểm tra đạt 80% để mở khóa bài tiếp theo. Bạn tự chủ lộ trình, chỉ so sánh với chính mình của hôm qua.',
    feat2Title: 'Ghi chú thông minh',
    feat2Desc:  'Xem video và ghi chú cùng lúc, tự động bắt mốc thời gian. Ghi chú được lưu ngay khi bạn viết.',
    feat3Title: 'Không gian thảo luận',
    feat3Desc:  'Góc thảo luận kiểu Notion Docs, có Mentor và AI giúp giải đáp. Mỗi câu hỏi đều được trả lời.',
    feat4Title: 'Phản hồi AI chi tiết',
    feat4Desc:  'Sau mỗi bài nộp, nhận phản hồi cụ thể từ AI — không chấm điểm, chỉ chỉ ra điểm mạnh và hướng cải thiện.',
    feat5Title: 'Kanban Workspace',
    feat5Desc:  'Quản lý bài tập kiểu Kanban: Chưa làm → Đang làm → Chờ chấm → Hoàn thành. Không bỏ sót deadline.',
    feat6Title: 'Pomodoro Timer',
    feat6Desc:  'Bộ đếm thời gian Pomodoro giúp bạn giữ sự tập trung trong mỗi buổi học. Nghỉ đúng lúc, học đúng cách.',

    quoteText:   '\u201cKhông có học sinh chậm — chỉ có hệ thống chưa đủ kiên nhẫn.\u201d',
    quoteAuthor: '— Cacao TLMS',

    section2Title: 'Học theo cách của bạn, từng bước một.',
    section2Desc:  'Ba bước đơn giản để bắt đầu.',

    step1Num: '01', step1Title: 'Đăng ký & Chọn lộ trình',
    step1Desc: 'Tạo tài khoản trong 30 giây. Chọn vai trò Học sinh hoặc Giảng viên — không gian làm việc sẵn sàng ngay.',
    step2Num: '02', step2Title: 'Học · Ghi chú · Làm bài',
    step2Desc: 'Xem video, ghi chú đồng bộ, hoàn thành bài tập trong Kanban. Không deadline áp lực — chỉ có mốc bạn tự đặt.',
    step3Num: '03', step3Title: 'Nhận phản hồi & Tiến bước',
    step3Desc: 'AI và Mentor phân tích bài làm, chỉ ra điểm mạnh và hướng cải thiện. Đạt 80%, bài tiếp theo tự mở khóa.',

    footerTitle:      'Bắt đầu hành trình học tập của bạn hôm nay.',
    footerSubtitle:   'Miễn phí. Không quảng cáo. Không điểm số phán xét.',
    footerBtnCreate:  'Tạo tài khoản',
    footerHasAccount: 'Đã có tài khoản? Đăng nhập',
    footerClosing:    'Thong thả học nhé.',
  },

  en: {
    navIntro:   'About',
    navDocs:    'Docs',
    navContact: 'Contact',
    navLogin:   'Login',

    heroBadge:    'Deep understanding over rote learning. No grades, no competition.',
    heroTitle:    'Cacao TLMS — Learn at your pace, master the core.',
    heroDesc:     'A peaceful learning workspace designed for your own path. No pressure, no leaderboards — just you and knowledge.',
    btnStart:     'Get Started',
    btnLearnMore: 'Introduction',

    mockUrl:      'cacao.tlms / workspace',
    mockDone:     'Done: TypeScript Fundamentals',
    mockProgress: 'In Progress: Microservices Architecture',
    mockLocked:   'Locked: Advanced AI Prompting',

    section1Title: 'Designed for learners, not for scores.',
    section1Desc:  'Every feature serves one purpose: to help you truly understand.',

    feat1Title: 'Mastery Learning',
    feat1Desc:  'Score 80% or higher on the quiz to unlock the next block. Own your roadmap and only compete with yourself.',
    feat2Title: 'Smart Notes',
    feat2Desc:  'Watch lectures and take notes simultaneously with auto-timestamps. Your notes are saved as you type.',
    feat3Title: 'Discussion Board',
    feat3Desc:  'A Notion-style discussion workspace with Mentor and AI support. Every question gets answered.',
    feat4Title: 'Detailed AI Feedback',
    feat4Desc:  'Get actionable text breakdowns from AI after every submission. No grading, just clear ways to improve.',
    feat5Title: 'Kanban Workspace',
    feat5Desc:  'Manage tasks with a clear Kanban flow: To Do → Doing → Under Review → Done. Never miss a deadline.',
    feat6Title: 'Pomodoro Timer',
    feat6Desc:  'An embedded Pomodoro tracker to keep you in the zone. Take breaks naturally, study efficiently.',

    quoteText:   '\u201cThere are no slow students — only systems lacking patience.\u201d',
    quoteAuthor: '— Cacao TLMS',

    section2Title: 'Your learning, one step at a time.',
    section2Desc:  'Three simple steps to start.',

    step1Num: '01', step1Title: 'Sign Up & Choose Path',
    step1Desc: 'Create an account in 30 seconds. Choose Student or Instructor role — your workspace is instantly ready.',
    step2Num: '02', step2Title: 'Learn · Note · Submit',
    step2Desc: 'Watch videos, sync your notes, and track assignments on Kanban. No stressful deadlines — just your goals.',
    step3Num: '03', step3Title: 'Feedback & Advance',
    step3Desc: 'AI and Mentors break down your work. Hit 80% accuracy to unlock the next lesson automatically.',

    footerTitle:      'Start your learning journey today.',
    footerSubtitle:   'Free. No ads. No judgmental grading.',
    footerBtnCreate:  'Create Account',
    footerHasAccount: 'Already have an account? Log in',
    footerClosing:    'Take your time.',
  },
} as const;

type Copy = typeof copy.vi;

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onNavigateToLogin:    () => void;
  onNavigateToRegister: () => void;
}

// ─── Fade-in (opacity only — calm, no slide) ──────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-32px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.28, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature icon map ─────────────────────────────────────────────────────────
type FeatureKey = 'feat1' | 'feat2' | 'feat3' | 'feat4' | 'feat5' | 'feat6';

const FEATURE_ICONS: Record<FeatureKey, typeof Brain> = {
  feat1: Brain,
  feat2: NotebookPen,
  feat3: MessageSquare,
  feat4: Bot,
  feat5: LayoutDashboard,
  feat6: Timer,
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  featureKey,
  title,
  body,
  delay,
}: {
  featureKey: FeatureKey;
  title: string;
  body: string;
  delay: number;
}) {
  const Icon = FEATURE_ICONS[featureKey];
  return (
    <FadeIn delay={delay}>
      <div
        className="p-5 rounded-lg border h-full transition-colors duration-100 hover:bg-[#F1F1EF]"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center mb-3 flex-shrink-0"
          style={{ backgroundColor: '#F5F5F4' }}
        >
          <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: '#595959' }} />
        </div>
        <h3
          className="text-sm font-semibold mb-1.5"
          style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: '#6B6B6B', fontFamily: 'var(--font-body)' }}>
          {body}
        </p>
      </div>
    </FadeIn>
  );
}

// ─── Step icon map ────────────────────────────────────────────────────────────
const STEP_ICONS = [UserPlus, BookOpen, BadgeCheck] as const;

// ─── Step Row ─────────────────────────────────────────────────────────────────
function StepRow({
  stepIndex,
  num,
  title,
  body,
  delay,
  isLast,
}: {
  stepIndex: number;
  num: string;
  title: string;
  body: string;
  delay: number;
  isLast: boolean;
}) {
  const Icon = STEP_ICONS[stepIndex];
  return (
    <FadeIn delay={delay}>
      <div className="relative flex gap-5 items-start pb-8">
        {/* vertical connector */}
        {!isLast && (
          <div
            className="absolute left-4 top-9 bottom-0 w-px"
            style={{ backgroundColor: '#E5E5E5' }}
          />
        )}
        {/* icon circle */}
        <div
          className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 relative z-10"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: '#595959' }} />
        </div>
        <div className="pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-semibold tabular-nums"
              style={{ color: '#C5A880', fontFamily: 'var(--font-heading)' }}
            >
              {num}
            </span>
            <p
              className="text-sm font-semibold"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </p>
          </div>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: '#6B6B6B', fontFamily: 'var(--font-body)' }}
          >
            {body}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Mock row config ──────────────────────────────────────────────────────────
const MOCK_ROW_ICONS = [BadgeCheck, Clock, Lock] as const;
const MOCK_ROW_STYLES = [
  { color: '#385723', bg: '#E2F0D9', dot: '#5B9B36' },
  { color: '#7F6000', bg: '#FFF2CC', dot: '#E6AC00' },
  { color: '#6B6B6B', bg: '#F2F2F2', dot: '#ADADAD' },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  const { locale, toggle } = useLanguage();
  const c: Copy = copy[locale] as Copy;

  const navLinks = [
    { label: c.navIntro,   key: 'intro'   },
    { label: c.navDocs,    key: 'docs'    },
    { label: c.navContact, key: 'contact' },
  ];

  const features: { key: FeatureKey; title: string; body: string }[] = [
    { key: 'feat1', title: c.feat1Title, body: c.feat1Desc },
    { key: 'feat2', title: c.feat2Title, body: c.feat2Desc },
    { key: 'feat3', title: c.feat3Title, body: c.feat3Desc },
    { key: 'feat4', title: c.feat4Title, body: c.feat4Desc },
    { key: 'feat5', title: c.feat5Title, body: c.feat5Desc },
    { key: 'feat6', title: c.feat6Title, body: c.feat6Desc },
  ];

  const steps = [
    { num: c.step1Num, title: c.step1Title, body: c.step1Desc },
    { num: c.step2Num, title: c.step2Title, body: c.step2Desc },
    { num: c.step3Num, title: c.step3Title, body: c.step3Desc },
  ];

  const mockRows = [
    { label: c.mockDone,     IconComp: MOCK_ROW_ICONS[0], style: MOCK_ROW_STYLES[0] },
    { label: c.mockProgress, IconComp: MOCK_ROW_ICONS[1], style: MOCK_ROW_STYLES[1] },
    { label: c.mockLocked,   IconComp: MOCK_ROW_ICONS[2], style: MOCK_ROW_STYLES[2] },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'rgba(250,250,250,0.94)',
          borderColor: '#E9E9E9',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              <Coffee className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: '#C5A880' }} />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              Cacao
            </span>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, key }) => (
              <button
                key={key}
                className="px-3 py-1.5 rounded-md text-[13px] transition-colors duration-100 hover:bg-neutral-100"
                style={{ color: '#6B6B6B' }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-100 hover:bg-neutral-100"
              style={{ color: '#9B9B9B' }}
            >
              {locale === 'vi' ? 'EN' : 'VI'}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-100 hover:bg-neutral-100"
              style={{ color: '#6B6B6B' }}
            >
              {c.navLogin}
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-100"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2F2F2F')}
            >
              {c.btnStart}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Badge */}
        <FadeIn delay={0}>
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-8 text-xs"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', color: '#6B6B6B' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#C5A880' }}
            />
            {c.heroBadge}
          </div>
        </FadeIn>

        {/* Title */}
        <FadeIn delay={0.06}>
          <h1
            className="text-[38px] md:text-[54px] font-semibold leading-tight tracking-tight mb-5 max-w-3xl"
            style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
          >
            {c.heroTitle}
          </h1>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.12}>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
            style={{ color: '#6B6B6B' }}
          >
            {c.heroDesc}
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.16}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-colors duration-100"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2F2F2F')}
            >
              {c.btnStart}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-2.5 rounded-md text-sm font-medium border transition-colors duration-100 hover:bg-[#F1F1EF]"
              style={{ borderColor: '#E5E5E5', color: '#2F2F2F', backgroundColor: '#FFFFFF' }}
            >
              {c.btnLearnMore}
            </button>
          </div>
        </FadeIn>

        {/* Mock workspace preview */}
        <FadeIn delay={0.22}>
          <div
            className="mt-16 w-full max-w-xl rounded-xl border overflow-hidden text-left"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
          >
            {/* URL bar */}
            <div
              className="px-4 py-2.5 border-b flex items-center gap-2.5"
              style={{ borderColor: '#F0F0F0', backgroundColor: '#FBFBFA' }}
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E5E5E5' }} />
                ))}
              </div>
              <span
                className="text-[11px] font-mono"
                style={{ color: '#ADADAD' }}
              >
                {c.mockUrl}
              </span>
            </div>

            {/* Row list */}
            <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
              {mockRows.map(({ label, IconComp, style }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: style.bg }}
                  >
                    <IconComp className="w-3 h-3" strokeWidth={2} style={{ color: style.color }} />
                  </div>
                  <span className="text-[13px]" style={{ color: '#6B6B6B' }}>{label}</span>
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: style.dot }}
                  />
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Core Value Divider + 6-Feature Grid ──────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E9E9E9' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.section1Title}
              </h2>
              <p className="text-sm max-w-lg" style={{ color: '#6B6B6B' }}>
                {c.section1Desc}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <FeatureCard
                key={f.key}
                featureKey={f.key}
                title={f.title}
                body={f.body}
                delay={i * 0.07}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Block ────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E9E9E9', borderBottom: '1px solid #E9E9E9' }}
      >
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <div
              className="w-8 h-px mb-8"
              style={{ backgroundColor: '#C5A880' }}
            />
            <blockquote
              className="text-xl md:text-2xl font-semibold leading-snug mb-5"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.quoteText}
            </blockquote>
            <p className="text-xs font-medium" style={{ color: '#9B9B9B' }}>
              {c.quoteAuthor}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── Three Steps ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left: heading */}
          <FadeIn>
            <div>
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.section2Title}
              </h2>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                {c.section2Desc}
              </p>
            </div>
          </FadeIn>

          {/* Right: step list */}
          <div>
            {steps.map((s, i) => (
              <StepRow
                key={s.num}
                stepIndex={i}
                num={s.num}
                title={s.title}
                body={s.body}
                delay={i * 0.1}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E9E9E9' }}
      >
        <div className="max-w-lg mx-auto text-center">
          <FadeIn>
            <h2
              className="text-2xl md:text-3xl font-semibold mb-3 leading-snug"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.footerTitle}
            </h2>
            <p className="text-sm mb-8" style={{ color: '#6B6B6B' }}>
              {c.footerSubtitle}
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md text-sm font-semibold w-full max-w-xs justify-center transition-colors duration-100"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2F2F2F')}
              >
                {c.footerBtnCreate}
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-[13px] transition-colors duration-100 hover:text-neutral-700"
                style={{ color: '#9B9B9B' }}
              >
                {c.footerHasAccount}
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Page Footer ───────────────────────────────────────────────────── */}
      <footer
        className="border-t py-6 px-6"
        style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + closing */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              <Coffee className="w-3 h-3" strokeWidth={1.5} style={{ color: '#C5A880' }} />
            </div>
            <span className="text-xs" style={{ color: '#9B9B9B' }}>{c.footerClosing}</span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-5">
            {navLinks.map(({ label, key }) => (
              <button
                key={key}
                className="text-xs transition-colors duration-100 hover:text-neutral-600"
                style={{ color: '#ADADAD' }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-[11px]" style={{ color: '#ADADAD' }}>
            Cacao TLMS
          </p>
        </div>
      </footer>
    </div>
  );
}
