/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Maximize, CheckCircle, GraduationCap } from "lucide-react";

interface CustomVideoPlayerProps {
  videoUrl: string;
  lessonTitle: string;
  onVideoEnd?: () => void;
}

export default function CustomVideoPlayer({ videoUrl, lessonTitle, onVideoEnd }: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(120); // 2 minutes simulated
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (onVideoEnd) onVideoEnd();
            return duration;
          }
          const next = prev + 1;
          setProgress((next / duration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Reset progress when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [videoUrl]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1C120F] shadow-lg border border-[#2B1B17] aspect-video w-full flex flex-col justify-between group">
      {/* Video Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/70 via-transparent to-black/30">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-[#2B1B17]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C5A880]/30">
            <GraduationCap className="w-4 h-4 text-[#C5A880]" />
            <span className="text-xs text-[#FDFBF7] font-medium tracking-tight">Học liệu chính khóa</span>
          </div>
          <span className="text-xs text-[#8E7F73] bg-[#1C120F]/60 px-2 py-1 rounded">
            Độ phân giải: 1080p Ultra-HD
          </span>
        </div>

        {/* Center Play Button Overlay when paused */}
        <div className="flex items-center justify-center self-center my-auto transition-all duration-300 transform group-hover:scale-110">
          {!isPlaying ? (
            <button
              onClick={handlePlayPause}
              id="player-play-btn"
              className="p-5 rounded-full bg-[#C5A880] text-[#1C120F] hover:bg-[#d6ba94] shadow-lg focus:outline-none transition"
              aria-label="Play Lecture"
            >
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </button>
          ) : (
            <button
              onClick={handlePlayPause}
              id="player-pause-btn"
              className="p-5 rounded-full bg-[#FDFBF7]/10 backdrop-blur-md text-[#FDFBF7] opacity-0 group-hover:opacity-100 hover:bg-[#FDFBF7]/20 shadow-lg focus:outline-none transition duration-200"
              aria-label="Pause Lecture"
            >
              <Pause className="w-8 h-8 fill-current" />
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col gap-2 w-full mt-auto">
          {/* Progress bar */}
          <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="absolute left-0 top-0 h-full bg-[#C5A880] transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#FDFBF7] mt-1">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlayPause}
                id="player-control-play"
                className="hover:text-[#C5A880] transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleRestart}
                id="player-control-restart"
                className="hover:text-[#C5A880] transition"
                title="Xem lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-white/80" />
              <Maximize className="w-4 h-4 text-white/80 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Simulated Background Visual */}
      <div className="w-full h-full flex flex-col items-center justify-center bg-radial-at-t from-[#2B1B17] to-[#1C120F] text-center px-6">
        <GraduationCap className="w-16 h-16 text-[#C5A880]/20 mb-4 animate-pulse" />
        <h4 className="text-sm font-semibold text-[#FDFBF7] max-w-md line-clamp-1">{lessonTitle}</h4>
        <p className="text-xs text-[#8E7F73] mt-1 max-w-xs">
          {isPlaying ? "Đang truyền tải bài giảng..." : "Nhấp nút Phát để bắt đầu tiếp thu kiến thức"}
        </p>
      </div>
    </div>
  );
}
