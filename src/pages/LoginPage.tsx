/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Coffee, RefreshCw } from 'lucide-react';

// ─── Exact Translation Dictionary (No Modification) ─────────────────────────────
const authI18n = {
  vi: {
    loginTitle: 'Dang nhap vao khong gian hoc tap',
    loginSubtitle: 'Nhap tai khoan Cacao cua ban de tiep tuc.',
    emailLabel: 'Dia chi email',
    emailPlaceholder: 'Nhap email cua ban...',
    passwordLabel: 'Mat khau',
    passwordPlaceholder: 'Nhap mat khau...',
    btnSubmit: 'Tiep tuc bang email',
    noAccount: 'Chua co tai khoan?',
    btnRegister: 'Dang ky ngay',
    errorInvalid: 'Email hoac mat khau khong chinh xac, vui long thu lai.',
    langSwitch: 'EN',
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
    langSwitch: 'VI',
  },
} as const;

type AuthLocale = 'vi' | 'en';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onNavigateToRegister, onLoginSuccess }: LoginPageProps) {
  const { locale, toggle } = useLanguage();
  const t = (key: string) => (authI18n[locale as AuthLocale] as Record<string, string>)[key] || key;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Native fetch to self-hosted NestJS backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication error
        setError(t('errorInvalid'));
        setLoading(false);
        return;
      }

      // Success - store JWT token if returned (or rely on HTTP-only cookie)
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Redirect to dashboard via callback
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Fallback: navigate to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('errorInvalid'));
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAFA', fontFamily: 'var(--font-body)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-neutral-200"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            <Coffee className="w-4 h-4" style={{ color: '#C5A880' }} strokeWidth={1.5} />
          </div>
          <span
            className="text-sm font-semibold"
            style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
          >
            Cacao
          </span>
        </div>
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 text-xs font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
          style={{ color: '#6B6B6B', backgroundColor: '#FFFFFF' }}
        >
          {t('langSwitch')}
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-7">
            <h1
              className="text-[22px] font-semibold mb-1.5 leading-tight"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              {t('loginTitle')}
            </h1>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-lg border border-neutral-200 p-6"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {error && (
              <div
                className="mb-4 px-3 py-2.5 rounded-md text-sm border"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  borderColor: '#FECACA',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium"
                  style={{ color: '#6B6B6B' }}
                >
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: '#9B9B9B' }}
                    strokeWidth={1.5}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={{
                      backgroundColor: '#FAFAFA',
                      border: '1px solid #E5E5E5',
                      color: '#2F2F2F',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium"
                  style={{ color: '#6B6B6B' }}
                >
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: '#9B9B9B' }}
                    strokeWidth={1.5}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={{
                      backgroundColor: '#FAFAFA',
                      border: '1px solid #E5E5E5',
                      color: '#2F2F2F',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-100 hover:text-[#6B6B6B]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" style={{ color: '#9B9B9B' }} strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-3.5 h-3.5" style={{ color: '#9B9B9B' }} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 mt-1 transition-colors duration-100 hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                    {locale === 'vi' ? 'Dang xu ly...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {t('btnSubmit')}
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Register link */}
          <p className="mt-5 text-center text-sm" style={{ color: '#6B6B6B' }}>
            {t('noAccount')}{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold transition-colors duration-100 hover:text-[#C5A880]"
              style={{ color: '#2F2F2F' }}
            >
              {t('btnRegister')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
