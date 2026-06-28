/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type TimerMode = 'focus' | 'break';

interface PomodoroTimerProps {
  defaultFocus?: number;
  defaultBreak?: number;
}

export default function PomodoroTimer({
  defaultFocus = 25,
  defaultBreak = 5,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(defaultFocus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = mode === 'focus' ? defaultFocus * 60 : defaultBreak * 60;

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) { clear(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          if (mode === 'focus') setSessionsToday((n) => n + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, clear, mode]);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleModeSwitch = (m: TimerMode) => {
    setIsRunning(false);
    setMode(m);
    setSecondsLeft(m === 'focus' ? defaultFocus * 60 : defaultBreak * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 26;
  const dash = circumference * progress;

  return (
    <div
      className="rounded-lg border border-neutral-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
          >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Focus Timer
        </p>
        {sessionsToday > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F5EBE0] text-[#C5A880]">
            {sessionsToday} sesh
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 mb-4 p-0.5 rounded-md bg-neutral-100">
          {(['focus', 'break'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={`flex-1 py-1 text-[10px] font-medium rounded transition-all duration-150 ${
                mode === m
                  ? 'bg-white text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {m === 'focus' ? '☕ Focus' : '🌿 Break'}
            </button>
          ))}
        </div>

        {/* Circular clock */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="relative w-16 h-16">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 60 60"
            >
              <circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke="#F0F0F0"
                strokeWidth="4"
              />
              <motion.circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke={mode === 'focus' ? '#C5A880' : '#86C5A4'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference - dash }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${mm}:${ss}`}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold text-neutral-700 tabular-nums"
                >
                  {mm}:{ss}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Active pulse dot */}
          {isRunning && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: mode === 'focus' ? '#C5A880' : '#86C5A4' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors px-2 py-1 rounded hover:bg-neutral-50"
          >
            {isRunning ? 'Pause' : secondsLeft < totalSeconds ? 'Resume' : 'Start'}
          </button>
          <span className="text-neutral-200 text-xs">·</span>
          <button
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors px-2 py-1 rounded hover:bg-neutral-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
