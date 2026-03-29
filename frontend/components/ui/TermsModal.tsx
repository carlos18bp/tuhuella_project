'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ScrollText } from 'lucide-react';

type TermsModalProps = {
  open: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onClose: () => void;
  showActions?: boolean;
};

export default function TermsModal({
  open,
  onAccept,
  onDecline,
  onClose,
  showActions = true,
}: TermsModalProps) {
  const t = useTranslations('termsModal');
  const tTerms = useTranslations('terms');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const sections = [
    { title: tTerms('generalTitle'), content: tTerms('generalContent') },
    { title: tTerms('userTitle'), content: tTerms('userContent') },
    { title: tTerms('adoptionTitle'), content: tTerms('adoptionContent') },
    { title: tTerms('donationTitle'), content: tTerms('donationContent') },
    { title: tTerms('privacyTitle'), content: tTerms('privacyContent') },
    { title: tTerms('shelterTitle'), content: tTerms('shelterContent') },
    { title: tTerms('contentTitle'), content: tTerms('contentContent') },
    { title: tTerms('liabilityTitle'), content: tTerms('liabilityContent') },
    { title: tTerms('changesTitle'), content: tTerms('changesContent') },
    { title: tTerms('contactTitle'), content: tTerms('contactContent') },
  ];

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) setHasScrolledToBottom(true);
  }, []);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      // Check if content is short enough that no scrolling is needed
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 40) {
          setHasScrolledToBottom(true);
        }
      });
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="terms-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="terms-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface-primary rounded-2xl shadow-xl border border-border-primary ring-1 ring-border-tertiary"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
              <ScrollText className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{t('title')}</h2>
              <p className="text-xs text-text-quaternary">{t('lastUpdated')}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-testid="terms-modal-content"
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        {!hasScrolledToBottom && showActions && (
          <div className="px-6 py-2 text-center border-t border-border-tertiary bg-surface-secondary/50">
            <p className="text-xs text-text-quaternary animate-pulse">{t('scrollToRead')}</p>
          </div>
        )}

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-primary shrink-0">
            {onDecline && (
              <button
                type="button"
                onClick={onDecline}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-text-secondary hover:bg-surface-hover border border-border-primary transition-colors"
              >
                {t('decline')}
              </button>
            )}
            {onAccept && (
              <button
                type="button"
                data-testid="terms-accept-btn"
                onClick={onAccept}
                disabled={!hasScrolledToBottom}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('accept')}
              </button>
            )}
          </div>
        )}

        {/* Read-only close button (when no actions) */}
        {!showActions && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-border-primary shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-text-secondary hover:bg-surface-hover border border-border-primary transition-colors"
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
