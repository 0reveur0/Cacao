/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, FileText, DollarSign, ChevronRight, ChevronDown, Plus, MoveHorizontal as MoreHorizontal, Search, RefreshCw, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────
type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type PayStatus = 'PAID' | 'PENDING' | 'OVERDUE';

interface AdminUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
}

interface BillingRow {
  id: string;
  studentName: string;
  invoiceRef: string;
  amount: number;
  currency: string;
  status: PayStatus;
  dueDate: string;
  createdAt: string;
}

interface QuizItem { id: string; text: string; concept: string; }
interface LessonItem { id: string; title: string; concepts: string[]; quizzes: QuizItem[]; }
interface ModuleItem { id: string; title: string; lessons: LessonItem[]; }
interface CourseNode { id: string; title: string; description: string; order: number; modules: ModuleItem[]; }

interface Metrics {
  totalStudents: number;
  activeCourses: number;
  pendingSubmissions: number;
  revenueThisMonth: number;
}

// ─── Style constants ────────────────────────────────────────────────────────────
const ROLE_STYLE: Record<UserRole, { bg: string; text: string }> = {
  ADMIN:   { bg: '#F0E6FF', text: '#5B21B6' },
  TEACHER: { bg: '#E0F2FE', text: '#0369A1' },
  STUDENT: { bg: '#F2F2F2', text: '#595959' },
};

const PAY_STYLE: Record<PayStatus, { bg: string; text: string; dot: string }> = {
  PAID:    { bg: '#E2F0D9', text: '#385723', dot: '#385723' },
  PENDING: { bg: '#FFF2CC', text: '#7F6000', dot: '#E6AC00' },
  OVERDUE: { bg: '#F2F2F2', text: '#595959', dot: '#ADADAD' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function fmt(amount: number, currency: string) {
  if (currency === 'VND')
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

function initials(name: string) {
  return name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

// ─── Role dropdown ──────────────────────────────────────────────────────────────
function RoleDropdown({
  userId,
  current,
  onChanged,
}: {
  userId: string;
  current: UserRole;
  onChanged: (id: string, role: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = async (role: UserRole) => {
    if (role === current) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      onChanged(userId, role);
    } finally {
      setSaving(false);
    }
  };

  const style = ROLE_STYLE[current];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors"
        style={{ backgroundColor: style.bg, color: style.text, fontFamily: 'var(--font-body)' }}
      >
        {saving ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : current}
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full mt-1 z-30 bg-white border border-neutral-100 rounded-lg shadow-lg overflow-hidden w-32"
          >
            {(['STUDENT', 'TEACHER', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => pick(r)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: ROLE_STYLE[r].bg, color: ROLE_STYLE[r].text }}
                >
                  {r}
                </span>
                {r === current && <Check className="w-3 h-3 text-neutral-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Nav item ───────────────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-all duration-150"
      style={{
        backgroundColor: active ? '#F5EBE0' : 'transparent',
        color: active ? '#2F2F2F' : '#6B6B6B',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
    >
      <span className="flex items-center gap-2.5">{icon}{label}</span>
      {badge && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-500">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2
          className="text-base font-semibold text-neutral-800 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <span>{icon}</span>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-neutral-400 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-lg border border-neutral-100 bg-white px-4 py-3"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neutral-400">{icon}</span>
        <span className="text-[11px] font-medium text-neutral-400 truncate">{label}</span>
      </div>
      <p className="text-xl font-semibold text-neutral-800" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Block A: User Management ────────────────────────────────────────────────────
function UserBlock({
  users,
  onRoleChanged,
  loading,
}: {
  users: AdminUser[];
  onRoleChanged: (id: string, role: UserRole) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [rowMenu, setRowMenu] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden">
      {/* Table toolbar */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['ADMIN', 'TEACHER', 'STUDENT'] as UserRole[]).map((r) => (
            <span
              key={r}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: ROLE_STYLE[r].bg, color: ROLE_STYLE[r].text, fontFamily: 'var(--font-body)' }}
            >
              {r}: {users.filter((u) => u.role === r).length}
            </span>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-neutral-100 bg-neutral-50/60"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h, i) => (
          <div
            key={i}
            className={`text-[11px] font-semibold text-neutral-400 uppercase tracking-wider ${
              i === 0 ? 'col-span-3' : i === 1 ? 'col-span-4' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-1' : i === 4 ? 'col-span-1' : 'col-span-1'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          No users found
        </div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {filtered.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.18 }}
              className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-neutral-50/70 transition-colors group"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {/* Name */}
              <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
                >
                  {initials(user.name)}
                </div>
                <span className="text-xs font-medium text-neutral-700 truncate">
                  {user.name || '—'}
                </span>
              </div>

              {/* Email */}
              <div className="col-span-4 min-w-0">
                <span className="text-xs text-neutral-500 truncate block">
                  {user.email ?? <span className="text-neutral-300 italic">not set</span>}
                </span>
              </div>

              {/* Role dropdown */}
              <div className="col-span-2">
                <RoleDropdown userId={user.id} current={user.role} onChanged={onRoleChanged} />
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span
                  className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    user.status === 'ACTIVE'
                      ? 'bg-[#E2F0D9] text-[#385723]'
                      : user.status === 'SUSPENDED'
                        ? 'bg-[#FCE4D6] text-[#843C0C]'
                        : 'bg-[#F2F2F2] text-[#595959]'
                  }`}
                >
                  {user.status}
                </span>
              </div>

              {/* Joined */}
              <div className="col-span-1">
                <span className="text-[10px] text-neutral-400">
                  {new Date(user.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
              </div>

              {/* Row actions */}
              <div className="col-span-1 flex justify-end">
                <div className="relative">
                  <button
                    onClick={() => setRowMenu(rowMenu === user.id ? null : user.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 text-neutral-400 transition-all"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {rowMenu === user.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-100 rounded-lg shadow-lg overflow-hidden w-36"
                      >
                        {['View Profile', 'Send Message', 'Suspend', 'Delete'].map((action) => (
                          <button
                            key={action}
                            onClick={() => setRowMenu(null)}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-neutral-50 ${
                              action === 'Delete' ? 'text-red-500' : 'text-neutral-700'
                            }`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {action}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          {filtered.length} users{search ? ` matching "${search}"` : ''}
        </span>
        <button
          className="text-[11px] text-[#C5A880] hover:text-[#B89A70] flex items-center gap-1 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Export CSV <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Block B: Curriculum Builder ──────────────────────────────────────────────────
function CourseOutlineNode({ course }: { course: CourseNode }) {
  const [open, setOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="border-b border-neutral-50 last:border-b-0">
      {/* Course row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-neutral-50 transition-colors group"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors flex-shrink-0" />
        </motion.span>
        <span
          className="text-xs font-semibold text-neutral-700 group-hover:text-neutral-900 flex-1 truncate"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          📖 {course.title}
        </span>
        <span
          className="text-[10px] text-neutral-400 flex-shrink-0"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {course.modules.length} modules · {course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pl-8 border-l border-neutral-100 ml-6">
              {course.modules.map((mod) => (
                <div key={mod.id} className="border-b border-neutral-50 last:border-b-0">
                  {/* Module row */}
                  <button
                    onClick={() =>
                      setModuleOpen((m) => ({ ...m, [mod.id]: !m[mod.id] }))
                    }
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors group"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <motion.span
                      animate={{ rotate: moduleOpen[mod.id] ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0" />
                    </motion.span>
                    <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-800 flex-1 truncate">
                      🗂 {mod.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex-shrink-0">
                      {mod.lessons.length} lessons
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {moduleOpen[mod.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-7 border-l border-neutral-100 ml-5">
                          {mod.lessons.map((lesson) => (
                            <LessonOutlineNode key={lesson.id} lesson={lesson} />
                          ))}
                          {/* Add lesson row */}
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[11px] text-neutral-400 hover:text-[#C5A880] hover:bg-[#FFFDF8] transition-colors"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            <Plus className="w-3 h-3" />
                            Add New Lesson
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LessonOutlineNode({ lesson }: { lesson: LessonItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-50 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-neutral-50 transition-colors group"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-400 flex-shrink-0" />
        </motion.span>
        <span className="text-xs text-neutral-600 group-hover:text-neutral-800 flex-1 truncate">
          📄 {lesson.title}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5EBE0] text-[#C5A880]">
            {lesson.concepts.length} concepts
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E2EFDA] text-[#375623]">
            {lesson.quizzes.length} quiz Q
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pl-6 ml-4 border-l border-neutral-100 py-1.5 px-4 space-y-1">
              {lesson.quizzes.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 py-1"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 flex-shrink-0 mt-0.5">
                    Q
                  </span>
                  <span className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                    {q.text}
                  </span>
                </div>
              ))}
              {lesson.quizzes.length === 0 && (
                <p className="text-[11px] text-neutral-400 italic">No quiz questions attached</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CurriculumBlock({ tree, loading }: { tree: CourseNode[]; loading: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
            Curriculum Tree
          </span>
          <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-body)' }}>
            {tree.length} courses
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-800 px-3 py-1.5 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Plus className="w-3 h-3" /> New Course
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          Loading curriculum...
        </div>
      ) : tree.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          No courses found
        </div>
      ) : (
        <div>
          {tree.map((course) => (
            <CourseOutlineNode key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Block C: Billing Ledger ──────────────────────────────────────────────────────
function BillingBlock({ ledger, loading }: { ledger: BillingRow[]; loading: boolean }) {
  const [filter, setFilter] = useState<PayStatus | 'ALL'>('ALL');

  const rows = filter === 'ALL' ? ledger : ledger.filter((r) => r.status === filter);

  return (
    <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                filter === f
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {f}
              {f !== 'ALL' && (
                <span className="ml-1 opacity-70">{ledger.filter((r) => r.status === f).length}</span>
              )}
            </button>
          ))}
        </div>
        <button
          className="text-[11px] font-medium text-neutral-600 hover:text-neutral-800 px-3 py-1.5 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Export Ledger
        </button>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-neutral-100 bg-neutral-50/60"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {['Student', 'Invoice #', 'Amount', 'Due Date', 'Status', ''].map((h, i) => (
          <div
            key={i}
            className={`text-[11px] font-semibold text-neutral-400 uppercase tracking-wider ${
              i === 0 ? 'col-span-3' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : i === 4 ? 'col-span-2' : 'col-span-1'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          Loading ledger...
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          No billing records
        </div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {rows.map((row, idx) => {
            const ps = PAY_STYLE[row.status];
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.025, duration: 0.15 }}
                className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-neutral-50/70 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
                  >
                    {initials(row.studentName)}
                  </div>
                  <span className="text-xs font-medium text-neutral-700 truncate">
                    {row.studentName}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-neutral-500 font-mono">{row.invoiceRef}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-medium text-neutral-700">
                    {fmt(row.amount, row.currency)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-neutral-500">
                    {new Date(row.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: ps.bg, color: ps.text }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ps.dot }}
                    />
                    {row.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          {rows.length} records ·{' '}
          <span className="text-[#385723]">
            {ledger.filter((r) => r.status === 'PAID').length} paid
          </span>
          {' · '}
          <span className="text-[#7F6000]">
            {ledger.filter((r) => r.status === 'PENDING').length} pending
          </span>
        </span>
        <span className="text-[11px] font-semibold text-neutral-600" style={{ fontFamily: 'var(--font-body)' }}>
          Total paid:{' '}
          {fmt(
            ledger.filter((r) => r.status === 'PAID').reduce((s, r) => s + r.amount, 0),
            'VND'
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────────
type AdminSection = 'users' | 'curriculum' | 'billing' | 'submissions';

export default function AdminPage({
  onExit,
  onNavigateToFeed,
}: {
  onExit: () => void;
  onNavigateToFeed?: () => void;
}) {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const [section, setSection] = useState<AdminSection>('users');

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tree, setTree] = useState<CourseNode[]>([]);
  const [ledger, setLedger] = useState<BillingRow[]>([]);

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) setMetrics(await res.json());
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      // Fetch from server which queries Supabase with service role
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        // Also fetch emails from Supabase auth on client side
        const serverUsers: AdminUser[] = (data.users ?? []).map((u: any) => ({
          ...u,
          status: 'ACTIVE' as UserStatus,
        }));

        // Enrich with emails from supabase if possible
        if (serverUsers.length > 0) {
          setUsers(serverUsers);
        } else {
          // No users in DB — show empty state with a demo row
          setUsers([
            {
              id: 'demo-1',
              name: profile?.name ?? 'Current Admin',
              email: 'admin@cacao.edu',
              role: (profile?.role as UserRole) ?? 'ADMIN',
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } finally {
      setUsersLoading(false);
    }
  }, [profile]);

  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await fetch('/api/admin/courses/tree');
      if (res.ok) {
        const data = await res.json();
        setTree(data.tree ?? []);
      }
    } finally {
      setTreeLoading(false);
    }
  }, []);

  const loadBilling = useCallback(async () => {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/admin/billing');
      if (res.ok) {
        const data = await res.json();
        setLedger(data.ledger ?? []);
      }
    } finally {
      setBillingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    loadUsers();
    loadTree();
    loadBilling();
  }, [loadMetrics, loadUsers, loadTree, loadBilling]);

  const handleRoleChanged = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const NAV: { id: AdminSection; icon: React.ReactNode; label: string; badge?: string }[] = [
    { id: 'users',      icon: <Users className="w-3.5 h-3.5" />,    label: 'User Directory',      badge: String(users.length) },
    { id: 'curriculum', icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Curriculum Manager',  badge: String(tree.length) },
    { id: 'billing',    icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Billing Ledger',    badge: String(ledger.length) },
    { id: 'submissions',icon: <FileText className="w-3.5 h-3.5" />, label: 'AI Submissions',       badge: String(metrics?.pendingSubmissions ?? 0) },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>

      {/* ── Admin Sidebar ── */}
      <aside
        className="w-[240px] flex-shrink-0 flex flex-col h-screen border-r border-neutral-100"
        style={{ backgroundColor: '#FBFBFA' }}
      >
        {/* Workspace header */}
        <div className="px-3 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: '#F5EBE0' }}
            >
              ☕
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 leading-none truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('adminTitle')}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                {t('adminSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p
            className="px-2.5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Workspace
          </p>
          {NAV.map((n) => (
            <NavItem
              key={n.id}
              icon={n.icon}
              label={n.label}
              active={section === n.id}
              badge={n.badge !== '0' ? n.badge : undefined}
              onClick={() => setSection(n.id)}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-neutral-100 space-y-0.5">
          {onNavigateToFeed && (
            <button
              onClick={onNavigateToFeed}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <span className="text-[13px]">📢</span>
              {t('adminFeedLink')}
            </button>
          )}
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            {t('adminBackDash')}
          </button>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
            >
              {initials(profile?.name ?? 'Admin')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-700 truncate" style={{ fontFamily: 'var(--font-body)' }}>
                {profile?.name ?? 'Admin'}
              </p>
              <p className="text-[10px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
                {profile?.role}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main canvas ── */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Top metrics strip */}
        <div className="border-b border-neutral-100 px-8 py-4">
          <div className="flex items-stretch gap-4">
            <MetricCard
              icon={<Users className="w-4 h-4" />}
              label="Total Active Students"
              value={metricsLoading ? '—' : metrics?.totalStudents ?? 0}
              sub="registered in platform"
            />
            <MetricCard
              icon={<BookOpen className="w-4 h-4" />}
              label="Active Courses"
              value={metricsLoading ? '—' : metrics?.activeCourses ?? 0}
              sub="in curriculum tree"
            />
            <MetricCard
              icon={<FileText className="w-4 h-4" />}
              label="Pending AI/Mentor Review"
              value={metricsLoading ? '—' : metrics?.pendingSubmissions ?? 0}
              sub="submissions queued"
            />
            <MetricCard
              icon={<DollarSign className="w-4 h-4" />}
              label="Revenue This Month"
              value={
                metricsLoading
                  ? '—'
                  : fmt(metrics?.revenueThisMonth ?? 0, 'VND')
              }
              sub="from billing ledger"
            />
          </div>
        </div>

        {/* Section content */}
        <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {section === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <SectionHeader
                  icon="📁"
                  title="User Directory"
                  subtitle="Manage student roles, access, and account status"
                  action={
                    <button
                      className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-800 px-3 py-1.5 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <Plus className="w-3 h-3" /> Invite User
                    </button>
                  }
                />
                <UserBlock users={users} onRoleChanged={handleRoleChanged} loading={usersLoading} />
              </motion.div>
            )}

            {section === 'curriculum' && (
              <motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <SectionHeader
                  icon="🧠"
                  title="Curriculum Manager"
                  subtitle="Manage courses, modules, lessons, and micro-quizzes in a nested outline view"
                />
                <CurriculumBlock tree={tree} loading={treeLoading} />
              </motion.div>
            )}

            {section === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <SectionHeader
                  icon="💳"
                  title="Billing Ledger"
                  subtitle="Track student payments, invoices, and financial status"
                />
                <BillingBlock ledger={ledger} loading={billingLoading} />
              </motion.div>
            )}

            {section === 'submissions' && (
              <motion.div
                key="submissions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <SectionHeader
                  icon="📝"
                  title="AI Submissions Queue"
                  subtitle="Review pending student quiz submissions awaiting AI or mentor analysis"
                />
                <SubmissionsBlock />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── Block D: Submissions queue (bonus) ──────────────────────────────────────────
function SubmissionsBlock() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('submissions')
      .select('id, lesson_id, submission_type, status, score, passed, created_at, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setSubmissions(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-100 py-12 text-center text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
        Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 py-16 text-center">
        <p className="text-sm font-medium text-neutral-500 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          No submissions yet
        </p>
        <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
          Student quiz submissions will appear here for AI and mentor review.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-100 bg-white overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-neutral-100 bg-neutral-50/60" style={{ fontFamily: 'var(--font-body)' }}>
        {['Student', 'Lesson', 'Type', 'Score', 'Status', 'Date'].map((h, i) => (
          <div key={h} className={`text-[11px] font-semibold text-neutral-400 uppercase tracking-wider ${i === 0 ? 'col-span-3' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-1' : i === 4 ? 'col-span-2' : 'col-span-2'}`}>
            {h}
          </div>
        ))}
      </div>
      <div className="divide-y divide-neutral-50">
        {submissions.map((sub, idx) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-neutral-50/70 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <div className="col-span-3 text-xs font-medium text-neutral-700 truncate">
              {(sub.profiles as any)?.name ?? 'Unknown'}
            </div>
            <div className="col-span-2 text-xs text-neutral-500 truncate">{sub.lesson_id}</div>
            <div className="col-span-2">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                {sub.submission_type}
              </span>
            </div>
            <div className="col-span-1 text-xs font-semibold text-neutral-700">{sub.score}%</div>
            <div className="col-span-2">
              <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${
                sub.status === 'REVIEWED' ? 'bg-[#E2F0D9] text-[#385723]' :
                sub.status === 'PROCESSING' ? 'bg-[#FFF2CC] text-[#7F6000]' :
                sub.status === 'FAILED' ? 'bg-[#FCE4D6] text-[#843C0C]' :
                'bg-[#F2F2F2] text-[#595959]'
              }`}>
                {sub.status}
              </span>
            </div>
            <div className="col-span-2 text-[11px] text-neutral-400">
              {new Date(sub.created_at).toLocaleDateString('vi-VN')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
