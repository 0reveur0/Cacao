'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

const authI18n = {
  vi: {
    loginTitle: 'Đăng nhập vào không gian học tập',
    loginSubtitle: 'Nhập tài khoản Cacao của bạn để tiếp tục.',
    emailLabel: 'Địa chỉ email',
    emailPlaceholder: 'Nhập email của bạn...',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu...',
    btnSubmit: 'Tiếp tục bằng email',
    noAccount: 'Chưa có tài khoản?',
    btnRegister: 'Đăng ký ngay',
    errorInvalid: 'Email hoặc mật khẩu không chính xác, vui lòng thử lại.',
    langSwitch: 'English',
  },
  en: {
    loginTitle: 'Sign in to your workspace',
    loginSubtitle: 'Enter your Cacao account credentials to continue.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email...',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password...',
    btnSubmit: 'Continue with email',
    noAccount: "Don't have an account?",
    btnRegister: 'Sign up now',
    errorInvalid: 'Invalid email or password, please try again.',
    langSwitch: 'Tiếng Việt',
  },
} as const;

export default function LoginPage() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = authI18n[locale];

  const handleToggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(t.errorInvalid);
        setLoading(false);
        return;
      }
      if (data.token) {
        window.localStorage.setItem('cacao_auth_token', data.token);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(t.errorInvalid);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#2F2F2F]">
      <div className="mx-auto flex max-w-3xl flex-col px-6 py-16">
        <div className="flex items-center justify-between rounded-3xl border border-neutral-200 bg-white px-6 py-5">
          <div className="text-sm font-medium">Cacao TLMS</div>
          <button
            type="button"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
            onClick={handleToggleLocale}
          >
            {t.langSwitch}
          </button>
        </div>

        <div className="mt-12 rounded-3xl border border-neutral-200 bg-white px-8 py-10 shadow-none">
          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-medium leading-tight text-[#2F2F2F]">{t.loginTitle}</h1>
            <p className="text-base font-normal leading-7 text-neutral-600">{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-10 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordPlaceholder}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-10 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors duration-100 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white transition-colors duration-100 hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.btnSubmit}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-normal text-neutral-600">
            {t.noAccount}{' '}
            <a href="/register" className="font-medium text-[#2F2F2F] transition-colors duration-100 hover:text-[#2F2F2F]">
              {t.btnRegister}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
