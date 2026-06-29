'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Globe, Lock, User } from 'lucide-react';

const settingsI18n = {
  vi: {
    pageTitle: 'Cài đặt tài khoản',
    pageSubtitle: 'Quản lý thông tin cá nhân và tùy chỉnh không gian làm việc của bạn.',
    sectionProfile: 'Thông tin cá nhân',
    labelName: 'Họ và tên',
    labelEmail: 'Địa chỉ email',
    sectionLanguage: 'Ngôn ngữ hệ thống',
    langDesc: 'Chọn ngôn ngữ hiển thị mặc định cho toàn bộ giao diện.',
    btnSave: 'Lưu thay đổi',
    btnLoggingOut: 'Đăng xuất tài khoản',
    msgSuccess: 'Cập nhật cài đặt thành công.',
    msgError: 'Có lỗi xảy ra, vui lòng thử lại sau.',
  },
  en: {
    pageTitle: 'Account Settings',
    pageSubtitle: 'Manage your personal information and personalize your workspace.',
    sectionProfile: 'Personal Profile',
    labelName: 'Full Name',
    labelEmail: 'Email Address',
    sectionLanguage: 'System Language',
    langDesc: 'Choose the default display language for the entire interface.',
    btnSave: 'Save changes',
    btnLoggingOut: 'Log out of account',
    msgSuccess: 'Settings updated successfully.',
    msgError: 'An error occurred, please try again later.',
  },
} as const;

export default function SettingsPage() {
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const t = settingsI18n[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem('cacao_tlms_locale');
    if (saved === 'en' || saved === 'vi') {
      setLocale(saved);
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('Failed');
        const payload = await response.json();
        setName(payload?.name ?? '');
        setEmail(payload?.email ?? '');
      } catch {
        setName('');
        setEmail('');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const toggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
    window.localStorage.setItem('cacao_tlms_locale', next);
  };

  const handleSave = async () => {
    setStatus('idle');
    setMessage('');
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, locale }),
      });
      if (!response.ok) throw new Error('Save failed');
      setStatus('success');
      setMessage(t.msgSuccess);
    } catch {
      setStatus('error');
      setMessage(t.msgError);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white px-6 py-6">
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>{t.pageTitle}</span>
          </div>
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-2 text-sm font-medium transition-colors duration-100 hover:bg-[#F1F1EF]"
          >
            {locale === 'vi' ? 'English' : 'Tiếng Việt'}
          </button>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-[#2F2F2F]">{t.pageTitle}</h1>
            <p className="mt-3 text-sm font-normal leading-6 text-neutral-600">{t.pageSubtitle}</p>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl border border-neutral-200 bg-[#FAFAFA] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <User className="h-4 w-4" strokeWidth={1.5} />
                <span>{t.sectionProfile}</span>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-neutral-700">
                  <span>{t.labelName}</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                    placeholder={t.labelName}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-neutral-700">
                  <span>{t.labelEmail}</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-[#2F2F2F] outline-none transition-colors duration-100 focus:border-[#C5A880]"
                    placeholder={t.labelEmail}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-[#FAFAFA] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <Globe className="h-4 w-4" strokeWidth={1.5} />
                <span>{t.sectionLanguage}</span>
              </div>
              <p className="mt-3 text-sm font-normal leading-6 text-neutral-600">{t.langDesc}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setLocale('vi')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-100 ${locale === 'vi' ? 'border-[#2F2F2F] bg-white text-[#2F2F2F]' : 'border-neutral-200 bg-[#FAFAFA] text-neutral-700 hover:bg-[#F1F1EF]'}`}
                >
                  Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-100 ${locale === 'en' ? 'border-[#2F2F2F] bg-white text-[#2F2F2F]' : 'border-neutral-200 bg-[#FAFAFA] text-neutral-700 hover:bg-[#F1F1EF]'}`}
                >
                  English
                </button>
              </div>
            </section>

            {message && (
              <div className={`rounded-2xl px-4 py-3 text-sm ${status === 'success' ? 'bg-[#E2F0D9] text-[#264326]' : 'bg-[#FEF2F2] text-[#991B1B]'} border border-neutral-200`}>
                {message}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white transition-colors duration-100 hover:bg-[#181818]"
              >
                <Check className="h-4 w-4" strokeWidth={1.5} />
                {t.btnSave}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-neutral-700 transition-colors duration-100 hover:bg-[#F1F1EF]"
              >
                <Lock className="h-4 w-4" strokeWidth={1.5} />
                {t.btnLoggingOut}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
