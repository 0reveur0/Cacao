/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ScheduleEvent, ScheduleEventType } from '../types';

// ─── Seed mock events relative to today so the calendar is never empty ────────
function buildSeedEvents(userId: string): Omit<ScheduleEvent, 'id' | 'created_at'>[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const d = (day: number, h = 9) =>
    new Date(y, m, day, h, 0, 0).toISOString();

  return [
    {
      user_id: userId,
      title: 'Live Class: SELECT cơ bản',
      start_date: d(now.getDate()),
      end_date:   d(now.getDate(), 10),
      type: 'LIVE_CLASS',
      color_tag: '#C5A880',
      lesson_id: 'lesson-1',
    },
    {
      user_id: userId,
      title: 'Quiz: JOIN & Alias',
      start_date: d(now.getDate() + 2),
      end_date:   d(now.getDate() + 2, 10),
      type: 'QUIZ',
      color_tag: '#86C5A4',
      lesson_id: 'lesson-2',
    },
    {
      user_id: userId,
      title: 'Deadline: Bài tập JOIN',
      start_date: d(now.getDate() + 4, 23),
      end_date:   d(now.getDate() + 4, 23),
      type: 'ASSIGNMENT',
      color_tag: '#F4A478',
      lesson_id: 'lesson-2',
    },
    {
      user_id: userId,
      title: 'Live Class: Tối ưu hoá',
      start_date: d(now.getDate() + 7),
      end_date:   d(now.getDate() + 7, 11),
      type: 'LIVE_CLASS',
      color_tag: '#C5A880',
      lesson_id: 'lesson-3',
    },
    {
      user_id: userId,
      title: 'Quiz: INDEX & GROUP BY',
      start_date: d(now.getDate() + 10),
      end_date:   d(now.getDate() + 10, 10),
      type: 'QUIZ',
      color_tag: '#86C5A4',
      lesson_id: 'lesson-3',
    },
  ];
}

const TYPE_LABEL: Record<ScheduleEventType, string> = {
  LIVE_CLASS: 'Live Class',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
};

const TYPE_STYLE: Record<ScheduleEventType, { bg: string; text: string; dot: string }> = {
  LIVE_CLASS:  { bg: '#FEF4E8', text: '#9A6A2A', dot: '#C5A880' },
  ASSIGNMENT:  { bg: '#FEF0E8', text: '#9A4A1A', dot: '#F4A478' },
  QUIZ:        { bg: '#E8F6EF', text: '#2A6A50', dot: '#86C5A4' },
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ─── Add Event Modal ──────────────────────────────────────────────────────────
interface AddEventModalProps {
  onClose: () => void;
  onSave: (e: Omit<ScheduleEvent, 'id' | 'created_at'>) => Promise<void>;
  userId: string;
  defaultDate: Date;
}

function AddEventModal({ onClose, onSave, userId, defaultDate }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ScheduleEventType>('LIVE_CLASS');
  const [date, setDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const colorMap: Record<ScheduleEventType, string> = {
    LIVE_CLASS: '#C5A880',
    ASSIGNMENT: '#F4A478',
    QUIZ: '#86C5A4',
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const iso = new Date(date + 'T09:00:00').toISOString();
    await onSave({
      user_id: userId,
      title: title.trim(),
      start_date: iso,
      end_date: iso,
      type,
      color_tag: colorMap[type],
      lesson_id: null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-xl border border-neutral-100 shadow-xl p-6 w-full max-w-sm mx-4"
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <h3
          className="text-sm font-semibold text-neutral-800 mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Thêm sự kiện
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">Tiêu đề</label>
            <input
              autoFocus
              className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 text-neutral-700 focus:border-[#C5A880] focus:ring-0 outline-none transition-colors"
              placeholder="Tên sự kiện..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">Loại</label>
            <div className="flex gap-1.5">
              {(Object.keys(TYPE_LABEL) as ScheduleEventType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 text-[10px] font-medium py-1.5 rounded-md border transition-all ${
                    type === t
                      ? 'border-transparent text-white'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                  style={type === t ? { backgroundColor: colorMap[t] } : {}}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">Ngày</label>
            <input
              type="date"
              className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 text-neutral-700 outline-none focus:border-[#C5A880] transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="text-xs font-medium px-4 py-1.5 rounded-md text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#C5A880' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main CalendarView ────────────────────────────────────────────────────────
export default function CalendarView() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    const monthStart = startOfMonth(currentMonth).toISOString();
    const monthEnd = endOfMonth(currentMonth).toISOString();
    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', monthStart)
      .lte('start_date', monthEnd)
      .order('start_date', { ascending: true });
    if (!error && data) setEvents(data as ScheduleEvent[]);
    setLoading(false);
  }, [user, currentMonth]);

  // Seed events on first load if none exist
  const seedIfEmpty = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('schedule_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if ((count ?? 0) === 0) {
      const seeds = buildSeedEvents(user.id);
      await supabase.from('schedule_events').insert(seeds);
    }
  }, [user]);

  useEffect(() => {
    seedIfEmpty().then(fetchEvents);
  }, [seedIfEmpty, fetchEvents]);

  const handleSaveEvent = async (
    ev: Omit<ScheduleEvent, 'id' | 'created_at'>
  ) => {
    const { data, error } = await supabase
      .from('schedule_events')
      .insert(ev)
      .select()
      .single();
    if (!error && data) {
      setEvents((prev) => [...prev, data as ScheduleEvent]);
    }
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsOnDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_date), day));

  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  return (
    <div
      className="rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Calendar header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span
            className="text-sm font-semibold text-neutral-700"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-[10px] font-medium px-2 py-1 rounded border border-neutral-200 text-neutral-500 hover:border-neutral-300 transition-colors"
          >
            Hôm nay
          </button>
          <button
            onClick={() => { setAddModalDate(new Date()); setShowAddModal(true); }}
            className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded text-white transition-colors"
            style={{ backgroundColor: '#C5A880' }}
          >
            <Plus className="w-3 h-3" /> Thêm
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-neutral-50">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold text-neutral-400 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-400">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-50">
          {days.map((day) => {
            const dayEvents = eventsOnDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={`min-h-[72px] p-1.5 cursor-pointer transition-colors duration-100 group ${
                  !inMonth ? 'bg-neutral-50/40' : isSelected ? 'bg-[#FEF9F2]' : 'hover:bg-neutral-50/60'
                }`}
              >
                {/* Day number */}
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium mb-1 transition-colors ${
                    today
                      ? 'bg-[#C5A880] text-white font-semibold'
                      : isSelected
                        ? 'bg-[#F5EBE0] text-[#9A6A2A]'
                        : inMonth
                          ? 'text-neutral-600 group-hover:bg-neutral-100'
                          : 'text-neutral-300'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                {/* Event pills */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const style = TYPE_STYLE[ev.type];
                    return (
                      <div
                        key={ev.id}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium truncate"
                        style={{ backgroundColor: style.bg, color: style.text }}
                        title={ev.title}
                      >
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: style.dot }}
                        />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-neutral-400 pl-1.5">
                      +{dayEvents.length - 2} nữa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day event detail */}
      <AnimatePresence>
        {selectedDay && selectedDayEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-t border-neutral-100 bg-neutral-50/50 overflow-hidden"
          >
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {format(selectedDay, 'd MMMM', { locale: vi })}
              </p>
              <div className="space-y-2">
                {selectedDayEvents.map((ev) => {
                  const style = TYPE_STYLE[ev.type];
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between rounded-md px-3 py-2 border border-neutral-100"
                      style={{ backgroundColor: style.bg }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: style.dot }}
                        />
                        <span className="text-xs font-medium truncate" style={{ color: style.text }}>
                          {ev.title}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded ml-2 flex-shrink-0"
                        style={{ color: style.text, backgroundColor: `${style.dot}22` }}
                      >
                        {TYPE_LABEL[ev.type]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend footer */}
      <div className="px-4 py-2 border-t border-neutral-50 flex items-center gap-4 bg-neutral-50/30">
        {(Object.entries(TYPE_STYLE) as [ScheduleEventType, typeof TYPE_STYLE['LIVE_CLASS']][]).map(
          ([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.dot }} />
              <span className="text-[10px] text-neutral-400">{TYPE_LABEL[type]}</span>
            </div>
          )
        )}
      </div>

      {/* Add event modal */}
      <AnimatePresence>
        {showAddModal && user && (
          <AddEventModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveEvent}
            userId={user.id}
            defaultDate={addModalDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
