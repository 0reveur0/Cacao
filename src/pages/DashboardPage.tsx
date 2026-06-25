/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../context/AuthContext';
import { Coffee, LogOut, BookOpen, GraduationCap, Users, ChartBar as BarChart3, Calendar, Bell, Clock, Star } from 'lucide-react';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();

  const getRoleDisplayName = () => {
    switch (profile?.role) {
      case 'STUDENT':
        return 'Hoc sinh';
      case 'TEACHER':
        return 'Giang vien';
      case 'ADMIN':
        return 'Quan tri vien';
      default:
        return 'Thanh vien';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buoi sang tot lanh';
    if (hour < 18) return 'Buoi chieu an la';
    return 'Buoi toi yen tinh';
  };

  const getPersonalizedMessage = () => {
    if (!profile) return '';

    if (profile.role === 'STUDENT') {
      return `Hi, ${profile.name}! Thong thả học nhé.`;
    } else if (profile.role === 'TEACHER') {
      return `Chao thay/cô ${profile.name}, hom nay co lop Live nào khong?`;
    } else {
      return `Chao ${profile.name}, ban da san sang quan ly he thong.`;
    }
  };

  const getQuickActions = () => {
    switch (profile?.role) {
      case 'STUDENT':
        return [
          { icon: BookOpen, label: 'Bai hoc dang mo', count: 4 },
          { icon: GraduationCap, label: 'Tien do hoc tap', count: null },
          { icon: Star, label: 'Khai niem da lam chu', count: 12 },
          { icon: Clock, label: 'Bai tap can hoan thanh', count: 2 },
        ];
      case 'TEACHER':
        return [
          { icon: BookOpen, label: 'Quan ly bai giang', count: 8 },
          { icon: Users, label: 'Hoc vien phu trach', count: 150 },
          { icon: BarChart3, label: 'Bao cao tien do', count: null },
          { icon: Calendar, label: 'Lich day trong tuan', count: 5 },
        ];
      default:
        return [
          { icon: Users, label: 'Quan ly nguoi dung', count: null },
          { icon: BookOpen, label: 'Tong so bai giang', count: 12 },
          { icon: BarChart3, label: 'Thong ke he thong', count: null },
          { icon: Bell, label: 'Thong bao', count: 3 },
        ];
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFBF7' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(253, 251, 247, 0.9)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5A880' }}>
              <Coffee className="w-5 h-5" style={{ color: '#1C120F' }} />
            </div>
            <span className="text-xl font-serif font-semibold" style={{ color: '#1C120F' }}>
              Cacao
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#E5DEDB' }}>
              <span className="text-xs font-medium" style={{ color: '#8E7F73' }}>{getRoleDisplayName()}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl transition-colors hover:bg-[#E5DEDB]">
              <Bell className="w-5 h-5" style={{ color: '#8E7F73' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#C5A880' }} />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: '#C5A880', color: '#1C120F' }}
              >
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#1C120F', color: '#FDFBF7' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Dang xuat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Personalized Greeting */}
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ color: '#8E7F73' }}>{getGreeting()}</p>
          <h1 className="text-3xl font-serif font-semibold" style={{ color: '#1C120F' }}>
            {getPersonalizedMessage()}
          </h1>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {getQuickActions().map((action, index) => (
            <div
              key={index}
              className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(28, 18, 15, 0.05)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(197, 168, 128, 0.15)' }}
                >
                  <action.icon className="w-5 h-5" style={{ color: '#C5A880' }} />
                </div>
                {action.count !== null && (
                  <span className="text-2xl font-semibold" style={{ color: '#1C120F' }}>
                    {action.count}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: '#8E7F73' }}>{action.label}</p>
            </div>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Progress/Content Card */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(28, 18, 15, 0.05)' }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: '#1C120F' }}>
                {profile?.role === 'STUDENT' ? 'Tien do hoc tap' : profile?.role === 'TEACHER' ? 'Lop hoc gan day' : 'Hoat dong gan day'}
              </h2>

              <div className="space-y-4">
                {/* Sample Progress Items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#FDFBF7' }}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(197, 168, 128, 0.15)' }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: '#C5A880' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate" style={{ color: '#1C120F' }}>
                        Lesson {item}: TypeScript Type Safety
                      </h3>
                      <p className="text-xs" style={{ color: '#8E7F73' }}>Bai hoc so {item}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: item === 1 ? 'rgba(197, 168, 128, 0.15)' : 'rgba(142, 127, 115, 0.1)',
                          color: item === 1 ? '#C5A880' : '#8E7F73'
                        }}
                      >
                        {item === 1 ? 'Da hoan thanh' : 'Dang hoc'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(28, 18, 15, 0.05)' }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: '#1C120F' }}>
                Hoat dong gan day
              </h2>
              <div className="space-y-3">
                {[
                  { time: '2 phut truoc', action: 'Hoan thanh bai quiz Lesson 1' },
                  { time: '1 gio truoc', action: 'Xem bai giang Lesson 2' },
                  { time: '3 gio truoc', action: 'Lam chu khai niem Type Safety' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: '#C5A880' }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: '#1C120F' }}>{activity.action}</p>
                      <p className="text-xs" style={{ color: '#8E7F73' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mastery Progress */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#C5A880' }}
            >
              <h2 className="text-lg font-medium mb-4" style={{ color: '#1C120F' }}>
                Muc do lam chu
              </h2>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#1C120F' }}>Khai niem</span>
                  <span className="text-sm font-medium" style={{ color: '#1C120F' }}>75%</span>
                </div>
                <div className="overflow-hidden h-2 text-xs rounded-full" style={{ backgroundColor: 'rgba(28, 18, 15, 0.2)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: '75%', backgroundColor: '#1C120F' }}
                  />
                </div>
              </div>
              <p className="text-sm mt-4" style={{ color: '#2B1B17' }}>
                Ban dang tien toi tot! Tiep tuc nhe.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
