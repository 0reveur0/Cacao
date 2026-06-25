/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Search, ChevronDown, Plus } from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export default function Sidebar({ activeItem = 'courses', onItemClick }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const mainItems: SidebarItem[] = [
    { id: 'search', icon: '🔍', label: 'Tim kiem' },
    { id: 'courses', icon: '📚', label: 'Khoa hoc' },
    { id: 'assignments', icon: '📝', label: 'Bai tap' },
    { id: 'discussions', icon: '💬', label: 'Thao luan' },
    { id: 'calendar', icon: '📅', label: 'Lich hoc' },
  ];

  const bottomItems: SidebarItem[] = [
    { id: 'settings', icon: '⚙️', label: 'Cai dat' },
  ];

  const getInitials = () => {
    return profile?.name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <aside
      className="h-screen w-60 flex flex-col border-r relative"
      style={{ backgroundColor: '#FAFAFA', borderColor: '#E5E5E5' }}
    >
      {/* Workspace Header */}
      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-sm"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            ☕
          </div>
          <span className="flex-1 text-sm font-medium text-left" style={{ color: '#2F2F2F' }}>
            Cacao
          </span>
          <ChevronDown className="w-4 h-4" style={{ color: '#9B9B9B' }} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors"
              style={{
                backgroundColor: activeItem === item.id ? '#F5EBE0' : 'transparent',
                color: activeItem === item.id ? '#2F2F2F' : '#6B6B6B'
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 px-2">
          <div className="h-px" style={{ backgroundColor: '#E5E5E5' }} />
        </div>

        {/* Favorited Lessons */}
        <div>
          <div className="px-2 mb-1">
            <span className="text-xs font-medium" style={{ color: '#9B9B9B' }}>
              BAI HOC
            </span>
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors" style={{ color: '#6B6B6B' }}>
              <span className="text-base">📖</span>
              <span>Lesson 1: Type Safety</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors" style={{ color: '#6B6B6B' }}>
              <span className="text-base">📖</span>
              <span>Lesson 2: Generics</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors" style={{ color: '#6B6B6B' }}>
              <span className="text-base">📖</span>
              <span>Lesson 3: Event-Driven</span>
            </button>
          </div>
        </div>

        {/* Add New Button */}
        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 mt-3 rounded-md text-sm hover:bg-gray-100 transition-colors" style={{ color: '#9B9B9B' }}>
          <Plus className="w-4 h-4" />
          <span>Them bai hoc</span>
        </button>
      </nav>

      {/* Bottom Section */}
      <nav className="px-2 py-2 border-t" style={{ borderColor: '#E5E5E5' }}>
        <div className="space-y-0.5">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors"
              style={{ color: '#6B6B6B' }}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: '#E5E5E5' }}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
            >
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#2F2F2F' }}>
                {profile?.name || 'User'}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Dang xuat"
            >
              <LogOut className="w-4 h-4" style={{ color: '#9B9B9B' }} />
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
