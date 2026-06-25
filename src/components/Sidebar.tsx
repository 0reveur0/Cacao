/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, Plus } from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: string;
  label: string;
}

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

export default function Sidebar({ activeItem = 'workspace', onItemClick, lessons, onLessonClick }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const mainMenuItems: SidebarItem[] = [
    { id: 'workspace', icon: '🏠', label: 'Ban lam viec' },
    { id: 'courses', icon: '📚', label: 'Khoa hoc' },
    { id: 'assignments', icon: '📝', label: 'Hop bai tap & Thi cu' },
    { id: 'discussions', icon: '💬', label: 'Goc thao luan' },
    { id: 'billing', icon: '💳', label: 'Lich su hoc phi' },
  ];

  const getInitials = () => {
    return profile?.name?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'STUDENT':
        return 'Hoc sinh';
      case 'TEACHER':
        return 'Giang vien';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Thanh vien';
    }
  };

  return (
    <aside
      className="h-screen w-[260px] flex flex-col border-r relative flex-shrink-0"
      style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5' }}
    >
      {/* Workspace Header */}
      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-base"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            ☕
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold" style={{ color: '#2F2F2F' }}>
              Cacao TLMS
            </span>
          </div>
          <ChevronDown className="w-4 h-4" style={{ color: '#9B9B9B' }} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ backgroundColor: '#E5E5E5' }} />

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {mainMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-all duration-150"
              style={{
                backgroundColor: activeItem === item.id ? '#F5EBE0' : 'transparent',
                color: activeItem === item.id ? '#2F2F2F' : '#6B6B6B'
              }}
              onMouseEnter={(e) => {
                if (activeItem !== item.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 mx-1 h-px" style={{ backgroundColor: '#E5E5E5' }} />

        {/* Lessons Section */}
        <div>
          <div className="px-2.5 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#9B9B9B' }}>
              LO TRINH HOC TAP
            </span>
          </div>
          <div className="space-y-0.5">
            {(lessons || []).map((lesson) => (
              <LessonNavItem
                key={lesson.id}
                icon={lesson.status === 'completed' ? '✓' : lesson.status === 'active' ? '📖' : '🔒'}
                title={lesson.title}
                status={lesson.status}
                onClick={() => onLessonClick?.(lesson.id)}
              />
            ))}
          </div>

          {/* Add New Button */}
          <button
            className="w-full flex items-center gap-2 px-2.5 py-2 mt-2 rounded-md text-sm transition-all duration-150"
            style={{ color: '#9B9B9B' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
              e.currentTarget.style.color = '#6B6B6B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9B9B9B';
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Xem tat ca khoa hoc</span>
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-3 border-t" style={{ borderColor: '#E5E5E5' }}>
        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md transition-all duration-150 cursor-pointer"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
          >
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#2F2F2F' }}>
              {profile?.name || 'Hoc sinh'}
            </p>
            <p className="text-xs" style={{ color: '#9B9B9B' }}>
              {getRoleLabel()}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded transition-all duration-150 hover:bg-red-50"
            title="Dang xuat"
          >
            <LogOut className="w-4 h-4" style={{ color: '#9B9B9B' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function LessonNavItem({ icon, title, status, onClick }: { icon: string; title: string; status: 'completed' | 'active' | 'locked'; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-150"
      style={{
        backgroundColor: status === 'active' ? '#F5EBE0' : 'transparent',
        opacity: status === 'locked' ? 0.5 : 1,
        color: '#6B6B6B'
      }}
      disabled={status === 'locked'}
      onMouseEnter={(e) => {
        if (status !== 'locked') {
          e.currentTarget.style.backgroundColor = status === 'active' ? '#F5EBE0' : 'rgba(0,0,0,0.03)';
        }
      }}
      onMouseLeave={(e) => {
        if (status !== 'locked') {
          e.currentTarget.style.backgroundColor = status === 'active' ? '#F5EBE0' : 'transparent';
        }
      }}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="truncate flex-1 text-left text-xs">{title}</span>
      {status === 'completed' && (
        <span className="text-xs px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
          Done
        </span>
      )}
    </button>
  );
}
