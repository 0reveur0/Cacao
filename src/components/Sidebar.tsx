/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, ChevronDown, Plus, LayoutGrid, BookOpen, FileText, MessageSquareText, CreditCard, CheckCircle2, Coffee, Languages, BookMarked, LockKeyhole } from 'lucide-react';

interface SidebarLesson {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'locked';
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  lessons?: SidebarLesson[];
  onLessonClick?: (id: string) => void;
}

export default function Sidebar({
  activeItem = 'workspace',
  onItemClick,
  lessons,
  onLessonClick,
}: SidebarProps) {
  const { profile, signOut } = useAuth();
  const { locale, t, toggle } = useLanguage();

  const mainMenuItems = [
    { id: 'workspace',   icon: LayoutGrid, label: t('nav_workspace') },
    { id: 'courses',     icon: BookOpen, label: t('nav_courses') },
    { id: 'assignments', icon: FileText, label: locale === 'vi' ? 'Hộp bài tập & Thi cử' : 'Assignments & Exams' },
    { id: 'discussions', icon: MessageSquareText, label: locale === 'vi' ? 'Góc thảo luận' : 'Discussion' },
    { id: 'billing',     icon: CreditCard, label: locale === 'vi' ? 'Lịch sử học phí' : 'Billing History' },
  ];

  const getInitials = () => profile?.name?.charAt(0).toUpperCase() || 'U';

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'STUDENT': return t('roleStudent');
      case 'TEACHER': return t('roleTeacher');
      case 'ADMIN':   return t('roleAdmin');
      default:        return locale === 'vi' ? 'Thành viên' : 'Member';
    }
  };

  return (
    <aside
      className="h-screen w-[240px] flex flex-col border-r flex-shrink-0"
      style={{
        backgroundColor: '#FBFBFA',
        borderColor: '#E9E9E9',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Workspace header */}
      <div className="px-2 pt-3 pb-1">
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-black/[0.04]"
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            <Coffee className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <span
              className="text-sm font-semibold truncate block"
              style={{ color: '#2F2F2F', fontFamily: 'var(--font-heading)' }}
            >
              Cacao TLMS
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ADADAD' }} />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-1.5 py-2 overflow-y-auto">
        <div className="space-y-0.5 mb-1">
          {mainMenuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(0,0,0,0.06)' : 'transparent',
                  color: isActive ? '#2F2F2F' : '#6B6B6B',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-2 mx-2 h-px" style={{ backgroundColor: '#E9E9E9' }} />

        {/* Learning path section */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: '#ADADAD' }}
            >
              {locale === 'vi' ? 'Lộ trình học tập' : 'LEARNING PATH'}
            </span>
          </div>

          <div className="space-y-0.5">
            {(lessons || []).map((lesson) => (
              <LessonNavItem
                key={lesson.id}
                icon={
                  lesson.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> :
                  lesson.status === 'active' ? <BookMarked className="h-3.5 w-3.5" strokeWidth={1.5} /> : <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.5} />
                }
                title={lesson.title}
                status={lesson.status}
                onClick={() => onLessonClick?.(lesson.id)}
              />
            ))}
          </div>

          {(lessons || []).length > 0 && (
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 mt-1 rounded-md text-[12px] transition-colors"
              style={{ color: '#ADADAD' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                e.currentTarget.style.color = '#6B6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ADADAD';
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Xem tất cả khóa học' : 'View all courses'}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-1.5 pb-2 border-t" style={{ borderColor: '#E9E9E9' }}>
        {/* Language toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-2 py-2 mt-2 mb-1 rounded-md text-xs transition-colors hover:bg-black/[0.03]"
          style={{ color: '#9B9B9B' }}
        >
          <Languages className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-medium" >
            {locale === 'vi' ? 'Tiếng Việt' : 'English'}
          </span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#F0F0F0', color: '#9B9B9B' }}
          >
            {locale === 'vi' ? 'VI' : 'EN'}
          </span>
        </button>

        {/* User profile */}
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer hover:bg-black/[0.03]"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
          >
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-medium truncate"
              style={{ color: '#2F2F2F' }}
            >
              {profile?.name || (locale === 'vi' ? 'Học sinh' : 'Student')}
            </p>
            <p className="text-[11px]" style={{ color: '#ADADAD' }}>
              {getRoleLabel()}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-1 rounded transition-colors hover:bg-red-50 flex-shrink-0"
            title={locale === 'vi' ? 'Đăng xuất' : 'Sign out'}
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: '#ADADAD' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function LessonNavItem({
  icon,
  title,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  status: 'completed' | 'active' | 'locked';
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors"
      style={{
        backgroundColor: status === 'active' ? 'rgba(197,168,128,0.1)' : 'transparent',
        opacity: status === 'locked' ? 0.45 : 1,
        color: '#6B6B6B',
      }}
      onMouseEnter={(e) => {
        if (status !== 'locked') {
          e.currentTarget.style.backgroundColor =
            status === 'active' ? 'rgba(197,168,128,0.15)' : 'rgba(0,0,0,0.03)';
        }
      }}
      onMouseLeave={(e) => {
        if (status !== 'locked') {
          e.currentTarget.style.backgroundColor =
            status === 'active' ? 'rgba(197,168,128,0.1)' : 'transparent';
        }
      }}
    >
      <span className="text-sm leading-none w-5 text-center flex-shrink-0">{icon}</span>
      <span className="truncate flex-1 text-left">{title}</span>
      {status === 'completed' && (
        <span
          className="rounded flex-shrink-0 p-0.5"
          style={{ color: '#166534' }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      )}
    </button>
  );
}
