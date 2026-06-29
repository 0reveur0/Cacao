'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Star,
  ChevronRight,
} from 'lucide-react';

const landingTranslations = {
  vi: {
    navIntro: 'Giới thiệu',
    navDocs: 'Tài liệu',
    navContact: 'Liên hệ',
    navLogin: 'Đăng nhập',
    heroBadge: 'Học thấu hiểu, không học vẹt. Không điểm số, không so kè.',
    heroTitle: 'Cacao TLMS — Thong thả học, thực chất master.',
    heroDesc: 'Không gian học tập bình yên, nơi bạn có thể học theo cách riêng của mình. Không áp lực, không bảng xếp hạng — chỉ có bạn và kiến thức.',
    btnStart: 'Bắt đầu ngay',
    btnLearnMore: 'Xem giới thiệu',
    mockUrl: 'cacao.tlms / workspace',
    mockDone: 'Đã xong: TypeScript Fundamentals',
    mockProgress: 'Đang làm: Microservices Architecture',
    mockLocked: 'Chưa mở: Advanced AI Prompting',
    section1Title: 'Thiết kế cho người học, không phải cho điểm số.',
    section1Desc: 'Mỗi tính năng đều giúp bạn thực sự hiểu bài — không hơn không kém.',
    feat1Title: 'Mastery Learning',
    feat1Desc: 'Hoàn thành bài kiểm tra đạt 80% để mở khóa bài tiếp theo. Bạn tự chủ lộ trình, chỉ so sánh với chính mình của hôm qua.',
    feat2Title: 'Ghi chú thông minh',
    feat2Desc: 'Xem video và ghi chú cùng lúc, tự động bắt mốc thời gian. Ghi chú được lưu ngay khi bạn viết.',
    feat3Title: 'Không gian thảo luận',
    feat3Desc: 'Góc thảo luận kiểu Notion Docs, có Mentor và AI giúp giải đáp. Mỗi câu hỏi đều được trả lời.',
    feat4Title: 'Phản hồi AI chi tiết',
    feat4Desc: 'Sau mỗi bài nộp, nhận phản hồi cụ thể từ AI — không chấm điểm, chỉ chỉ ra điểm mạnh và hướng cải thiện.',
    feat5Title: 'Kanban Workspace',
    feat5Desc: 'Quản lý bài tập kiểu Kanban: Chưa làm → Đang làm → Chờ chấm → Hoàn thành. Không bỏ sót deadline.',
    feat6Title: 'Pomodoro Timer',
    feat6Desc: 'Bộ đếm thời gian Pomodoro giúp bạn giữ sự tập trung trong mỗi buổi học. Nghỉ đúng lúc, học đúng cách.',
    quoteText: '“Không có học sinh chậm — chỉ có hệ thống chưa đủ kiên nhẫn.”',
    quoteAuthor: '— Cacao TLMS',
    section2Title: 'Học theo cách của bạn, từng bước một.',
    section2Desc: 'Ba bước đơn giản để bắt đầu.',
    step1Num: '01',
    step1Title: 'Đăng ký & Chọn lộ trình',
    step1Desc: 'Tạo tài khoản trong 30 giây. Chọn vai trò Học sinh hoặc Giảng viên — không gian làm việc sẵn sàng ngay.',
    step2Num: '02',
    step2Title: 'Học · Ghi chú · Làm bài',
    step2Desc: 'Xem video, ghi chú đồng bộ, hoàn thành bài tập trong Kanban. Không deadline áp lực — chỉ có mốc bạn tự đặt.',
    step3Num: '03',
    step3Title: 'Nhận phản hồi & Tiến bước',
    step3Desc: 'AI và Mentor phân tích bài làm, chỉ ra điểm mạnh và hướng cải thiện. Đạt 80%, bài tiếp theo tự mở khóa.',
    footerTitle: 'Bắt đầu hành trình học tập của bạn hôm nay.',
    footerSubtitle: 'Miễn phí. Không quảng cáo. Không điểm số phán xét.',
    footerBtnCreate: 'Tạo tài khoản',
    footerHasAccount: 'Đã có tài khoản? Đăng nhập',
    footerClosing: 'Thong thả học nhé.',
  },
  en: {
    navIntro: 'About',
    navDocs: 'Docs',
    navContact: 'Contact',
    navLogin: 'Login',
    heroBadge: 'Deep understanding over rote learning. No grades, no competition.',
    heroTitle: 'Cacao TLMS — Learn at your pace, master the core.',
    heroDesc: 'A peaceful learning workspace designed for your own path. No pressure, no leaderboards — just you and knowledge.',
    btnStart: 'Get Started',
    btnLearnMore: 'Introduction',
    mockUrl: 'cacao.tlms / workspace',
    mockDone: 'Done: TypeScript Fundamentals',
    mockProgress: 'In Progress: Microservices Architecture',
    mockLocked: 'Locked: Advanced AI Prompting',
    section1Title: 'Designed for learners, not for scores.',
    section1Desc: 'Every feature serves one purpose: to help you truly understand.',
    feat1Title: 'Mastery Learning',
    feat1Desc: 'Score 80% or higher on the quiz to unlock the next block. Own your roadmap and only compete with yourself.',
    feat2Title: 'Smart Notes',
    feat2Desc: 'Watch lectures and take notes simultaneously with auto-timestamps. Your notes are saved as you type.',
    feat3Title: 'Discussion Board',
    feat3Desc: 'A Notion-style discussion workspace with Mentor and AI support. Every question gets answered.',
    feat4Title: 'Detailed AI Feedback',
    feat4Desc: 'Get actionable text breakdowns from AI after every submission. No grading, just clear ways to improve.',
    feat5Title: 'Kanban Workspace',
    feat5Desc: 'Manage tasks with a clear Kanban flow: To Do → Doing → Under Review → Done. Never miss a deadline.',
    feat6Title: 'Pomodoro Timer',
    feat6Desc: 'An embedded Pomodoro tracker to keep you in the zone. Take breaks naturally, study efficiently.',
    quoteText: '“There are no slow students — only systems lacking patience.”',
    quoteAuthor: '— Cacao TLMS',
    section2Title: 'Your learning, one step at a time.',
    section2Desc: 'Three simple steps to start.',
    step1Num: '01',
    step1Title: 'Sign Up & Choose Path',
    step1Desc: 'Create an account in 30 seconds. Choose Student or Instructor role — your workspace is instantly ready.',
    step2Num: '02',
    step2Title: 'Learn · Note · Submit',
    step2Desc: 'Watch videos, sync your notes, and track assignments on Kanban. No stressful deadlines — just your goals.',
    step3Num: '03',
    step3Title: 'Feedback & Advance',
    step3Desc: 'AI and Mentors break down your work. Hit 80% accuracy to unlock the next lesson automatically.',
    footerTitle: 'Start your learning journey today.',
    footerSubtitle: 'Free. No ads. No judgmental grading.',
    footerBtnCreate: 'Create Account',
    footerHasAccount: 'Already have an account? Log in',
    footerClosing: 'Take your time.',
  },
} as const;

type LandingKey = keyof typeof landingTranslations['vi'];

type LandingTranslation = typeof landingTranslations['vi'];

const FEATURES: Array<{ icon: typeof Shield; titleKey: LandingKey; descKey: LandingKey }> = [
  { icon: Shield, titleKey: 'feat1Title', descKey: 'feat1Desc' },
  { icon: BookOpen, titleKey: 'feat2Title', descKey: 'feat2Desc' },
  { icon: MessageSquare, titleKey: 'feat3Title', descKey: 'feat3Desc' },
  { icon: Star, titleKey: 'feat4Title', descKey: 'feat4Desc' },
  { icon: ClipboardList, titleKey: 'feat5Title', descKey: 'feat5Desc' },
  { icon: Clock, titleKey: 'feat6Title', descKey: 'feat6Desc' },
];

export default function HomePage() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const t = landingTranslations[locale] as LandingTranslation;

  useEffect(() => {
    const saved = window.localStorage.getItem('cacao_tlms_locale');
    if (saved === 'en' || saved === 'vi') {
      setLocale(saved);
    }
  }, []);

  const toggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
    window.localStorage.setItem('cacao_tlms_locale', next);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2F2F2F]">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-sm font-medium">Cacao TLMS</div>
          <div className="flex items-center gap-3 text-sm font-normal text-neutral-600">
            <button className="transition-colors duration-100 hover:text-neutral-900" type="button">
              {t.navIntro}
            </button>
            <button className="transition-colors duration-100 hover:text-neutral-900" type="button">
              {t.navDocs}
            </button>
            <button className="transition-colors duration-100 hover:text-neutral-900" type="button">
              {t.navContact}
            </button>
            <button
              className="rounded-md border border-neutral-200 px-3 py-2 font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
              onClick={toggleLocale}
              type="button"
            >
              {locale === 'vi' ? 'English' : 'Tiếng Việt'}
            </button>
            <button className="rounded-md border border-neutral-200 px-3 py-2 font-medium transition-colors duration-100 hover:bg-[#F1F1EF]" type="button">
              {t.navLogin}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-neutral-200 bg-[#FFFFFF] px-4 py-2 text-xs font-medium text-neutral-600">
              {t.heroBadge}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] text-[#232323] md:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-2xl text-base font-normal leading-7 text-neutral-600 md:text-lg">
                {t.heroDesc}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-md bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white transition-colors duration-100 hover:bg-[#1F1F1F]" type="button">
                {t.btnStart}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button className="rounded-md border border-neutral-200 px-5 py-3 text-sm font-medium transition-colors duration-100 hover:bg-[#F1F1EF]" type="button">
                {t.btnLearnMore}
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">{t.mockUrl}</div>
            <div className="space-y-3 rounded-3xl border border-neutral-200 bg-[#FAFAFA] p-4">
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className="text-sm font-medium text-neutral-900">{t.mockDone}</div>
                <div className="mt-1 h-2 rounded-full bg-neutral-200" />
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className="text-sm font-medium text-neutral-900">{t.mockProgress}</div>
                <div className="mt-1 h-2 rounded-full bg-[#FFF2CC]" />
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className="text-sm font-medium text-neutral-900">{t.mockLocked}</div>
                <div className="mt-1 h-2 rounded-full bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_0.9fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8">
            <h2 className="text-xl font-medium text-[#2F2F2F]">{t.section1Title}</h2>
            <p className="mt-3 text-base font-normal leading-7 text-neutral-600">{t.section1Desc}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.titleKey} className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-5">
                  <feature.icon className="h-5 w-5 text-[#2F2F2F]" strokeWidth={1.5} />
                  <h3 className="mt-4 text-base font-medium text-[#2F2F2F]">{t[feature.titleKey]}</h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-neutral-600">{t[feature.descKey]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-8">
            <div className="space-y-6">
              <div className="rounded-3xl border border-neutral-200 bg-[#FAFAFA] p-6">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">Quote</p>
                <p className="mt-4 text-xl font-medium leading-8 text-[#2F2F2F]">{t.quoteText}</p>
                <p className="mt-4 text-sm font-normal text-neutral-600">{t.quoteAuthor}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#2F2F2F]">{t.section2Title}</h3>
                <p className="text-sm font-normal leading-7 text-neutral-600">{t.section2Desc}</p>
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => {
                    const stepKey = `step${index}Num` as keyof typeof t;
                    const stepTitle = `step${index}Title` as keyof typeof t;
                    const stepDesc = `step${index}Desc` as keyof typeof t;
                    return (
                      <div key={stepKey} className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-[#2F2F2F]">
                            {t[stepKey]}
                          </div>
                          <h4 className="text-base font-medium text-[#2F2F2F]">{t[stepTitle]}</h4>
                        </div>
                        <p className="mt-3 text-sm font-normal leading-6 text-neutral-600">{t[stepDesc]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-2xl font-medium text-[#2F2F2F]">{t.footerTitle}</h2>
          <p className="mt-3 text-base font-normal leading-7 text-neutral-600">{t.footerSubtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="rounded-md bg-[#2F2F2F] px-6 py-3 text-sm font-medium text-white transition-colors duration-100 hover:bg-[#1F1F1F]" type="button">
              {t.footerBtnCreate}
            </button>
            <button className="text-sm font-medium text-neutral-700 transition-colors duration-100 hover:text-neutral-900" type="button">
              {t.footerHasAccount}
            </button>
          </div>
          <p className="mt-8 text-sm font-normal text-neutral-500">{t.footerClosing}</p>
        </div>
      </footer>
    </main>
  );
}
