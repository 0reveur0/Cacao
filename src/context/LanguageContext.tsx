/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Locale = 'vi' | 'en';

// ─── Full translation dictionary (Natural, friendly tone) ───────────────────────
export const translations = {
  vi: {
    // Welcome block
    welcome:            '👋 Chào {name}! Thong thả học nhé.',
    welcomeGuest:       '👋 Chào bạn! Thong thả học nhé.',
    subWelcome:         'Hôm nay có {count} bài học đang chờ bạn.',
    subWelcomeSingle:   'Hôm nay bạn có một bài học mới và một bài tập cần hoàn thiện.',
    goalTitle:          '💡 Mục tiêu: Học thấu, không học vẹt',
    goalBody:           'Không áp lực điểm số, không so kè. Bạn học cho đến khi thực sự hiểu — rồi mới tiến bước tiếp.',

    // Status labels
    completed:          'Đã xong',
    inProgress:         'Đang làm',
    locked:             'Chưa mở',
    lockedTooltip:      'Hoàn thành bài trước với 80% trở lên để mở khóa',

    // Nav items
    nav_workspace:      'Trang làm việc',
    nav_courses:        'Khóa học',
    nav_roadmap:        'Lộ trình',
    nav_discussion:     'Thảo luận',
    nav_schedule:       'Lịch',
    nav_settings:       'Cài đặt',

    // Quick actions
    quickAction:        'Thao tác nhanh',
    adminWorkspace:     'Quản trị',
    feedLink:           'Bản tin',
    newCourse:          '+ Khóa học mới',
    askQuestion:        '+ Đặt câu hỏi',
    viewSchedule:       '+ Xem lịch',
    newAssignment:      '+ Bài tập mới',

    // Reminders / progress
    reminders:          'Nhắc nhở',
    masteryTotal:       'Tiến độ tổng',
    viewAll:            'Xem tất cả',
    noData:             'Chưa có gì',
    loading:            'Đang tải...',
    noCoursesYet:       'Chưa có khóa học nào.',

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
    section_courses:    'Khóa học',
    section_roadmap:    'Bài tập & Lộ trình',
    section_calendar:   'Lịch & Deadline',

    // Section tab labels
    tab_gallery:        'Dạng lưới',
    tab_schedule:       'Lịch',
    tab_details:        'Chi tiết',
    tab_table:          'Bảng',
    tab_todo:           'Cần làm',
    tab_upcoming:       'Sắp tới',
    tab_calendar:       'Tháng',
    tab_list:           'Danh sách',
    tab_week:           'Tuần này',

    // Footer message
    footerTitle:        'Lời nhắn',
    footerBody:         'Làm sai là chuyện bình thường. Không ai đánh giá bạn, không có bảng xếp hạng. Bạn chỉ cần so với chính mình của hôm qua thôi.',

    // Roadmap footer
    roadmapFooter:      '{total} bài · {done} xong · {active} đang làm',

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

    // Interactive Lesson Page
    lesson_videoLecture:     'Bài giảng video',
    lesson_readingMaterial: 'Tài liệu đọc',
    lesson_yourNotes:       'Ghi chú cá nhân',
    lesson_addTimestamp:    '+ Thêm ghi chú tại thời điểm này',
    lesson_timestampHint:   'Nhấn vào timestamp để nhảy đến thời điểm trong video',
    lesson_notesPlaceholder:'Ghi chú của bạn sẽ được lưu tự động...',
    lesson_noVideo:         'Video chưa có',
    lesson_saveSuccess:     'Đã lưu ghi chú',
    lesson_saveError:       'Lỗi khi lưu ghi chú',
    lesson_syncedNotes:     'Ghi chú đồng bộ',
    lesson_exportNotes:     'Xuất ghi chú',
    lesson_autoSaveHint:    'Tự động lưu mỗi vài giây',
    lesson_timestampFormat: '⏱️ {time} - ',

    // Assignment Workspace
    assignmentTitle:        'Bài tập & Dự án',
    assignmentSubtitle:    'Không gian làm việc tập trung cho các bài tập dài hạn và dự án của bạn.',
    assignmentBoardView:    'Bảng Kanban',
    assignmentListView:     'Dạng danh sách',
    assignmentTabAll:       'Tất cả',
    assignmentToDo:         'Chưa làm',
    assignmentInProgress:  'Đang làm',
    assignmentUnderReview:  'Chờ chấm',
    assignmentCompleted:   'Hoàn thành',
    assignmentName:         'Tên bài tập',
    assignmentDueDate:      'Hạn nộp',
    assignmentStatus:       'Trạng thái',
    assignmentSubject:      'Môn học',
    assignmentPriority:     'Độ ưu tiên',
    assignmentSubmit:       'Nộp bài tập',
    assignmentDragDrop:     'Kéo thả file vào đây hoặc nhấn để tải lên',
    assignmentUploadHint:   'Hỗ trợ PDF, TXT, ZIP (tối đa 10MB)',
    assignmentUploadBtn:    '📎 Tải lên tệp bài làm',
    assignmentViewFeedback: 'Xem nhận xét từ AI/Mentor',
    assignmentNoFeedback:   'Chưa có phản hồi',
    assignmentPendingReview:'Đang chờ chấm...',
    assignmentWriteHere:    'Viết câu trả lời của bạn tại đây...',
    assignmentSubmitConfirm:'Bạn có chắc muốn nộp bài tập này?',
    assignmentSubmitted:    'Đã nộp thành công!',
    assignmentStatusTodo:   'Chưa làm',
    assignmentStatusProgress:'Đang làm',
    assignmentStatusReview: 'Chờ chấm',
    assignmentStatusDone:   'Hoàn thành',
    assignmentNew:          '+ Bài tập mới',
    assignmentEmpty:        'Chưa có bài tập nào',
    assignmentEmptyHint:    'Các bài tập được giao sẽ xuất hiện ở đây.',
    assignmentBack:         'Quay lại Dashboard',
    assignmentDetails:      'Chi tiết bài tập',
    assignmentInstructions: 'Hướng dẫn',
    assignmentYourWork:     'Bài làm của bạn',
    assignmentAttached:     'Tệp đính kèm',
    assignmentDeadline:     'Còn {time}',
    assignmentOverdue:      'Quá hạn',
    assignmentSearch:       'Tìm kiếm bài tập...',
    assignmentFilter:       'Lọc theo trạng thái',
    assignmentPriorityHigh:'Cao',
    assignmentPriorityMid: 'Trung bình',
    assignmentPriorityLow: 'Thấp',
    assignmentSaveDraft:    'Lưu nháp',
    assignmentSaved:        'Đã lưu',
    assignmentSaving:       'Đang lưu...',
    assignmentScore:        'Điểm',
    assignmentFeedbackAvailable:'Có phản hồi mới',

    // Auth pages
    brandSubtitle:       'Học tập thong thả, hiểu thấu vấn đề. Không áp lực, không so kè điểm số.',
    loginTitle:          'Đăng nhập vào không gian học tập',
    loginSubtitle:       'Học tập thong thả, hiểu thấu vấn đề',
    emailLabel:          'Địa chỉ email của bạn',
    emailPlaceholder:    'Nhập email...',
    passwordLabel:       'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu...',
    loginBtn:            'Tiếp tục bằng email',
    forgotPassword:      'Quên mật khẩu?',
    continueWithGoogle:  'Tiếp tục bằng Google',
    orDivider:           'hoặc',
    noAccount:           'Chưa có tài khoản?',
    hasAccount:          'Đã có tài khoản?',
    signUpLink:          'Đăng ký',
    signInLink:          'Đăng nhập',
    registerTitle:       'Tạo tài khoản mới',
    registerSubtitle:    'Bắt đầu hành trình học tập của bạn',
    registerBtn:         'Tạo tài khoản',
    yourNameLabel:       'Họ tên',
    yourNamePh:          'Nguyễn Văn A...',
    confirmPasswordLabel:'Xác nhận mật khẩu',
    confirmPasswordPh:   'Nhập lại mật khẩu...',
    selectRoleLabel:     'Vai trò',
    roleStudent:         'Học sinh',
    roleTeacher:         'Giảng viên',
    roleAdmin:           'Quản trị',
    registerSuccess:     'Đăng ký thành công!',
    registerSuccessHint: 'Kiểm tra email để xác thực tài khoản nhé.',
    backToLogin:         'Quay lại đăng nhập',
    pwMismatch:          'Mật khẩu xác nhận không khớp.',
    pwTooShort:          'Mật khẩu cần ít nhất 6 ký tự.',
    authError:           'Đăng nhập không thành công. Thử lại nhé.',
    authGoogleError:     'Đăng nhập Google không thành công.',
    authRegisterError:   'Đăng ký không thành công. Thử lại nhé.',
    masteryTagline:      'Không áp lực, không so kè — chỉ có bạn và kiến thức.',

    // Natural-tone status strings
    statusCompleted:     'Đã xong',
    statusProgress:      'Đang làm',
    statusLocked:        'Chưa mở — Bạn cần hoàn thành bài trước và đạt từ 80% điểm số trở lên',

    // Inline tools
    addTimestamp:        'Ghi lại mốc thời gian',
    saveNotes:           'Lưu sổ tay',
    dragDropFile:        'Nhấp để chọn tệp hoặc kéo thả bài làm vào đây (PDF, ZIP)',
    viewFeedback:        'Xem nhận xét từ AI hoặc Giảng viên',
  },

  en: {
    // Welcome block
    welcome:            '👋 Hi, {name}! Take your time.',
    welcomeGuest:       '👋 Hi there! Take your time.',
    subWelcome:         'You have {count} lesson(s) waiting for you.',
    subWelcomeSingle:   'You have 1 new lesson and 1 assignment to complete today.',
    goalTitle:          '💡 Core Goal: Master it, don\'t just memorize',
    goalBody:           'No grade pressure, no competition. Learn until you truly understand — then move on.',

    // Status labels
    completed:          'Done',
    inProgress:         'In progress',
    locked:             'Locked',
    lockedTooltip:      'Complete previous lesson with 80% or higher to unlock',

    // Nav items
    nav_workspace:      'Workspace',
    nav_courses:        'Courses',
    nav_roadmap:        'Roadmap',
    nav_discussion:     'Discussion',
    nav_schedule:       'Schedule',
    nav_settings:       'Settings',

    // Quick actions
    quickAction:        'Quick Actions',
    adminWorkspace:     'Admin',
    feedLink:           'Updates',
    newCourse:          '+ New Course',
    askQuestion:        '+ Ask a Question',
    viewSchedule:       '+ View Schedule',
    newAssignment:      '+ New Assignment',

    // Reminders / progress
    reminders:          'Reminders',
    masteryTotal:       'Overall Progress',
    viewAll:            'View all',
    noData:             'Nothing here',
    loading:            'Loading...',
    noCoursesYet:       'No courses yet.',

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
    section_courses:    'Courses',
    section_roadmap:    'Assignments & Roadmap',
    section_calendar:   'Schedule & Deadlines',

    // Section tab labels
    tab_gallery:        'Gallery',
    tab_schedule:       'Schedule',
    tab_details:        'Details',
    tab_table:          'Table',
    tab_todo:           'To Do',
    tab_upcoming:       'Upcoming',
    tab_calendar:       'Month',
    tab_list:           'List',
    tab_week:           'This Week',

    // Footer message
    footerTitle:        'A quick note',
    footerBody:         'Making mistakes is normal. No grades to judge you, no leaderboards — just you vs. the you of yesterday.',

    // Roadmap footer
    roadmapFooter:      '{total} lessons · {done} done · {active} in progress',

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

    // Interactive Lesson Page
    lesson_videoLecture:     'Video Lecture',
    lesson_readingMaterial: 'Reading Material',
    lesson_yourNotes:       'Your Personal Notes',
    lesson_addTimestamp:    '+ Add Timestamp Note',
    lesson_timestampHint:   'Click a timestamp to jump to that point in the video',
    lesson_notesPlaceholder:'Your notes will be auto-saved...',
    lesson_noVideo:         'No video available',
    lesson_saveSuccess:     'Notes saved',
    lesson_saveError:       'Error saving notes',
    lesson_syncedNotes:     'Synced Notes',
    lesson_exportNotes:     'Export Notes',
    lesson_autoSaveHint:    'Auto-saves every few seconds',
    lesson_timestampFormat: '⏱️ {time} - ',

    // Assignment Workspace
    assignmentTitle:        'Assignments & Projects',
    assignmentSubtitle:    'Focused workspace for your long-form assignments and projects.',
    assignmentBoardView:    'Board View',
    assignmentListView:     'List View',
    assignmentTabAll:       'All',
    assignmentToDo:         'To Do',
    assignmentInProgress:  'In Progress',
    assignmentUnderReview:  'Under Review',
    assignmentCompleted:   'Completed',
    assignmentName:         'Assignment Name',
    assignmentDueDate:      'Due Date',
    assignmentStatus:       'Status',
    assignmentSubject:      'Subject',
    assignmentPriority:     'Priority',
    assignmentSubmit:       'Submit Assignment',
    assignmentDragDrop:     'Drag & drop file here or click to upload',
    assignmentUploadHint:   'Supports PDF, TXT, ZIP (max 10MB)',
    assignmentUploadBtn:    '📎 Upload Assignment File',
    assignmentViewFeedback: 'View AI/Mentor Feedback',
    assignmentNoFeedback:   'No feedback yet',
    assignmentPendingReview:'Pending review...',
    assignmentWriteHere:    'Write your answer here...',
    assignmentSubmitConfirm:'Are you sure you want to submit this assignment?',
    assignmentSubmitted:    'Submitted successfully!',
    assignmentStatusTodo:   'To Do',
    assignmentStatusProgress:'In Progress',
    assignmentStatusReview: 'Under Review',
    assignmentStatusDone:   'Completed',
    assignmentNew:          '+ New Assignment',
    assignmentEmpty:        'No assignments yet',
    assignmentEmptyHint:    'Assigned tasks will appear here.',
    assignmentBack:         'Back to Dashboard',
    assignmentDetails:      'Assignment Details',
    assignmentInstructions: 'Instructions',
    assignmentYourWork:     'Your Work',
    assignmentAttached:     'Attached Files',
    assignmentDeadline:     '{time} left',
    assignmentOverdue:      'Overdue',
    assignmentSearch:       'Search assignments...',
    assignmentFilter:       'Filter by status',
    assignmentPriorityHigh:'High',
    assignmentPriorityMid: 'Medium',
    assignmentPriorityLow: 'Low',
    assignmentSaveDraft:    'Save Draft',
    assignmentSaved:        'Saved',
    assignmentSaving:       'Saving...',
    assignmentScore:        'Score',
    assignmentFeedbackAvailable:'New feedback available',

    // Auth pages
    loginTitle:          'Sign in to your workspace',
    loginSubtitle:       'Learn at your own pace, master the core',
    emailLabel:          'Your email address',
    emailPlaceholder:    'Enter email...',
    passwordLabel:       'Password',
    passwordPlaceholder: 'Enter password...',
    loginBtn:            'Continue with email',
    forgotPassword:      'Forgot password?',
    continueWithGoogle:  'Continue with Google',
    orDivider:           'or',
    noAccount:           "Don't have an account?",
    hasAccount:          'Already have an account?',
    signUpLink:          'Sign up',
    signInLink:          'Sign in',
    registerTitle:       'Create your account',
    registerSubtitle:    'Start your learning journey',
    registerBtn:         'Create account',
    yourNameLabel:       'Full name',
    yourNamePh:          'Your name...',
    confirmPasswordLabel:'Confirm password',
    confirmPasswordPh:   'Re-enter password...',
    selectRoleLabel:     'Role',
    roleStudent:         'Student',
    roleTeacher:         'Teacher',
    roleAdmin:           'Admin',
    registerSuccess:     'Account created!',
    registerSuccessHint: 'Check your email to verify your account.',
    backToLogin:         'Back to sign in',
    pwMismatch:          'Passwords do not match.',
    pwTooShort:          'Password must be at least 6 characters.',
    authError:           'Sign in failed. Please try again.',
    authGoogleError:     'Google sign-in failed.',
    authRegisterError:   'Registration failed. Please try again.',
    masteryTagline:      'No pressure, no competition — just you and the knowledge.',

    // Natural-tone status strings
    statusCompleted:     'Done',
    statusProgress:      'In progress',
    statusLocked:        'Locked — Complete previous lesson with 80% or higher to unlock',

    // Inline tools
    addTimestamp:        'Add timestamp',
    saveNotes:           'Save notes',
    dragDropFile:        'Click to upload or drag your file here (PDF, ZIP)',
    viewFeedback:        'View AI or Mentor feedback',

    // Brand
    brandSubtitle:       'Learn at your own pace, master the core. Zero anxiety, no leaderboards.',
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
