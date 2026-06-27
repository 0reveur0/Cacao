/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'vi' | 'en';

// ─── Full translation dictionary ───────────────────────────────────────────────
export const translations = {
  vi: {
    // Welcome block
    welcome:            '👋 Chào {name}! Thong thả học nhé.',
    welcomeGuest:       '👋 Chào bạn! Thong thả học nhé.',
    subWelcome:         'Hôm nay có {count} bài học đang chờ bạn hoàn thiện.',
    subWelcomeSingle:   'Hôm nay có 1 bài học mới và 1 bài tập cần hoàn thiện.',
    goalTitle:          '💡 Mục tiêu cốt lõi: Mastery Learning',
    goalBody:           'Không có áp lực điểm số, không bảng xếp hạng. Học đến khi làm chủ kiến thức — sau đó tiến bước tiếp theo.',

    // Status labels
    completed:          'Hoàn thành',
    inProgress:         'Đang học',
    locked:             'Chưa mở',
    lockedTooltip:      'Hoàn thành bài trước đạt ≥ 80% để mở khóa',

    // Nav items
    nav_workspace:      'Bảng làm việc',
    nav_courses:        'Khóa học',
    nav_roadmap:        'Lộ trình học',
    nav_discussion:     'Thảo luận',
    nav_schedule:       'Lịch học',
    nav_settings:       'Cài đặt',

    // Quick actions
    quickAction:        'Thao tác nhanh',
    adminWorkspace:     'Quản trị hệ thống',
    feedLink:           'Bản tin & Thông báo',
    newCourse:          '+ Khóa học mới',
    askQuestion:        '+ Đặt câu hỏi',
    viewSchedule:       '+ Xem lịch học',
    newAssignment:      '+ Bài tập mới',

    // Reminders / progress
    reminders:          'Nhắc nhở',
    masteryTotal:       'Mastery tổng',
    viewAll:            'Xem tất cả',
    noData:             'Không có dữ liệu',
    loading:            'Đang tải...',
    noCoursesYet:       'Chưa có khóa học nào được tải.',

    // Table headers
    col_title:          'Tiêu đề bài học',
    col_subject:        'Môn học',
    col_schedule:       'Lịch học',
    col_priority:       'Ưu tiên',
    col_status:         'Trạng thái',

    // Priority labels
    priority_high:      'Cao',
    priority_mid:       'Trung bình',
    priority_low:       'Thấp',

    // Section titles
    section_courses:    'Khóa học & Lịch học',
    section_roadmap:    'Bài tập & Lộ trình',
    section_calendar:   'Lịch học & Deadline',

    // Section tab labels
    tab_gallery:        'Gallery',
    tab_schedule:       'Lịch học',
    tab_details:        'Chi tiết',
    tab_table:          'Dạng bảng',
    tab_todo:           'Cần làm',
    tab_upcoming:       'Sắp tới',
    tab_calendar:       'Lịch tháng',
    tab_list:           'Danh sách',
    tab_week:           'Tuần này',

    // Footer message
    footerTitle:        'Lời nhắn từ Cacao',
    footerBody:         'Trong hệ thống Cacao, việc làm sai chỉ là một phần tự nhiên của hành trình làm chủ kiến thức. Không có điểm số phán xét, không bảng xếp hạng — bạn chỉ cần so sánh với chính mình của hôm qua.',

    // Roadmap footer
    roadmapFooter:      '{total} bài học · {done} hoàn thành · {active} đang học',

    // Feed page
    feedTitle:          'Bản tin & Thông báo',
    feedSubtitle:       'Cập nhật mới nhất về lịch thi, tính năng hệ thống và thông báo học tập.',
    feedBackBtn:        'Bảng làm việc',
    feedSearch:         'Tìm kiếm...',
    feedNoResults:      'Không tìm thấy kết quả cho "{q}"',
    feedEmpty:          'Chưa có thông báo nào',
    feedEmptyHint:      'Kiểm tra lại sau để xem các cập nhật từ hệ thống.',
    feedSearchHint:     'Thử từ khóa khác hoặc xóa bộ lọc.',
    feedNewPost:        'Đăng mới',
    feedPinned:         'đã ghim',
    feedRealtime:       'thông báo · Đồng bộ thời gian thực',
    feedAll:            'Tất cả',

    // Feed categories
    cat_exam:           'Kỳ thi',
    cat_feature:        'Tính năng mới',
    cat_general:        'Thông báo',

    // Feed card
    readMore:           'Xem thêm',
    collapse:           'Thu lại',

    // Compose modal
    composeNew:         'Thông báo mới',
    composeEdit:        'Chỉnh sửa thông báo',
    composeTitlePh:     'Tiêu đề thông báo...',
    composeBodyPh:      'Nội dung (hỗ trợ Markdown)...',
    composePreview:     'Xem trước',
    composeEdit2:       'Soạn thảo',
    composeCancel:      'Hủy',
    composePublish:     'Đăng',
    composeSave:        'Lưu thay đổi',
    composePinThis:     'Ghim thông báo này',
    composePinned:      'Đã ghim',

    // Quiz / lesson
    submit:             'Nộp bài',
    tryAgain:           'Làm lại',

    // Admin
    adminTitle:         'Cacao TLMS',
    adminSubtitle:      'Không gian quản trị',
    adminBackDash:      'Về bảng làm việc',
    adminFeedLink:      'Bản tin & Feed',

    // Language toggle
    langToggle:         'EN',
    langToggleTitle:    'Switch to English',
  },

  en: {
    // Welcome block
    welcome:            '👋 Hi, {name}! Take your time.',
    welcomeGuest:       '👋 Hi there! Take your time.',
    subWelcome:         'You have {count} lesson(s) waiting to be completed.',
    subWelcomeSingle:   'You have 1 new lesson and 1 assignment to complete today.',
    goalTitle:          '💡 Core Goal: Mastery Learning',
    goalBody:           'No grade pressure, no leaderboards. Study until you truly master the concept — then move to the next step.',

    // Status labels
    completed:          'Completed',
    inProgress:         'In Progress',
    locked:             'Locked',
    lockedTooltip:      'Complete previous lesson with ≥ 80% score to unlock',

    // Nav items
    nav_workspace:      'Workspace',
    nav_courses:        'Courses',
    nav_roadmap:        'Roadmap',
    nav_discussion:     'Discussion',
    nav_schedule:       'Schedule',
    nav_settings:       'Settings',

    // Quick actions
    quickAction:        'Quick Actions',
    adminWorkspace:     'Admin Workspace',
    feedLink:           'Updates & Announcements',
    newCourse:          '+ New Course',
    askQuestion:        '+ Ask a Question',
    viewSchedule:       '+ View Schedule',
    newAssignment:      '+ New Assignment',

    // Reminders / progress
    reminders:          'Reminders',
    masteryTotal:       'Overall Mastery',
    viewAll:            'View all',
    noData:             'No data',
    loading:            'Loading...',
    noCoursesYet:       'No courses loaded yet.',

    // Table headers
    col_title:          'Lesson Title',
    col_subject:        'Subject',
    col_schedule:       'Schedule',
    col_priority:       'Priority',
    col_status:         'Status',

    // Priority labels
    priority_high:      'High',
    priority_mid:       'Medium',
    priority_low:       'Low',

    // Section titles
    section_courses:    'Courses & Schedule',
    section_roadmap:    'Assignments & Roadmap',
    section_calendar:   'Schedule & Deadlines',

    // Section tab labels
    tab_gallery:        'Gallery View',
    tab_schedule:       'Schedule',
    tab_details:        'All Details',
    tab_table:          'Table View',
    tab_todo:           'To Do',
    tab_upcoming:       'Upcoming',
    tab_calendar:       'Calendar View',
    tab_list:           'List View',
    tab_week:           'This Week',

    // Footer message
    footerTitle:        'A Message from Cacao',
    footerBody:         'In the Cacao system, making mistakes is a natural part of the mastery journey. No grades to judge you, no leaderboards — just you vs. the you of yesterday.',

    // Roadmap footer
    roadmapFooter:      '{total} lessons · {done} completed · {active} in progress',

    // Feed page
    feedTitle:          'Updates & Announcements',
    feedSubtitle:       'Stay informed with the latest exam schedules, feature releases, and course updates.',
    feedBackBtn:        'Dashboard',
    feedSearch:         'Search...',
    feedNoResults:      'No results for "{q}"',
    feedEmpty:          'No announcements yet',
    feedEmptyHint:      'Check back soon for platform updates.',
    feedSearchHint:     'Try a different search term or clear the filter.',
    feedNewPost:        'New Post',
    feedPinned:         'pinned',
    feedRealtime:       'announcements · Synced in real-time',
    feedAll:            'All',

    // Feed categories
    cat_exam:           'Exam Update',
    cat_feature:        'New Feature',
    cat_general:        'Announcement',

    // Feed card
    readMore:           'Read more',
    collapse:           'Collapse',

    // Compose modal
    composeNew:         'New Announcement',
    composeEdit:        'Edit Announcement',
    composeTitlePh:     'Announcement title...',
    composeBodyPh:      'Write your announcement in markdown...',
    composePreview:     'Preview',
    composeEdit2:       'Edit',
    composeCancel:      'Cancel',
    composePublish:     'Publish',
    composeSave:        'Save Changes',
    composePinThis:     'Pin this',
    composePinned:      'Pinned',

    // Quiz / lesson
    submit:             'Submit Answers',
    tryAgain:           'Try Again',

    // Admin
    adminTitle:         'Cacao TLMS',
    adminSubtitle:      'Admin Workspace',
    adminBackDash:      'Back to Dashboard',
    adminFeedLink:      'Updates & Feed',

    // Language toggle
    langToggle:         'VI',
    langToggleTitle:    'Chuyển sang Tiếng Việt',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;

// ─── Context ────────────────────────────────────────────────────────────────────
interface LanguageContextType {
  locale: Locale;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str: string = (translations[locale] as Record<string, string>)[key]
      ?? (translations.vi as Record<string, string>)[key]
      ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };

  const toggle = () => setLocale((l) => (l === 'vi' ? 'en' : 'vi'));

  return (
    <LanguageContext.Provider value={{ locale, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
