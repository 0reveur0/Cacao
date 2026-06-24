/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  conceptTested: string; // The specific sub-concept tested
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
  concepts: string[]; // List of concepts taught in this lesson
}

export interface QuizAttempt {
  id: string;
  lessonId: string;
  submittedAt: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number; // e.g. 2 out of 3
  passed: boolean; // meets mastery threshold (e.g. >= 2/3)
  feedback: string; // AI descriptive feedback
  isAnalyzing: boolean;
}

export interface StudentProgress {
  unlockedLessonIds: string[];
  completedLessonIds: string[];
  masteredConcepts: string[];
  attempts: Record<string, QuizAttempt[]>; // lessonId -> attempts
}

// System state for saving to local disk/in-memory
export interface TLMSState {
  lessons: Lesson[];
  quizzes: Record<string, Quiz>; // lessonId -> Quiz
  progress: StudentProgress;
}
