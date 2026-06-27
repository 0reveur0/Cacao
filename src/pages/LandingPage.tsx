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
    // Navbar
    navSignIn:      'Đăng nhập',
    navStart:       'Bắt đầu ngay',

    // Hero badge
    heroBadge:      'Mastery Learning · Không điểm số · Không bảng xếp hạng',

    // Hero headline & subtitle
    heroTitle1:     'Cacao TLMS —',
    heroTitle2:     'Thoải thả học, thực chất master.',
    heroSub:        'Hệ sinh thái học tập không phân tâm, xây dựng quanh triết lý Mastery Learning. Không lo âu. Không bảng xếp hạng. Chỉ còn bạn và kiến thức.',

    // Hero CTAs
    ctaPrimary:     'Bắt đầu ngay',
    ctaSecondary:   'Xem giới thiệu',

    // Section — core features
    featHeading:    'Thiết kế quanh người học, không phải quanh điểm số.',
    featSubheading: 'Mỗi tính năng đều phục vụ một mục tiêu: giúp bạn thực sự làm chủ kiến thức.',

    feat1Icon:  '🧠',
    feat1Title: 'Mastery Learning',
    feat1Body:  'Hoàn thành bài kiểm tra đạt ≥ 80% để mở khóa bài tiếp theo. Tự chủ lộ trình, không áp lực so kè — chỉ so sánh với chính mình của hôm qua.',

    feat2Icon:  '📝',
    feat2Title: 'Smart Notepad',
    feat2Body:  'Xem video bài giảng kết hợp ghi chú tự động bắt mốc thời gian thông minh. Ghi chú đồng bộ ngay khi bạn viết, không cần lưu thủ công.',

    feat3Icon:  '💬',
    feat3Title: 'Không gian cộng tác',
    feat3Body:  'Góc thảo luận phẳng dạng Notion Docs, có Mentor và AI bổ trợ giải đáp tức thì. Mỗi câu hỏi đều xứng đáng được trả lời.',

    feat4Icon:  '🤖',
    feat4Title: 'AI Diagnostic Feedback',
    feat4Body:  'Sau mỗi bài nộp, nhận phản hồi chẩn đoán chi tiết từ AI — không xét điểm, chỉ chỉ ra điểm mạnh và hướng cải thiện cụ thể.',

    feat5Icon:  '📋',
    feat5Title: 'Kanban Workspace',
    feat5Body:  'Quản lý bài tập trực quan theo kiểu Kanban: Chưa làm → Đang làm → Chờ chấm → Hoàn thành. Không bao giờ bỏ sót deadline.',

    feat6Icon:  '⏱️',
    feat6Title: 'Pomodoro Focus Timer',
    feat6Body:  'Bộ đếm thời gian Pomodoro tích hợp giúp bạn giữ sự tập trung sâu trong mỗi buổi học. Nghỉ đúng giờ, học đúng cách.',

    // Philosophy strip
    philoQuote: '"Không có học sinh ngu — chỉ có hệ thống chưa đủ nhẫn nại."',
    philoAttr:  '— Triết lý Mastery Learning, Cacao TLMS',

    // How it works
    howTitle:   'Học theo cách của bạn, từng bước.',
    howSub:     'Ba bước đơn giản để bắt đầu hành trình làm chủ kiến thức.',

    step1Num:   '01',
    step1Title: 'Đăng ký & Chọn lộ trình',
    step1Body:  'Tạo tài khoản trong vòng 30 giây. Chọn vai trò Học sinh hoặc Giảng viên — hệ thống sẽ chuẩn bị không gian làm việc phù hợp ngay lập tức.',

    step2Num:   '02',
    step2Title: 'Học · Ghi chú · Làm bài',
    step2Body:  'Xem bài giảng video, ghi chú đồng bộ theo mốc thời gian, hoàn thành bài tập trong Kanban workspace. Không deadline gây áp lực — chỉ có mốc bạn tự đặt ra.',

    step3Num:   '03',
    step3Title: 'Nhận phản hồi & Tiến bước',
    step3Body:  'AI và Mentor phân tích bài làm, chỉ ra điểm mạnh và hướng cải thiện. Khi đạt ≥ 80%, bài tiếp theo tự động mở khóa — tiến độ không bao giờ đứng yên.',

    // Final CTA
    ctaFinalTitle: 'Bắt đầu hành trình học tập\ncủa bạn hôm nay.',
    ctaFinalSub:   'Miễn phí. Không có quảng cáo. Không có điểm số phán xét.',
    ctaFinalBtn:   'Tạo tài khoản Cacao',
    ctaFinalLink:  'Đã có tài khoản? Đăng nhập',

    // Footer
    footerTagline: 'Thoải thả học nhé. ☕',
    footerRight:   'Cacao TLMS · Mastery Learning Platform',
    footerLinks:   ['Giới thiệu', 'Tài liệu', 'Liên hệ'],
  },

  en: {
    navSignIn:      'Sign in',
    navStart:       'Get started',

    heroBadge:      'Mastery Learning · No Grades · No Leaderboards',

    heroTitle1:     'Cacao TLMS —',
    heroTitle2:     'Learn at your pace, master for real.',
    heroSub:        'A distraction-free learning ecosystem built around Mastery Learning. No grade anxiety. No leaderboards. Just you and the knowledge.',

    ctaPrimary:     'Get started — free',
    ctaSecondary:   'View overview',

    featHeading:    'Designed around the learner, not the grade.',
    featSubheading: 'Every feature serves one goal: helping you genuinely master the content.',

    feat1Icon:  '🧠',
    feat1Title: 'Mastery Learning',
    feat1Body:  'Score ≥ 80% on each assessment to unlock the next lesson. Own your learning path, compete only with yesterday\'s version of yourself.',

    feat2Icon:  '📝',
    feat2Title: 'Smart Notepad',
    feat2Body:  'Watch video lectures while automatically capturing smart timestamp notes. Notes sync instantly as you type — no manual saves needed.',

    feat3Icon:  '💬',
    feat3Title: 'Collaborative Workspace',
    feat3Body:  'A flat Notion Docs-style discussion board, supported by Mentors and AI for instant clarifications. Every question deserves an answer.',

    feat4Icon:  '🤖',
    feat4Title: 'AI Diagnostic Feedback',
    feat4Body:  'After each submission, receive detailed AI diagnostic feedback — no arbitrary scores, just specific strengths and actionable improvements.',

    feat5Icon:  '📋',
    feat5Title: 'Kanban Workspace',
    feat5Body:  'Manage assignments visually with a Kanban board: To Do → In Progress → Under Review → Completed. Never miss a deadline again.',

    feat6Icon:  '⏱️',
    feat6Title: 'Pomodoro Focus Timer',
    feat6Body:  'An integrated Pomodoro timer keeps you in deep focus during every study session. Rest at the right time, study the right way.',

    philoQuote: '"There are no slow learners — only impatient systems."',
    philoAttr:  '— Mastery Learning Philosophy, Cacao TLMS',

    howTitle:   'Learn your way, one step at a time.',
    howSub:     'Three simple steps to begin your mastery journey.',

    step1Num:   '01',
    step1Title: 'Sign up & Choose your path',
    step1Body:  'Create an account in under 30 seconds. Choose Student or Teacher — your workspace is ready instantly.',

    step2Num:   '02',
    step2Title: 'Study · Take notes · Complete work',
    step2Body:  'Watch lectures, sync timestamp notes, and complete assignments in your Kanban workspace. No stressful deadlines — just milestones you set.',

    step3Num:   '03',
    step3Title: 'Receive feedback & Advance',
    step3Body:  'AI and Mentors analyze your work, highlight strengths and improvements. Hit ≥ 80%, and the next lesson unlocks automatically.',

    ctaFinalTitle: 'Start your learning journey\ntoday.',
    ctaFinalSub:   'Free. No ads. No grades to judge you.',
    ctaFinalBtn:   'Create a Cacao account',
    ctaFinalLink:  'Already have an account? Sign in',

    footerTagline: 'Take your time. Learn well. ☕',
    footerRight:   'Cacao TLMS · Mastery Learning Platform',
    footerLinks:   ['About', 'Docs', 'Contact'],
  },
} as const;

type Copy = typeof copy.vi;

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface LandingPageProps {
  onNavigateToLogin:    () => void;
  onNavigateToRegister: () => void;
}

// ─── Animation wrapper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body, delay }: { icon: string; title: string; body: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div
        className="p-5 rounded-lg border h-full transition-all duration-200 hover:border-neutral-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E9' }}
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
        <p className="text-[13px] leading-relaxed" style={{ color: '#9B9B9B' }}>
          {body}
        </p>
      </div>
    </FadeUp>
  );
}

// ─── Step row ──────────────────────────────────────────────────────────────────
function StepRow({
  num, title, body, delay,
}: { num: string; title: string; body: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
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
          <p className="text-[13px] leading-relaxed" style={{ color: '#9B9B9B' }}>
            {body}
          </p>
        </div>
      </div>
    </FadeUp>
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
        <FadeUp delay={0}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-8 text-xs font-medium"
            style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF', color: '#9B9B9B' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#C5A880' }} />
            {c.heroBadge}
          </div>
        </FadeUp>

        <FadeUp delay={0.07}>
          <h1
            className="text-[42px] md:text-[58px] font-semibold leading-tight tracking-tight mb-5 max-w-3xl"
            style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
          >
            {c.heroTitle1}
            <br />
            <span style={{ color: '#C5A880' }}>{c.heroTitle2}</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.13}>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
            style={{ color: '#9B9B9B' }}
          >
            {c.heroSub}
          </p>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToRegister}
              className="px-6 py-3 rounded-md text-sm font-semibold transition-all hover:bg-[#1A1A1A] active:scale-[0.98]"
              style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
            >
              {c.ctaPrimary}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 rounded-md text-sm font-medium border transition-all hover:bg-[#F1F1EF] active:scale-[0.98]"
              style={{ borderColor: '#E9E9E9', color: '#2F2F2F', backgroundColor: '#FFFFFF' }}
            >
              {c.ctaSecondary}
            </button>
          </div>
        </FadeUp>

        {/* Soft hero divider */}
        <FadeUp delay={0.24}>
          <div
            className="mt-16 w-full max-w-2xl rounded-xl border overflow-hidden"
            style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
          >
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: '#F0F0F0', backgroundColor: '#FBFBFA' }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E9E9E9' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E9E9E9' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E9E9E9' }} />
              <span
                className="ml-3 text-[11px] font-medium"
                style={{ color: '#ADADAD', fontFamily: 'var(--font-body)' }}
              >
                cacao.tlms / workspace
              </span>
            </div>
            <div className="p-5 text-left space-y-2.5">
              {[
                { icon: '✓', label: locale === 'vi' ? 'Hoàn thành: TypeScript Fundamentals' : 'Completed: TypeScript Fundamentals', color: '#385723', bg: '#E2F0D9' },
                { icon: '⏳', label: locale === 'vi' ? 'Đang học: Microservices Architecture' : 'In Progress: Microservices Architecture', color: '#7F6000', bg: '#FFF2CC' },
                { icon: '🔒', label: locale === 'vi' ? 'Chưa mở: Advanced AI Prompting' : 'Locked: Advanced AI Prompting', color: '#9B9B9B', bg: '#F2F2F2' },
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
        </FadeUp>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.featHeading}
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: '#9B9B9B' }}>
                {c.featSubheading}
              </p>
            </div>
          </FadeUp>

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
        style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #F0F0F0' }}
      >
        <FadeUp>
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-block text-2xl md:text-3xl font-semibold italic leading-snug mb-4"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.philoQuote}
            </div>
            <p className="text-xs font-medium" style={{ color: '#ADADAD' }}>
              {c.philoAttr}
            </p>
          </div>
        </FadeUp>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="mb-12">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-2"
                style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
              >
                {c.howTitle}
              </h2>
              <p className="text-sm" style={{ color: '#9B9B9B' }}>
                {c.howSub}
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <StepRow key={s.num} num={s.num} title={s.title} body={s.body} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeUp>
            <h2
              className="text-2xl md:text-3xl font-semibold mb-3 whitespace-pre-line leading-snug"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {c.ctaFinalTitle}
            </h2>
            <p className="text-sm mb-8" style={{ color: '#9B9B9B' }}>
              {c.ctaFinalSub}
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onNavigateToRegister}
                className="px-8 py-3 rounded-md text-sm font-semibold transition-all hover:bg-[#1A1A1A] w-full max-w-xs active:scale-[0.98]"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              >
                {c.ctaFinalBtn}
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-[13px] transition-colors hover:underline"
                style={{ color: '#9B9B9B' }}
              >
                {c.ctaFinalLink}
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-6 px-6"
        style={{ borderColor: '#E9E9E9', backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-xs"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              ☕
            </div>
            <span className="text-xs" style={{ color: '#ADADAD' }}>{c.footerTagline}</span>
          </div>
          <div className="flex items-center gap-5">
            {c.footerLinks.map((link) => (
              <button
                key={link}
                className="text-xs transition-colors hover:text-neutral-500"
                style={{ color: '#CBCBCB' }}
              >
                {link}
              </button>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: '#CBCBCB' }}>
            {c.footerRight}
          </p>
        </div>
      </footer>
    </div>
  );
}
