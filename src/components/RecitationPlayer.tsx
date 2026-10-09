"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function RecitationPlayer({
  tutorId,
  audioUrl,
  tutorName,
}: {
  tutorId: string;
  audioUrl?: string;
  tutorName: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = audioUrl || `/api/recitations/${tutorId}`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Pause all other audio elements on the page first so only one plays at a time
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== audioRef.current) {
          el.pause();
        }
      });
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  return (
    <div className="w-full rounded-xl bg-brand-50/70 border border-brand-100 p-2.5 transition hover:border-brand-300">
      <audio ref={audioRef} src={src} preload="none" />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? `Pause ${tutorName}'s recitation` : `Listen to ${tutorName}'s recitation`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-950">
            <span className="flex items-center gap-1">
              <Volume2 size={13} className="text-brand-600" />
              Recitation Sample
            </span>
            <span className="text-[11px] font-medium text-brand-700">
              {isPlaying ? "Playing..." : "Click to listen"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-200/60">
            <div
              className="h-full bg-brand-600 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
