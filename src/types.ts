/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  conceptTested: string;
}

export interface Quiz {
  lessonId: string;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  order: number;
  concepts: string[];
}

export interface QuizAttempt {
  id: string;
  lessonId: string;
  submittedAt: string;
  answers: Record<string, number>;
  score: number;
  passed: boolean;
  feedback: string;
  isAnalyzing: boolean;
}

export interface StudentProgress {
  unlockedLessonIds: string[];
  completedLessonIds: string[];
  masteredConcepts: string[];
  attempts: Record<string, QuizAttempt[]>;
}

export interface TLMSState {
  lessons: Lesson[];
  quizzes: Record<string, Quiz>;
  progress: StudentProgress;
}

// ===== AI Diagnostic Feedback System Types =====

export type SubmissionType = 'quiz' | 'code' | 'essay';
export type SubmissionStatus = 'PENDING' | 'PROCESSING' | 'REVIEWED' | 'FAILED';

export interface Submission {
  id: string;
  user_id: string;
  profile_id: string;
  lesson_id: string;
  content: string;
  submission_type: SubmissionType;
  status: SubmissionStatus;
  answers?: Record<string, number>;
  score: number;
  passed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackPoint {
  title: string;
  description: string;
  concept?: string;
}

export interface Feedback {
  id: string;
  submission_id: string;
  user_id: string;
  greeting: string;
  positive_points: FeedbackPoint[];
  gap_analysis: FeedbackPoint[];
  action_plan: FeedbackPoint[];
  encouragement: string;
  raw_response?: string;
  model_used: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface AIFeedbackRequest {
  lessonId: string;
  lessonTitle: string;
  lessonDescription: string;
  studentAnswers: Array<{
    questionId: string;
    questionText: string;
    selectedOption: string;
    selectedIndex: number;
    correctOption: string;
    correctIndex: number;
    isCorrect: boolean;
    conceptTested: string;
  }>;
  score: number;
  totalQuestions: number;
  passed: boolean;
}

export interface AIFeedbackResponse {
  greeting: string;
  positive_points: FeedbackPoint[];
  gap_analysis: FeedbackPoint[];
  action_plan: FeedbackPoint[];
  encouragement: string;
}

export type ScheduleEventType = 'LIVE_CLASS' | 'ASSIGNMENT' | 'QUIZ';

export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: ScheduleEventType;
  color_tag: string;
  lesson_id?: string | null;
  created_at: string;
}
