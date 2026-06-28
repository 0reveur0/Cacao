/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

// ─── Local i18n dictionary ─────────────────────────────────────────────────────
const copy = {
  vi: {
    // Top Navigation Bar
    navIntro:   'Giới thiệu',
    navDocs:    'Tài liệu',
    navContact: 'Liên hệ',
    navLogin:   'Đăng nhập',

    // Hero Section
    heroBadge:    'Học thấu hiểu, không học vẹt. Không điểm số, không so kè.',
    heroTitle:    'Cacao TLMS — Thong thả học, thực chất master.',
    heroDesc:     'Không gian học tập bình yên, nơi bạn có thể học theo cách riêng của mình. Không áp lực, không bảng xếp hạng — chỉ có bạn và kiến thức.',
    btnStart:     'Bắt đầu ngay',
    btnLearnMore: 'Xem giới thiệu',

    // Mock Live Database Sheet Preview
    mockUrl:      'cacao.tlms / workspace',
    mockDone:     'Đã xong: TypeScript Fundamentals',
    mockProgress: 'Đang làm: Microservices Architecture',
    mockLocked:   'Chưa mở: Advanced AI Prompting',

    // Core Value Divider
    section1Title: 'Thiết kế cho người học, không phải cho điểm số.',
    section1Desc:  'Mỗi tính năng đều giúp bạn thực sự hiểu bài — không hơn không kém.',

    // 6-Grid Feature Section
    feat1Title: '🧠 Mastery Learning',
    feat1Desc:  'Hoàn thành bài kiểm tra đạt 80% để mở khóa bài tiếp theo. Bạn tự chủ lộ trình, chỉ so sánh với chính mình của hôm qua.',

    feat2Title: '📝 Ghi chú thông minh',
    feat2Desc:  'Xem video và ghi chú cùng lúc, tự động bắt mốc thời gian. Ghi chú được lưu ngay khi bạn viết.',

    feat3Title: '💬 Không gian thảo luận',
    feat3Desc:  'Góc thảo luận kiểu Notion Docs, có Mentor và AI giúp giải đáp. Mỗi câu hỏi đều được trả lời.',

    feat4Title: '🤖 Phản hồi AI chi tiết',
    feat4Desc:  'Sau mỗi bài nộp, nhận phản hồi cụ thể từ AI — không chấm điểm, chỉ chỉ ra điểm mạnh và hướng cải thiện.',

    feat5Title: '📋 Kanban Workspace',
    feat5Desc:  'Quản lý bài tập kiểu Kanban: Chưa làm → Đang làm → Chờ chấm → Hoàn thành. Không bỏ sót deadline.',

    feat6Title: '⏱️ Pomodoro Timer',
    feat6Desc:  'Bộ đếm thời gian Pomodoro giúp bạn giữ sự tập trung trong mỗi buổi học. Nghỉ đúng lúc, học đúng cách.',

    // Quote Block
    quoteText:   '"Không có học sinh chậm — chỉ có hệ thống chưa đủ kiên nhẫn."',
    quoteAuthor: '— Cacao TLMS',

    // Three Steps Section
    section2Title: 'Học theo cách của bạn, từng bước một.',
    section2Desc:  'Ba bước đơn giản để bắt đầu.',

    step1Num:   '01',
    step1Title: 'Đăng ký & Chọn lộ trình',
    step1Desc:  'Tạo tài khoản trong 30 giây. Chọn vai trò Học sinh hoặc Giảng viên — không gian làm việc sẵn sàng ngay.',

    step2Num:   '02',
    step2Title: 'Học · Ghi chú · Làm bài',
    step2Desc:  'Xem video, ghi chú đồng bộ, hoàn thành bài tập trong Kanban. Không deadline áp lực — chỉ có mốc bạn tự đặt.',

    step3Num:   '03',
    step3Title: 'Nhận phản hồi & Tiến bước',
    step3Desc:  'AI và Mentor phân tích bài làm, chỉ ra điểm mạnh và hướng cải thiện. Đạt 80%, bài tiếp theo tự mở khóa.',

    // Bottom CTA Footer Area
    footerTitle:      'Bắt đầu hành trình học tập của bạn hôm nay.',
    footerSubtitle:   'Miễn phí. Không quảng cáo. Không điểm số phán xét.',
    footerBtnCreate:  'Tạo tài khoản',
    footerHasAccount: 'Đã có tài khoản? Đăng nhập',
    footerClosing:    '☕ Thong thả học nhé. ☕',
  },

  en: {
    // Top Navigation Bar
    navIntro:   'About',
    navDocs:    'Docs',
    navContact: 'Contact',
    navLogin:   'Login',

    // Hero Section
    heroBadge:    'Deep understanding over rote learning. No grades, no competition.',
    heroTitle:    'Cacao TLMS — Learn at your pace, master the core.',
    heroDesc:     'A peaceful learning workspace designed for your own path. No pressure, no leaderboards — just you and knowledge.',
    btnStart:     'Get Started',
    btnLearnMore: 'Introduction',

    // Mock Live Database Sheet Preview
    mockUrl:      'cacao.tlms / workspace',
    mockDone:     'Done: TypeScript Fundamentals',
    mockProgress: 'In Progress: Microservices Architecture',
    mockLocked:   'Locked: Advanced AI Prompting',

    // Core Value Divider
    section1Title: 'Designed for learners, not for scores.',
    section1Desc:  'Every feature serves one purpose: to help you truly understand.',

    // 6-Grid Feature Section
    feat1Title: '🧠 Mastery Learning',
    feat1Desc:  'Score 80% or higher on the quiz to unlock the next block. Own your roadmap and only compete with yourself.',

    feat2Title: '📝 Smart Notes',
    feat2Desc:  'Watch lectures and take notes simultaneously with auto-timestamps. Your notes are saved as you type.',

    feat3Title: '💬 Discussion Board',
    feat3Desc:  'A Notion-style discussion workspace with Mentor and AI support. Every question gets answered.',

    feat4Title: '🤖 Detailed AI Feedback',
    feat4Desc:  'Get actionable text breakdowns from AI after every submission. No grading, just clear ways to improve.',

    feat5Title: '📋 Kanban Workspace',
    feat5Desc:  'Manage tasks with a clear Kanban flow: To Do → Doing → Under Review → Done. Never miss a deadline.',

    feat6Title: '⏱️ Pomodoro Timer',
    feat6Desc:  'An embedded Pomodoro tracker to keep you in the zone. Take breaks naturally, study efficiently.',

    // Quote Block
    quoteText:   '"There are no slow students — only systems lacking patience."',
    quoteAuthor: '— Cacao TLMS',

    // Three Steps Section
    section2Title: 'Your learning, one step at a time.',
    section2Desc:  'Three simple steps to start.',

    step1Num:   '01',
    step1Title: 'Sign Up & Choose Path',
    step1Desc:  'Create an account in 30 seconds. Choose Student or Instructor role — your workspace is instantly ready.',

    step2Num:   '02',
    step2Title: 'Learn · Note · Submit',
    step2Desc:  'Watch videos, sync your notes, and track assignments on Kanban. No stressful deadlines — just your goals.',

    step3Num:   '03',
    step3Title: 'Feedback & Advance',
    step3Desc:  'AI and Mentors break down your work. Hit 80% accuracy to unlock the next lesson automatically.',

    // Bottom CTA Footer Area
    footerTitle:      'Start your learning journey today.',
    footerSubtitle:   'Free. No ads. No judgmental grading.',
    footerBtnCreate:  'Create Account',
    footerHasAccount: 'Already have an account? Log in',
    footerClosing:    '☕ Take your time. ☕',
  },
} as const;

type Copy = typeof copy.vi;

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onNavigateToLogin:    () => void;
  onNavigateToRegister: () => void;
}

// ─── Simple fade animation (calm, Notion-style) ───────────────────────────────
function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ title, body, delay }: { title: string; body: string; delay: number }) {
  // title carries the emoji prefix per spec (e.g. "🧠 Mastery Learning")
  const spaceIdx = title.indexOf(' ');
  const icon  = spaceIdx > -1 ? title.slice(0, spaceIdx) : '';
  const label = spaceIdx > -1 ? title.slice(spaceIdx + 1) : title;

  return (
    <FadeIn delay={delay}>
      <div
        className="p-5 rounded-lg border h-full transition-colors duration-100 hover:bg-[#F1F1EF]"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
      >
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-lg mb-3 flex-shrink-0"
          style={{ backgroundColor: '#F5EBE0' }}
        >
          {icon}
        </div>
        <h3
          className="text-sm font-semibold mb-1.5"
          style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
        >
          {label}
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: '#6B6B6B' }}>
          {body}
        </p>
      </div>
    </FadeIn>
  );
}

// ─── Step row ──────────────────────────────────────────────────────────────────
function StepRow({ num, title, body, delay }: { num: string; title: string; body: string; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="flex gap-5 items-start">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}
        >
          {num}
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}>
            {title}
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: '#6B6B6B' }}>
            {body}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  const { locale, toggle } = useLanguage();
  const c: Copy = copy[locale] as Copy;

  const features: { title: string; body: string }[] = [
    { title: c.feat1Title, body: c.feat1Desc },
    { title: c.feat2Title, body: c.feat2Desc },
    { title: c.feat3Title, body: c.feat3Desc },
    { title: c.feat4Title, body: c.feat4Desc },
    { title: c.feat5Title, body: c.feat5Desc },
    { title: c.feat6Title, body: c.feat6Desc },
  ];

  const steps = [
    { num: c.step1Num, title: c.step1Title, body: c.step1Desc },
    { num: c.step2Num, title: c.step2Title, body: c.step2Desc },
    { num: c.step3Num, title: c.step3Title, body: c.step3Desc },
  ];

  const navLinks = [
    { label: c.navIntro,   key: 'intro'   },
    { label: c.navDocs,    key: 'docs'    },
    { label: c.navContact, key: 'contact' },
  ];

  const mockRows = [
    { icon: '✓',  label: c.mockDone,     color: '#385723', bg: '#E2F0D9' },
    { icon: '⏳', label: c.mockProgress,  color: '#7F6000', bg: '#FFF2CC' },
    { icon: '🔒', label: c.mockLocked,   color: '#6B6B6B', bg: '#F2F2F2' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: 'rgba(250,250,250,0.92)', borderColor: '#E9E9E9', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-base"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              ☕
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              Cacao
            </span>
          </div>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-1">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-neutral-100"
              style={{ color: '#9B9B9B' }}
            >
              <span>{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
              {locale === 'vi' ? 'VI' : 'EN'}
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
              className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-100 hover:bg-[#1A1A1A]"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
            >
              {c.btnStart}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <FadeIn delay={0}>
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-8 text-xs font-medium"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', color: '#6B6B6B' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#C5A880' }} />
            {c.heroBadge}
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1
            className="text-[42px] md:text-[58px] font-semibold leading-tight tracking-tight mb-5 max-w-3xl"
            style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
          >
            {c.heroTitle}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
            style={{ color: '#6B6B6B' }}
          >
            {c.heroDesc}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToRegister}
              className="px-6 py-3 rounded-md text-sm font-semibold transition-colors duration-100 hover:bg-[#1A1A1A]"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
            >
              {c.btnStart}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 rounded-md text-sm font-medium border transition-colors duration-100 hover:bg-[#F1F1EF]"
              style={{ borderColor: '#E5E5E5', color: '#2F2F2F', backgroundColor: '#FFFFFF' }}
            >
              {c.btnLearnMore}
            </button>
          </div>
        </FadeIn>

        {/* Mock workspace preview */}
        <FadeIn delay={0.2}>
          <div
            className="mt-16 w-full max-w-2xl rounded-xl border overflow-hidden"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
          >
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: '#F0F0F0', backgroundColor: '#FBFBFA' }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E5E5E5' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E5E5E5' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E5E5E5' }} />
              <span
                className="ml-3 text-[11px] font-medium"
                style={{ color: '#9B9B9B', fontFamily: 'var(--font-body)' }}
              >
                {c.mockUrl}
              </span>
            </div>
            <div className="p-5 text-left space-y-2.5">
              {mockRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: row.bg, color: row.color }}
                  >
                    {row.icon}
                  </span>
                  <span className="text-[13px]" style={{ color: '#6B6B6B' }}>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Core Value Divider ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.section1Title}
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: '#6B6B6B' }}>
                {c.section1Desc}
              </p>
            </div>
          </FadeIn>

          {/* 6-Grid Feature Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} title={f.title} body={f.body} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Block ────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}
      >
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-block text-2xl md:text-3xl font-semibold italic leading-snug mb-4"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.quoteText}
            </div>
            <p className="text-xs font-medium" style={{ color: '#9B9B9B' }}>
              {c.quoteAuthor}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── Three Steps Section ────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-2"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.section2Title}
              </h2>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                {c.section2Desc}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <StepRow key={s.num} num={s.num} title={s.title} body={s.body} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Footer Area ─────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E5E5E5' }}>
        <div className="max-w-xl mx-auto text-center">
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
                className="px-8 py-3 rounded-md text-sm font-semibold transition-colors duration-100 hover:bg-[#1A1A1A] w-full max-w-xs"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              >
                {c.footerBtnCreate}
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-[13px] transition-colors duration-100 hover:text-[#2F2F2F]"
                style={{ color: '#9B9B9B' }}
              >
                {c.footerHasAccount}
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-6 px-6"
        style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-xs"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              ☕
            </div>
            <span className="text-xs" style={{ color: '#9B9B9B' }}>{c.footerClosing}</span>
          </div>
          <div className="flex items-center gap-5">
            {navLinks.map(({ label, key }) => (
              <button
                key={key}
                className="text-xs transition-colors duration-100 hover:text-[#6B6B6B]"
                style={{ color: '#9B9B9B' }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: '#9B9B9B' }}>
            Cacao TLMS
          </p>
        </div>
      </footer>
    </div>
  );
}
