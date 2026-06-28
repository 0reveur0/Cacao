/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent, type CSSProperties, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, BookOpen, Shield } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { signUp, signInWithGoogle } = useAuth();
  const { locale, t, toggle } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('pwMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('pwTooShort'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(t('authRegisterError'));
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(t('authGoogleError'));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <div className="w-full max-w-[400px] text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-5"
            style={{ backgroundColor: '#E2F0D9' }}
          >
            <span className="text-2xl">✓</span>
          </div>
          <h1
            className="text-xl font-semibold mb-2"
            style={{ color: '#2F2F2F' }}
          >
            {t('registerSuccess')}
          </h1>
          <p className="mb-6 text-sm" style={{ color: '#9B9B9B' }}>
            {t('registerSuccessHint')}
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all hover:bg-[#1A1A1A]"
            style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  const ROLES: { value: UserRole; icon: ReactNode; labelKey: 'roleStudent' | 'roleTeacher' | 'roleAdmin' }[] = [
    { value: 'STUDENT', icon: <GraduationCap className="w-5 h-5" />, labelKey: 'roleStudent' },
    { value: 'TEACHER', icon: <BookOpen className="w-5 h-5" />,      labelKey: 'roleTeacher' },
    { value: 'ADMIN',   icon: <Shield className="w-5 h-5" />,        labelKey: 'roleAdmin'   },
  ];

  const inputStyle: CSSProperties = {
    backgroundColor: '#FAFAFA',
    border: '1px solid #E5E5E5',
    color: '#2F2F2F',
    outline: 'none',
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded flex items-center justify-center text-base"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            ☕
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: '#2F2F2F' }}
          >
            Cacao
          </span>
        </div>
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
          style={{ borderColor: '#E5E5E5', color: '#6B6B6B', backgroundColor: '#FFFFFF' }}
        >
          <span>{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          {locale === 'vi' ? 'VI' : 'EN'}
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">

          {/* Header */}
          <div className="mb-7">
            <h1
              className="text-[22px] font-semibold mb-1.5 leading-tight"
              style={{ color: '#2F2F2F' }}
            >
              {t('registerTitle')}
            </h1>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              {t('registerSubtitle')}
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-lg border p-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
          >
            {error && (
              <div
                className="mb-4 px-3 py-2.5 rounded-md text-sm"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {t('yourNameLabel')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('yourNamePh')}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-100 hover:text-[#6B6B6B]"
                  >
                    {showPassword
                      ? <EyeOff className="w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />
                      : <Eye className="w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9B9B9B' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPh')}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm transition-colors duration-100"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#C5A880')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E5E5')}
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: '#6B6B6B' }}>
                  {t('selectRoleLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(({ value, icon, labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-md border transition-colors duration-100"
                      style={{
                        borderColor: role === value ? '#C5A880' : '#E5E5E5',
                        backgroundColor: role === value ? '#FDF6EE' : '#FFFFFF',
                      }}
                    >
                      <span style={{ color: role === value ? '#C5A880' : '#9B9B9B' }}>
                        {icon}
                      </span>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: role === value ? '#2F2F2F' : '#6B6B6B' }}
                      >
                        {t(labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 mt-1 transition-colors duration-100 hover:bg-[#1A1A1A] disabled:opacity-50"
                style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : t('registerBtn')}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E5' }} />
              <span className="text-xs" style={{ color: '#9B9B9B' }}>{t('orDivider')}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E5' }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2.5 transition-colors duration-100 hover:bg-[#F1F1EF] disabled:opacity-50"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                color: '#2F2F2F',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('continueWithGoogle')}
            </button>
          </div>

          {/* Login link */}
          <p className="mt-5 text-center text-sm" style={{ color: '#6B6B6B' }}>
            {t('hasAccount')}{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-semibold transition-colors duration-100 hover:text-[#C5A880]"
              style={{ color: '#2F2F2F' }}
            >
              {t('signInLink')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
