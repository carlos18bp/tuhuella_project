'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

type Props = {
  readTimeMinutes?: number;
  lang?: string;
};

export default function ReadingProgressBar({ readTimeMinutes = 0, lang = 'es' }: Props) {
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [updateProgress]);

  const remainingMinutes = useMemo(() => {
    if (!readTimeMinutes) return 0;
    return Math.max(0, Math.ceil((1 - progress / 100) * readTimeMinutes));
  }, [readTimeMinutes, progress]);

  const showRemaining = remainingMinutes > 0 && progress > 5 && progress < 95;

  return (
    <>
      <div data-testid="reading-progress-bar" className="fixed top-0 left-0 w-full z-[60] pointer-events-none">
        <div
          data-testid="reading-progress-fill"
          className="h-[3px] bg-gradient-to-r from-teal-500 to-teal-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showRemaining && (
        <div data-testid="reading-progress-remaining" className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-surface-primary/90 backdrop-blur-sm shadow-sm border border-border-primary/60 text-xs text-text-tertiary pointer-events-none transition-opacity duration-300">
          ~{remainingMinutes} min {lang === 'en' ? 'remaining' : 'restantes'}
        </div>
      )}
    </>
  );
}
