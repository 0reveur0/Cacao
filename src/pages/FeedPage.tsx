import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BellRing, CheckCheck, Clock3, Megaphone, Sparkles, AlertCircle } from 'lucide-react';

type FeedKind = 'announcement' | 'reminder' | 'update';

interface FeedItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  kind: FeedKind;
  read: boolean;
}

interface FeedApiResponse {
  items?: FeedItem[];
}

const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    title: 'Lịch kiểm tra giữa kỳ đã được cập nhật',
    body: 'Bài kiểm tra giữa kỳ sẽ diễn ra vào lúc 8:00 sáng thứ Hai, vui lòng chuẩn bị thẻ học sinh và máy tính để làm bài.',
    createdAt: '2026-06-29T08:15:00.000Z',
    kind: 'announcement',
    read: false,
  },
  {
    id: '2',
    title: 'Điểm số mới đã được nhập vào hệ thống',
    body: 'Hệ thống ghi nhận điểm số mới sẽ tự động cập nhật sau 15 phút kể từ khi giáo viên nhập kết quả.',
    createdAt: '2026-06-29T07:05:00.000Z',
    kind: 'update',
    read: false,
  },
  {
    id: '3',
    title: 'Buổi họp phụ huynh sẽ diễn ra vào tối thứ Tư',
    body: 'Phụ huynh vui lòng đăng ký trước để nhận vé tham dự và xem lịch trình chi tiết của buổi họp.',
    createdAt: '2026-06-28T16:40:00.000Z',
    kind: 'reminder',
    read: true,
  },
  {
    id: '4',
    title: 'Tài liệu học tập mới đã được tải lên',
    body: 'Kho bài giảng mới đã có các tài liệu ôn tập theo chương trình, bạn có thể mở trực tiếp để xem.',
    createdAt: '2026-06-28T10:20:00.000Z',
    kind: 'announcement',
    read: true,
  },
];

const FEED_KIND_META: Record<FeedKind, { label: string; icon: typeof BellRing; className: string }> = {
  announcement: {
    label: 'Thông báo',
    icon: Megaphone,
    className: 'bg-neutral-100 text-neutral-700',
  },
  reminder: {
    label: 'Nhắc nhở',
    icon: AlertCircle,
    className: 'bg-neutral-100 text-neutral-700',
  },
  update: {
    label: 'Cập nhật',
    icon: Sparkles,
    className: 'bg-neutral-100 text-neutral-700',
  },
};

function formatTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export default function FeedPage({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<FeedItem[]>(MOCK_FEED_ITEMS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFeed = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/feed');
        if (!response.ok) throw new Error('Network response was not ok');
        const payload = (await response.json()) as FeedApiResponse;
        if (active && payload.items?.length) {
          setItems(payload.items);
        }
      } catch {
        if (active) {
          setItems(MOCK_FEED_ITEMS);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeed();
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const handleMarkAllAsRead = async () => {
    setBusy(true);
    try {
      await fetch('/api/feed/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } catch {
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 text-[#2F2F2F] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <BellRing className="h-4 w-4" />
            <span>{unreadCount} chưa đọc</span>
          </div>
        </header>

        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-neutral-500">Bảng thông báo</p>
              <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Thông tin mới nhất</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Cập nhật nhanh về lịch học, điểm số, các thông báo quan trọng và nhắc nhở dành cho bạn.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={busy || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              {busy ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}
            </button>
          </div>
        </section>

        <section className="flex flex-col divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-[#FFFFFF]">
          {loading ? (
            <div className="px-4 py-6 text-sm text-neutral-500">Đang tải thông báo...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-500">Không có thông báo nào.</div>
          ) : (
            items.map((item) => {
              const kindMeta = FEED_KIND_META[item.kind];
              const Icon = kindMeta.icon;

              return (
                <article
                  key={item.id}
                  className="flex items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 ${kindMeta.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-neutral-900">{item.title}</h2>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                          {kindMeta.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.body}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                    <div className="inline-flex items-center gap-1 text-[12px] text-neutral-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                    {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
