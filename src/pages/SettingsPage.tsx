import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Globe, Lock, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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
    msgError: 'Có lỗi xảy ra, vui lòng thử lại sau.'
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
    msgError: 'An error occurred, please try again later.'
  }
};

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { profile, signOut } = useAuth();
  const { locale, setLocale } = useLanguage();
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const t = useMemo(() => settingsI18n[locale], [locale]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('Failed to load profile');
        const payload = await response.json();
        setName(payload?.name ?? profile?.name ?? '');
        setEmail(payload?.email ?? profile?.email ?? '');
      } catch {
        setName(profile?.name ?? '');
        setEmail(profile?.email ?? '');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profile?.email, profile?.name]);

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

  const handleLogout = async () => {
    await signOut();
    window.location.assign('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 text-[#2F2F2F] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'vi' ? 'Quay lại' : 'Back'}
          </button>
          <div className="text-sm font-medium text-neutral-500">{t.pageTitle}</div>
        </header>

        <section className="border-b border-neutral-200 bg-white px-4 py-6 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-neutral-900">{t.pageTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{t.pageSubtitle}</p>
          </div>
        </section>

        <section className="border-b border-neutral-200 bg-white px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <User className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-900">{t.sectionProfile}</h2>
              <p className="text-sm text-neutral-500">{locale === 'vi' ? 'Cập nhật hồ sơ cá nhân của bạn.' : 'Update your personal profile details.'}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">
              <span className="mb-2 block">{t.labelName}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors duration-100 focus:border-neutral-400"
                placeholder={locale === 'vi' ? 'Nhập họ và tên' : 'Enter your full name'}
              />
            </label>

            <label className="block text-sm font-medium text-neutral-700">
              <span className="mb-2 block">{t.labelEmail}</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition-colors duration-100 focus:border-neutral-400"
                placeholder={locale === 'vi' ? 'Nhập địa chỉ email' : 'Enter your email address'}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-[#2F2F2F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" strokeWidth={1.5} />
              {t.btnSave}
            </button>
            {status !== 'idle' && (
              <span className={`text-sm ${status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {message}
              </span>
            )}
          </div>
        </section>

        <section className="border-b border-neutral-200 bg-white px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <Globe className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-900">{t.sectionLanguage}</h2>
              <p className="text-sm text-neutral-500">{t.langDesc}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLocale('vi')}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-100 ${locale === 'vi' ? 'border-[#2F2F2F] bg-[#2F2F2F] text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-[#F1F1EF]'}`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-100 ${locale === 'en' ? 'border-[#2F2F2F] bg-[#2F2F2F] text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-[#F1F1EF]'}`}
            >
              English
            </button>
          </div>
        </section>

        <section className="bg-white px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <Lock className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-900">{locale === 'vi' ? 'Bảo mật tài khoản' : 'Account Security'}</h2>
              <p className="text-sm text-neutral-500">{locale === 'vi' ? 'Quản lý đăng nhập và bảo mật cá nhân.' : 'Manage account access and personal security.'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors duration-100 hover:bg-[#F1F1EF]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            {t.btnLoggingOut}
          </button>
        </section>
      </div>
    </div>
  );
}
