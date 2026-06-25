/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, User, Coffee, ArrowRight, GraduationCap, BookOpen, Shield } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mat khau xac nhan khong khop.');
      return;
    }

    if (password.length < 6) {
      setError('Mat khau phai co it nhat 6 ky tu.');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name, role);

    if (error) {
      setError(error.message || 'Dang ky that bai. Vui long thu lai.');
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
      setError(error.message || 'Dang nhap Google that bai.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#C5A880' }}>
            <Coffee className="w-8 h-8" style={{ color: '#1C120F' }} />
          </div>
          <h1 className="text-2xl font-serif font-semibold mb-4" style={{ color: '#1C120F' }}>
            Dang ky thanh cong!
          </h1>
          <p className="mb-6" style={{ color: '#8E7F73' }}>
            Vui long kiem tra email de xac thuc tai khoan cua ban.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#C5A880', color: '#1C120F' }}
          >
            Quay lai Dang nhap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#FDFBF7' }}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20" style={{ backgroundColor: '#C5A880' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#2B1B17' }} />
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg" style={{ backgroundColor: '#C5A880' }}>
            <Coffee className="w-7 h-7" style={{ color: '#1C120F' }} />
          </div>
          <h1 className="text-2xl font-serif font-semibold" style={{ color: '#1C120F' }}>
            Cacao
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8E7F73' }}>
            Tao tai khoan moi
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1C120F' }}>
                Ho ten
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8E7F73' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyen Van A"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: 'transparent',
                    color: '#1C120F'
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1C120F' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8E7F73' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: 'transparent',
                    color: '#1C120F'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1C120F' }}>
                Mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8E7F73' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: 'transparent',
                    color: '#1C120F'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" style={{ color: '#8E7F73' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: '#8E7F73' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1C120F' }}>
                Xac nhan mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8E7F73' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: 'transparent',
                    color: '#1C120F'
                  }}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: '#1C120F' }}>
                Vai tro
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === 'STUDENT' ? 'border-[#C5A880] bg-[#C5A880]/10' : 'border-transparent bg-[#FDFBF7]'
                  }`}
                  style={{
                    borderWidth: 2,
                    borderColor: role === 'STUDENT' ? '#C5A880' : '#E5DEDB'
                  }}
                >
                  <GraduationCap className="w-6 h-6" style={{ color: role === 'STUDENT' ? '#C5A880' : '#8E7F73' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'STUDENT' ? '#1C120F' : '#8E7F73' }}>
                    Hoc sinh
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === 'TEACHER' ? 'border-[#C5A880] bg-[#C5A880]/10' : 'border-transparent bg-[#FDFBF7]'
                  }`}
                  style={{
                    borderWidth: 2,
                    borderColor: role === 'TEACHER' ? '#C5A880' : '#E5DEDB'
                  }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: role === 'TEACHER' ? '#C5A880' : '#8E7F73' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'TEACHER' ? '#1C120F' : '#8E7F73' }}>
                    Giang vien
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    role === 'ADMIN' ? 'border-[#C5A880] bg-[#C5A880]/10' : 'border-transparent bg-[#FDFBF7]'
                  }`}
                  style={{
                    borderWidth: 2,
                    borderColor: role === 'ADMIN' ? '#C5A880' : '#E5DEDB'
                  }}
                >
                  <Shield className="w-6 h-6" style={{ color: role === 'ADMIN' ? '#C5A880' : '#8E7F73' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'ADMIN' ? '#1C120F' : '#8E7F73' }}>
                    Admin
                  </span>
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: '#C5A880',
                color: '#1C120F'
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Dang ky
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5DEDB' }} />
            <span className="text-sm" style={{ color: '#8E7F73' }}>hoac</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5DEDB' }} />
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90 border"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5DEDB',
              color: '#1C120F'
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Dang ky voi Google
          </button>

          {/* Login Link */}
          <p className="mt-5 text-center text-sm" style={{ color: '#8E7F73' }}>
            Da co tai khoan?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-medium hover:underline"
              style={{ color: '#C5A880' }}
            >
              Dang nhap
            </button>
          </p>
        </div>
      </div>

      <style>{`
        input:focus {
          --tw-ring-color: #C5A880 !important;
          box-shadow: 0 0 0 2px #C5A880 !important;
        }
      `}</style>
    </div>
  );
}
