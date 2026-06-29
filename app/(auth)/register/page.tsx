'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const registerI18n = {
  vi: {
    title: 'Tạo tài khoản mới',
    subtitle: 'Bắt đầu không gian học tập của bạn trong vài bước đơn giản.',
    nameLabel: 'Họ và tên',
    emailLabel: 'Email',
    passwordLabel: 'Mật khẩu',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
    btnSubmit: 'Tạo tài khoản',
    haveAccount: 'Đã có tài khoản?',
    btnLogin: 'Đăng nhập',
    errorMismatch: 'Mật khẩu và xác nhận không khớp.',
    errorSubmit: 'Không thể tạo tài khoản. Vui lòng thử lại.',
    langSwitch: 'English',
  },
  en: {
    title: 'Create a new account',
    subtitle: 'Start your learning workspace in a few simple steps.',
    nameLabel: 'Full name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm password',
    btnSubmit: 'Create account',
    haveAccount: 'Already have an account?',
    btnLogin: 'Sign in',
    errorMismatch: 'Password and confirmation do not match.',
    errorSubmit: 'Unable to create account. Please try again.',
    langSwitch: 'Tiếng Việt',
  },
} as const;

export default function RegisterPage() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = registerI18n[locale];

  const handleToggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(t.errorSubmit);
        setLoading(false);
        return;
      }
      if (data.token) {
        window.localStorage.setItem('cacao_auth_token', data.token);
      }
      router.push('/dashboard');
    } catch {
      setError(t.errorSubmit);
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

        <div className="mt-12 rounded-3xl border border-neutral-200 bg-white px-8 py-10">
          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-medium leading-tight text-[#2F2F2F]">{t.title}</h1>
            <p className="text-base font-normal leading-7 text-neutral-600">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}

            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>{t.nameLabel}</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.nameLabel}
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-10 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                />
              </div>
            </label>

            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>{t.emailLabel}</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.emailLabel}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-10 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                />
              </div>
            </label>

            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>{t.passwordLabel}</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordLabel}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
            </label>

            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>{t.confirmPasswordLabel}</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.5} />
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t.confirmPasswordLabel}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-10 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                />
              </div>
            </label>

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
            {t.haveAccount}{' '}
            <Link href="/login" className="font-medium text-[#2F2F2F] transition-colors duration-100 hover:text-[#2F2F2F]">
              {t.btnLogin}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
