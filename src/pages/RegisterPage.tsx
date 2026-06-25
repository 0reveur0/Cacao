/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, BookOpen, Shield } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#F5EBE0' }}>
            <span className="text-2xl">☕</span>
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#2F2F2F' }}>
            Dang ky thanh cong!
          </h1>
          <p className="mb-5 text-sm" style={{ color: '#6B6B6B' }}>
            Vui long kiem tra email de xac thuc tai khoan.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 hover:opacity-90"
            style={{ backgroundColor: '#2F2F2F', color: '#FFFFFF' }}
          >
            Quay lai Dang nhap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3" style={{ backgroundColor: '#F5EBE0' }}>
            <span className="text-xl">☕</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#2F2F2F' }}>
            Cacao
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: '#6B6B6B' }}>
            Tao tai khoan moi
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="px-3 py-2 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Ho ten
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9B9B9B' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyen Van A"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    color: '#2F2F2F'
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9B9B9B' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    color: '#2F2F2F'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9B9B9B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2 rounded-md text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    color: '#2F2F2F'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: '#9B9B9B' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: '#9B9B9B' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Xac nhan mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9B9B9B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    color: '#2F2F2F'
                  }}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: '#2F2F2F' }}>
                Vai tro
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-md border transition-all duration-100"
                  style={{
                    borderColor: role === 'STUDENT' ? '#F5EBE0' : '#E5E5E5',
                    backgroundColor: role === 'STUDENT' ? '#F5EBE0' : '#FFFFFF'
                  }}
                >
                  <GraduationCap className="w-5 h-5" style={{ color: role === 'STUDENT' ? '#C5A880' : '#9B9B9B' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'STUDENT' ? '#2F2F2F' : '#6B6B6B' }}>
                    Hoc sinh
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-md border transition-all duration-100"
                  style={{
                    borderColor: role === 'TEACHER' ? '#F5EBE0' : '#E5E5E5',
                    backgroundColor: role === 'TEACHER' ? '#F5EBE0' : '#FFFFFF'
                  }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: role === 'TEACHER' ? '#C5A880' : '#9B9B9B' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'TEACHER' ? '#2F2F2F' : '#6B6B6B' }}>
                    Giang vien
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-md border transition-all duration-100"
                  style={{
                    borderColor: role === 'ADMIN' ? '#F5EBE0' : '#E5E5E5',
                    backgroundColor: role === 'ADMIN' ? '#F5EBE0' : '#FFFFFF'
                  }}
                >
                  <Shield className="w-5 h-5" style={{ color: role === 'ADMIN' ? '#C5A880' : '#9B9B9B' }} />
                  <span className="text-xs font-medium" style={{ color: role === 'ADMIN' ? '#2F2F2F' : '#6B6B6B' }}>
                    Admin
                  </span>
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: '#2F2F2F',
                color: '#FFFFFF'
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                'Dang ky'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E5' }} />
            <span className="text-xs" style={{ color: '#9B9B9B' }}>hoac</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E5' }} />
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 hover:bg-gray-50"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              color: '#2F2F2F'
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Tiep tuc voi Google
          </button>

          {/* Login Link */}
          <p className="mt-4 text-center text-sm" style={{ color: '#6B6B6B' }}>
            Da co tai khoan?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-medium hover:underline"
              style={{ color: '#2F2F2F' }}
            >
              Dang nhap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
