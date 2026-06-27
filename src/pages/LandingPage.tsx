/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

// ─── Local i18n dictionary (Natural, friendly tone) ───────────────────────────────
const copy = {
  vi: {
    // Navbar
    navSignIn:      'Đăng nhập',
    navStart:       'Bắt đầu',

    // Hero badge
    heroBadge:      'Học thấu hiểu, không học vẹt. Không điểm số, không so kè.',

    // Hero headline & subtitle
    heroTitle1:     'Cacao TLMS —',
    heroTitle2:     'Thong thả học, thực chất master.',
    heroSub:        'Không gian học tập bình yên, nơi bạn có thể học theo cách riêng của mình. Không áp lực, không bảng xếp hạng — chỉ có bạn và kiến thức.',

    // Hero CTAs
    ctaPrimary:     'Bắt đầu ngay',
    ctaSecondary:   'Xem giới thiệu',

    // Section — core features
    featHeading:    'Thiết kế cho người học, không phải cho điểm số.',
    featSubheading: 'Mỗi tính năng đều giúp bạn thực sự hiểu bài — không hơn không kém.',

    feat1Icon:  '🧠',
    feat1Title: 'Mastery Learning',
    feat1Body:  'Hoàn thành bài kiểm tra đạt 80% để mở khóa bài tiếp theo. Bạn tự chủ lộ trình, chỉ so sánh với chính mình của hôm qua.',

    feat2Icon:  '📝',
    feat2Title: 'Ghi chú thông minh',
    feat2Body:  'Xem video và ghi chú cùng lúc, tự động bắt mốc thời gian. Ghi chú được lưu ngay khi bạn viết.',

    feat3Icon:  '💬',
    feat3Title: 'Không gian thảo luận',
    feat3Body:  'Góc thảo luận kiểu Notion Docs, có Mentor và AI giúp giải đáp. Mỗi câu hỏi đều được trả lời.',

    feat4Icon:  '🤖',
    feat4Title: 'Phản hồi AI chi tiết',
    feat4Body:  'Sau mỗi bài nộp, nhận phản hồi cụ thể từ AI — không chấm điểm, chỉ chỉ ra điểm mạnh và hướng cải thiện.',

    feat5Icon:  '📋',
    feat5Title: 'Kanban Workspace',
    feat5Body:  'Quản lý bài tập kiểu Kanban: Chưa làm → Đang làm → Chờ chấm → Hoàn thành. Không bỏ sót deadline.',

    feat6Icon:  '⏱️',
    feat6Title: 'Pomodoro Timer',
    feat6Body:  'Bộ đếm thời gian Pomodoro giúp bạn giữ sự tập trung trong mỗi buổi học. Nghỉ đúng lúc, học đúng cách.',

    // Philosophy strip
    philoQuote: '"Không có học sinh chậm — chỉ có hệ thống chưa đủ kiên nhẫn."',
    philoAttr:  '— Cacao TLMS',

    // How it works
    howTitle:   'Học theo cách của bạn, từng bước một.',
    howSub:     'Ba bước đơn giản để bắt đầu.',

    step1Num:   '01',
    step1Title: 'Đăng ký & Chọn lộ trình',
    step1Body:  'Tạo tài khoản trong 30 giây. Chọn vai trò Học sinh hoặc Giảng viên — không gian làm việc sẵn sàng ngay.',

    step2Num:   '02',
    step2Title: 'Học · Ghi chú · Làm bài',
    step2Body:  'Xem video, ghi chú đồng bộ, hoàn thành bài tập trong Kanban. Không deadline áp lực — chỉ có mốc bạn tự đặt.',

    step3Num:   '03',
    step3Title: 'Nhận phản hồi & Tiến bước',
    step3Body:  'AI và Mentor phân tích bài làm, chỉ ra điểm mạnh và hướng cải thiện. Đạt 80%, bài tiếp theo tự mở khóa.',

    // Final CTA
    ctaFinalTitle: 'Bắt đầu hành trình học tập\ncủa bạn hôm nay.',
    ctaFinalSub:   'Miễn phí. Không quảng cáo. Không điểm số phán xét.',
    ctaFinalBtn:   'Tạo tài khoản',
    ctaFinalLink:  'Đã có tài khoản? Đăng nhập',

    // Footer
    footerTagline: 'Thong thả học nhé. ☕',
    footerRight:   'Cacao TLMS',
    footerLinks:   ['Giới thiệu', 'Tài liệu', 'Liên hệ'],
  },

  en: {
    navSignIn:      'Sign in',
    navStart:       'Get started',

    heroBadge:      'Learn deeply, not quickly. No grades, no competition.',

    heroTitle1:     'Cacao TLMS —',
    heroTitle2:     'Learn at your pace, master for real.',
    heroSub:        'A calm learning space where you learn your own way. No pressure, no leaderboards — just you and the knowledge.',

    ctaPrimary:     'Get started',
    ctaSecondary:   'Learn more',

    featHeading:    'Designed for learners, not for grades.',
    featSubheading: 'Every feature helps you truly understand — nothing more, nothing less.',

    feat1Icon:  '🧠',
    feat1Title: 'Mastery Learning',
    feat1Body:  'Score 80% or higher to unlock the next lesson. Own your path, compete only with yesterday\'s version of yourself.',

    feat2Icon:  '📝',
    feat2Title: 'Smart Notes',
    feat2Body:  'Watch videos and take notes with automatic timestamps. Notes sync as you type — no manual saves.',

    feat3Icon:  '💬',
    feat3Title: 'Discussion Space',
    feat3Body:  'A Notion Docs-style discussion board with Mentors and AI for instant answers. Every question gets answered.',

    feat4Icon:  '🤖',
    feat4Title: 'AI Feedback',
    feat4Body:  'After each submission, receive specific AI feedback — no arbitrary scores, just strengths and improvements.',

    feat5Icon:  '📋',
    feat5Title: 'Kanban Workspace',
    feat5Body:  'Manage assignments visually: To Do → In Progress → Under Review → Done. Never miss a deadline.',

    feat6Icon:  '⏱️',
    feat6Title: 'Pomodoro Timer',
    feat6Body:  'An integrated Pomodoro timer keeps you focused during each session. Rest at the right time.',

    philoQuote: '"There are no slow learners — only impatient systems."',
    philoAttr:  '— Cacao TLMS',

    howTitle:   'Learn your way, one step at a time.',
    howSub:     'Three simple steps to begin.',

    step1Num:   '01',
    step1Title: 'Sign up & Choose your path',
    step1Body:  'Create an account in 30 seconds. Choose Student or Teacher — your workspace is ready instantly.',

    step2Num:   '02',
    step2Title: 'Study · Take notes · Complete work',
    step2Body:  'Watch videos, sync notes, complete assignments in Kanban. No stressful deadlines — just milestones you set.',

    step3Num:   '03',
    step3Title: 'Get feedback & Move forward',
    step3Body:  'AI and Mentors analyze your work, highlight strengths and improvements. Hit 80%, and the next lesson unlocks.',

    ctaFinalTitle: 'Start your learning journey\ntoday.',
    ctaFinalSub:   'Free. No ads. No grades to judge you.',
    ctaFinalBtn:   'Create account',
    ctaFinalLink:  'Already have an account? Sign in',

    footerTagline: 'Take your time. Learn well. ☕',
    footerRight:   'Cacao TLMS',
    footerLinks:   ['About', 'Docs', 'Contact'],
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
function FeatureCard({ icon, title, body, delay }: { icon: string; title: string; body: string; delay: number }) {
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
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: '#6B6B6B' }}>
          {body}
        </p>
      </div>
    </FadeIn>
  );
}

// ─── Step row ──────────────────────────────────────────────────────────────────
function StepRow({
  num, title, body, delay,
}: { num: string; title: string; body: string; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="flex gap-5 items-start">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: '#2F2F2F',
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {num}
        </div>
        <div>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
          >
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

  const features = [
    { icon: c.feat1Icon, title: c.feat1Title, body: c.feat1Body },
    { icon: c.feat2Icon, title: c.feat2Title, body: c.feat2Body },
    { icon: c.feat3Icon, title: c.feat3Title, body: c.feat3Body },
    { icon: c.feat4Icon, title: c.feat4Title, body: c.feat4Body },
    { icon: c.feat5Icon, title: c.feat5Title, body: c.feat5Body },
    { icon: c.feat6Icon, title: c.feat6Title, body: c.feat6Body },
  ];

  const steps = [
    { num: c.step1Num, title: c.step1Title, body: c.step1Body },
    { num: c.step2Num, title: c.step2Title, body: c.step2Body },
    { num: c.step3Num, title: c.step3Title, body: c.step3Body },
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

          {/* Right nav */}
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
              className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors hover:bg-neutral-100"
              style={{ color: '#6B6B6B' }}
            >
              {c.navSignIn}
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all hover:bg-[#1A1A1A]"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
            >
              {c.navStart}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <FadeIn delay={0}>
          {/* Badge */}
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
            {c.heroTitle1}
            <br />
            <span style={{ color: '#C5A880' }}>{c.heroTitle2}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
            style={{ color: '#6B6B6B' }}
          >
            {c.heroSub}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToRegister}
              className="px-6 py-3 rounded-md text-sm font-semibold transition-colors duration-100 hover:bg-[#1A1A1A]"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
            >
              {c.ctaPrimary}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 rounded-md text-sm font-medium border transition-colors duration-100 hover:bg-[#F1F1EF]"
              style={{ borderColor: '#E5E5E5', color: '#2F2F2F', backgroundColor: '#FFFFFF' }}
            >
              {c.ctaSecondary}
            </button>
          </div>
        </FadeIn>

        {/* Soft hero divider */}
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
                cacao.tlms / workspace
              </span>
            </div>
            <div className="p-5 text-left space-y-2.5">
              {[
                { icon: '✓', label: locale === 'vi' ? 'Đã xong: TypeScript Fundamentals' : 'Done: TypeScript Fundamentals', color: '#385723', bg: '#E2F0D9' },
                { icon: '⏳', label: locale === 'vi' ? 'Đang làm: Microservices Architecture' : 'In progress: Microservices Architecture', color: '#7F6000', bg: '#FFF2CC' },
                { icon: '🔒', label: locale === 'vi' ? 'Chưa mở: Advanced AI Prompting' : 'Locked: Advanced AI Prompting', color: '#6B6B6B', bg: '#F2F2F2' },
              ].map((row) => (
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

      {/* ── Feature Grid ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.featHeading}
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: '#6B6B6B' }}>
                {c.featSubheading}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy strip ──────────────────────────────────────────────── */}
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
              {c.philoQuote}
            </div>
            <p className="text-xs font-medium" style={{ color: '#9B9B9B' }}>
              {c.philoAttr}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-2"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.howTitle}
              </h2>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                {c.howSub}
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

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E5E5E5' }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <h2
              className="text-2xl md:text-3xl font-semibold mb-3 whitespace-pre-line leading-snug"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.ctaFinalTitle}
            </h2>
            <p className="text-sm mb-8" style={{ color: '#6B6B6B' }}>
              {c.ctaFinalSub}
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onNavigateToRegister}
                className="px-8 py-3 rounded-md text-sm font-semibold transition-colors duration-100 hover:bg-[#1A1A1A] w-full max-w-xs"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              >
                {c.ctaFinalBtn}
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-[13px] transition-colors duration-100 hover:text-[#2F2F2F]"
                style={{ color: '#9B9B9B' }}
              >
                {c.ctaFinalLink}
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
            <span className="text-xs" style={{ color: '#9B9B9B' }}>{c.footerTagline}</span>
          </div>
          <div className="flex items-center gap-5">
            {c.footerLinks.map((link) => (
              <button
                key={link}
                className="text-xs transition-colors duration-100 hover:text-[#6B6B6B]"
                style={{ color: '#9B9B9B' }}
              >
                {link}
              </button>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: '#9B9B9B' }}>
            {c.footerRight}
          </p>
        </div>
      </footer>
    </div>
  );
}
