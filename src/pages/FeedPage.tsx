/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Pin, Plus, ChevronDown, Search, RefreshCw, Trash2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
type AnnouncementCategory = 'EXAM' | 'FEATURE' | 'GENERAL';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  pinned: boolean;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Category config ───────────────────────────────────────────────────────────
const CAT_STYLE: Record<AnnouncementCategory, { bg: string; text: string; dot: string; emoji: string }> = {
  EXAM:    { bg: '#FCE4D6', text: '#C65911', dot: '#C65911', emoji: '📅' },
  FEATURE: { bg: '#E2EFDA', text: '#375623', dot: '#4E7A34', emoji: '✨' },
  GENERAL: { bg: '#F2F2F2', text: '#595959', dot: '#8A8A8A', emoji: '📣' },
};

function useCatConfig() {
  const { t } = useLanguage();
  return {
    EXAM:    { label: t('cat_exam'),     ...CAT_STYLE.EXAM    },
    FEATURE: { label: t('cat_feature'),  ...CAT_STYLE.FEATURE },
    GENERAL: { label: t('cat_general'),  ...CAT_STYLE.GENERAL },
  } as Record<AnnouncementCategory, { label: string; bg: string; text: string; dot: string; emoji: string }>;
}

const CAT_CONFIG = {
  EXAM:    { label: 'Exam Update',  ...CAT_STYLE.EXAM    },
  FEATURE: { label: 'New Feature',  ...CAT_STYLE.FEATURE },
  GENERAL: { label: 'Announcement', ...CAT_STYLE.GENERAL },
};

const ALL_CATS = Object.keys(CAT_CONFIG) as AnnouncementCategory[];

// ─── Inline markdown renderer ──────────────────────────────────────────────────
function MarkdownBody({ content }: { content: string }) {
  const blocks = content.split(/```/g);
  return (
    <div
      className="text-sm text-neutral-600 leading-[1.75] space-y-1"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {blocks.map((block, bi) =>
        bi % 2 === 1 ? (
          <pre
            key={bi}
            className="my-3 px-4 py-3 rounded-md bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto"
          >
            <code>{block.replace(/^\w*\n/, '')}</code>
          </pre>
        ) : (
          block.split('\n').map((line, li) => {
            const key = `${bi}-${li}`;
            if (!line.trim()) return <div key={key} className="h-1" />;

            if (line.startsWith('> '))
              return (
                <blockquote
                  key={key}
                  className="border-l-2 border-neutral-200 pl-3 my-2 text-neutral-500 italic text-xs"
                >
                  <InlineText text={line.slice(2)} />
                </blockquote>
              );

            if (line.startsWith('- ') || line.startsWith('* '))
              return (
                <p key={key} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                  <InlineText text={line.slice(2)} />
                </p>
              );

            if (/^\d+\.\s/.test(line)) {
              const num = line.match(/^(\d+)\./)?.[1];
              return (
                <p key={key} className="flex items-start gap-2">
                  <span className="text-[11px] font-semibold text-neutral-400 flex-shrink-0 mt-0.5 w-4">
                    {num}.
                  </span>
                  <InlineText text={line.replace(/^\d+\.\s/, '')} />
                </p>
              );
            }

            if (line.startsWith('## '))
              return (
                <p key={key} className="font-semibold text-neutral-800 mt-4 mb-1 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  <InlineText text={line.slice(3)} />
                </p>
              );

            return (
              <p key={key}>
                <InlineText text={line} />
              </p>
            );
          })
        )
      )}
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-neutral-800">
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <code key={i} className="px-1 py-0.5 rounded text-xs bg-neutral-100 text-neutral-700 font-mono">
              {part.slice(1, -1)}
            </code>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Compose / Edit modal ──────────────────────────────────────────────────────
interface ComposeModalProps {
  initial?: Announcement;
  authorName: string;
  onClose: () => void;
  onSaved: (a: Announcement) => void;
}

function ComposeModal({ initial, authorName, onClose, onSaved }: ComposeModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState<AnnouncementCategory>(initial?.category ?? 'GENERAL');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();
  const catConfig = useCatConfig();

  const isEdit = !!initial;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        const { data, error: err } = await supabase
          .from('announcements')
          .update({ title: title.trim(), content: content.trim(), category, pinned, updated_at: new Date().toISOString() })
          .eq('id', initial.id)
          .select()
          .maybeSingle();
        if (err) throw err;
        onSaved(data as Announcement);
      } else {
        const { data, error: err } = await supabase
          .from('announcements')
          .insert({ title: title.trim(), content: content.trim(), category, pinned, author_name: authorName })
          .select()
          .maybeSingle();
        if (err) throw err;
        onSaved(data as Announcement);
      }
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-xl border border-neutral-100 shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        initial={{ scale: 0.97, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3
            className="text-sm font-semibold text-neutral-800"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {isEdit ? t('composeEdit') : t('composeNew')}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((p) => !p)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                preview
                  ? 'border-neutral-700 bg-neutral-700 text-white'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {preview ? t('composeEdit2') : t('composePreview')}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Category & Pin row */}
          <div className="flex items-center gap-3 flex-wrap">
            {ALL_CATS.map((c) => {
              const cfg = catConfig[c];
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                    active ? 'border-transparent' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
                  }`}
                  style={active ? { backgroundColor: cfg.bg, color: cfg.text, borderColor: 'transparent', fontFamily: 'var(--font-body)' } : { fontFamily: 'var(--font-body)' }}
                >
                  {cfg.emoji} {cfg.label}
                  {active && <Check className="w-3 h-3 ml-1" />}
                </button>
              );
            })}
            <button
              onClick={() => setPinned((p) => !p)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                pinned
                  ? 'bg-[#FFF2CC] text-[#7F6000] border-transparent'
                  : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Pin className="w-3 h-3" />
              {pinned ? t('composePinned') : t('composePinThis')}
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder={t('composeTitlePh')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-base font-semibold text-neutral-800 placeholder:text-neutral-300 border-0 border-b border-neutral-100 pb-2 outline-none focus:border-neutral-300 transition-colors bg-transparent"
            style={{ fontFamily: 'var(--font-heading)' }}
          />

          {/* Content — editor or preview */}
          {preview ? (
            <div className="min-h-[200px] p-0">
              <MarkdownBody content={content || '_Nothing to preview yet._'} />
            </div>
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder={t('composeBodyPh')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[220px] text-sm text-neutral-700 placeholder:text-neutral-300 outline-none resize-y bg-neutral-50/50 rounded-md p-3 border border-neutral-100 focus:border-neutral-200 transition-colors"
                style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}
              />
              <p className="text-[10px] text-neutral-400 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                Markdown supported: **bold**, `code`, - list, {'>'} blockquote, ## heading
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500" style={{ fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/40">
          <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
            {content.length} chars · Markdown rendered in feed
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {t('composeCancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-md text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#2F2F2F', fontFamily: 'var(--font-body)' }}
            >
              {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              {isEdit ? t('composeSave') : t('composePublish')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single feed card ──────────────────────────────────────────────────────────
interface FeedCardProps {
  item: Announcement;
  isAdmin: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onTogglePin: (a: Announcement) => void;
}

function FeedCard({ item, isAdmin, onEdit, onDelete, onTogglePin }: FeedCardProps) {
  const [expanded, setExpanded] = useState(item.pinned);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const catConfig = useCatConfig();
  const cfg = catConfig[item.category];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedTime = new Date(item.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  const preview = item.content.split('\n').find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('>'))?.slice(0, 160);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-lg border bg-white overflow-hidden ${
        item.pinned ? 'border-[#FFF2CC]' : 'border-neutral-100'
      }`}
      style={{ backgroundColor: item.pinned ? '#FFFDF8' : '#FFFFFF' }}
    >
      {/* Pinned strip */}
      {item.pinned && (
        <div
          className="flex items-center gap-1.5 px-5 py-1.5 border-b border-[#FFF2CC]"
          style={{ backgroundColor: '#FFFBF0' }}
        >
          <Pin className="w-3 h-3 text-[#E6AC00]" />
          <span className="text-[10px] font-semibold text-[#7F6000] uppercase tracking-widest" style={{ fontFamily: 'var(--font-body)' }}>
            Pinned
          </span>
        </div>
      )}

      <div className="px-5 py-4">
        {/* Card header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
              style={{ backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'var(--font-body)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
              {cfg.emoji} {cfg.label}
            </span>

            {/* Date */}
            <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {formattedDate} · {formattedTime}
            </span>
          </div>

          {/* Admin menu */}
          {isAdmin && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-100 rounded-lg shadow-lg overflow-hidden w-40"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(item); }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onTogglePin(item); }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {item.pinned ? '📌 Unpin' : '📌 Pin to top'}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className="text-base font-semibold text-neutral-800 leading-snug mb-2.5 cursor-pointer hover:text-neutral-900 transition-colors"
          style={{ fontFamily: 'var(--font-heading)' }}
          onClick={() => setExpanded((e) => !e)}
        >
          {item.title}
        </h2>

        {/* Collapsed preview */}
        <AnimatePresence initial={false} mode="wait">
          {!expanded ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <p
                className="text-sm text-neutral-500 leading-relaxed line-clamp-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {preview}
              </p>
              <button
                onClick={() => setExpanded(true)}
                className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {t('readMore')} <ChevronDown className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <MarkdownBody content={item.content} />
              <button
                onClick={() => setExpanded(false)}
                className="mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {t('collapse')} <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {item.author_name && (
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: '#F5EBE0', color: '#C5A880' }}
            >
              {item.author_name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {item.author_name}
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ─── Main FeedPage ─────────────────────────────────────────────────────────────
export default function FeedPage({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const catConfig = useCatConfig();
  const isAdmin = profile?.role === 'ADMIN';

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as Announcement[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('announcements-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        load(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleSaved = (saved: Announcement) => {
    setItems((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated.sort((a, b) =>
          a.pinned === b.pinned
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : a.pinned ? -1 : 1
        );
      }
      return [saved, ...prev].sort((a, b) =>
        a.pinned === b.pinned
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : a.pinned ? -1 : 1
      );
    });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTogglePin = async (item: Announcement) => {
    const { data, error } = await supabase
      .from('announcements')
      .update({ pinned: !item.pinned, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .select()
      .maybeSingle();
    if (!error && data) handleSaved(data as Announcement);
  };

  const displayed = items.filter((a) => {
    const matchesCat = filter === 'ALL' || a.category === filter;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const pinnedCount = items.filter((a) => a.pinned).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('feedBackBtn')}
          </button>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors w-44"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Admin: Compose */}
            {isAdmin && (
              <button
                onClick={() => setComposing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md text-white transition-colors"
                style={{ backgroundColor: '#2F2F2F', fontFamily: 'var(--font-body)' }}
              >
                <Plus className="w-3 h-3" />
                {t('feedNewPost')}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Feed hero */}
        <div className="mb-10">
          <div className="text-4xl mb-4">📢</div>
          <h1
            className="text-3xl font-semibold text-neutral-900 mb-3 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('feedTitle')}
          </h1>
          <p
            className="text-sm text-neutral-500 max-w-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t('feedSubtitle')}
          </p>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => setFilter('ALL')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                filter === 'ALL'
                  ? 'bg-neutral-800 text-white border-transparent'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {t('feedAll')}{' '}
              <span className="ml-1 opacity-70">{items.length}</span>
            </button>
            {ALL_CATS.map((c) => {
              const cfg = catConfig[c];
              const count = items.filter((a) => a.category === c).length;
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                    active ? 'border-transparent' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                  style={
                    active
                      ? { backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'var(--font-body)' }
                      : { fontFamily: 'var(--font-body)' }
                  }
                >
                  {cfg.emoji} {cfg.label}{' '}
                  <span className="opacity-60">{count}</span>
                </button>
              );
            })}

            {pinnedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 ml-2" style={{ fontFamily: 'var(--font-body)' }}>
                <Pin className="w-3 h-3" />
                {pinnedCount} {t('feedPinned')}
              </span>
            )}
          </div>
        </div>

        {/* Feed stream */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-neutral-100 bg-white px-5 py-4 animate-pulse">
                <div className="h-3 w-24 rounded bg-neutral-100 mb-3" />
                <div className="h-4 w-3/4 rounded bg-neutral-100 mb-2" />
                <div className="h-3 w-full rounded bg-neutral-100 mb-1" />
                <div className="h-3 w-2/3 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 py-20 text-center">
            <p className="text-2xl mb-3">🔍</p>
            <p className="text-sm font-medium text-neutral-500 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {search ? t('feedNoResults', { q: search }) : t('feedEmpty')}
            </p>
            <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {search ? t('feedSearchHint') : t('feedEmptyHint')}
            </p>
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence initial={false}>
              {displayed.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onEdit={(a) => setEditing(a)}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer note */}
        {!loading && items.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400" style={{ fontFamily: 'var(--font-body)' }}>
              {items.length} {t('feedRealtime')}
            </p>
          </div>
        )}
      </div>

      {/* Compose / Edit modal */}
      <AnimatePresence>
        {(composing || editing) && (
          <ComposeModal
            initial={editing ?? undefined}
            authorName={profile?.name ?? 'Admin'}
            onClose={() => { setComposing(false); setEditing(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
