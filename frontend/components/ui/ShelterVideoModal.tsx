'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Film } from 'lucide-react';

type ShelterVideoModalProps = {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
};

export default function ShelterVideoModal({
  open,
  onClose,
  videoUrl,
  title,
}: ShelterVideoModalProps) {
  const t = useTranslations('shelterDetail');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  }, [open]);

  if (!open) return null;

  const heading = title ?? t('videoModalTitle');

  return (
    <div
      data-testid="shelter-video-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="relative w-full max-w-4xl bg-surface-primary rounded-2xl shadow-xl border border-border-primary overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-primary">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
              <Film className="h-4 w-4 text-teal-600" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">{heading}</h2>
          </div>
          <button
            type="button"
            aria-label={t('closeVideo')}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-black aspect-video">
          <video
            ref={videoRef}
            data-testid="shelter-video-player"
            controls
            preload="metadata"
            src={videoUrl}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
