/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { Lesson, Quiz, StudentProgress, AIFeedbackResponse } from '../types';

interface RoadmapItem {
  lessonId: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  masteredConcepts: number;
  totalConcepts: number;
}

interface ProgressContextValue {
  lessons: Lesson[];
  quizzes: Record<string, Quiz>;
  roadmap: RoadmapItem[];
  progress: StudentProgress | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  onQuizComplete: (lessonId: string, passed: boolean, feedback: AIFeedbackResponse) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/tlms/state');
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();

      setLessons(data.lessons || []);
      setQuizzes(data.quizzes || {});
      setProgress(data.progress || null);

      // Build roadmap from state
      const builtRoadmap: RoadmapItem[] = (data.lessons || []).map((lesson: Lesson) => {
        const isUnlocked = data.progress?.unlockedLessonIds.includes(lesson.id) ?? false;
        const isCompleted = data.progress?.completedLessonIds.includes(lesson.id) ?? false;
        const masteredCount = lesson.concepts.filter(
          (c: string) => data.progress?.masteredConcepts.includes(c)
        ).length;

        return {
          lessonId: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          isLocked: !isUnlocked,
          isCompleted,
          masteredConcepts: masteredCount,
          totalConcepts: lesson.concepts.length,
        };
      });

      setRoadmap(builtRoadmap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onQuizComplete = useCallback(
    (lessonId: string, passed: boolean, _feedback: AIFeedbackResponse) => {
      if (!passed) return;

      // Optimistic update: unlock next lesson immediately without F5
      setProgress((prev) => {
        if (!prev) return prev;
        if (prev.completedLessonIds.includes(lessonId)) return prev;

        const lessonList = lessons;
        const currentLesson = lessonList.find((l) => l.id === lessonId);
        if (!currentLesson) return prev;

        const nextLesson = lessonList.find((l) => l.order === currentLesson.order + 1);

        const newCompleted = [...prev.completedLessonIds, lessonId];
        const newUnlocked = nextLesson && !prev.unlockedLessonIds.includes(nextLesson.id)
          ? [...prev.unlockedLessonIds, nextLesson.id]
          : prev.unlockedLessonIds;
        const newMastered = [...new Set([...prev.masteredConcepts, ...currentLesson.concepts])];

        return {
          ...prev,
          completedLessonIds: newCompleted,
          unlockedLessonIds: newUnlocked,
          masteredConcepts: newMastered,
        };
      });

      // Update roadmap to reflect unlock
      setRoadmap((prev) => {
        const currentLesson = lessons.find((l) => l.id === lessonId);
        if (!currentLesson) return prev;
        const nextLesson = lessons.find((l) => l.order === currentLesson.order + 1);

        return prev.map((item) => {
          if (item.lessonId === lessonId) {
            return {
              ...item,
              isCompleted: true,
              masteredConcepts: item.totalConcepts,
            };
          }
          if (nextLesson && item.lessonId === nextLesson.id) {
            return { ...item, isLocked: false };
          }
          return item;
        });
      });

      // Re-fetch from server to sync authoritative state
      refresh();
    },
    [lessons, refresh]
  );

  return (
    <ProgressContext.Provider
      value={{ lessons, quizzes, roadmap, progress, loading, error, refresh, onQuizComplete }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
