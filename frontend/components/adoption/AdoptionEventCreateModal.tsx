'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

type AdoptionEventCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { event_date: string; description: string }) => Promise<void>;
};

const todayLocalIso = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

export default function AdoptionEventCreateModal({
  open,
  onClose,
  onSubmit,
}: AdoptionEventCreateModalProps) {
  const t = useTranslations('adoption.events');
  const [eventDate, setEventDate] = useState<string>(todayLocalIso());
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEventDate(todayLocalIso());
      setDescription('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!description.trim()) {
      setError(t('validationDescription'));
      return;
    }
    const localDate = new Date(eventDate);
    if (Number.isNaN(localDate.getTime())) {
      setError(t('validationDate'));
      return;
    }
    if (localDate.getTime() > Date.now()) {
      setError(t('validationFutureDate'));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        event_date: localDate.toISOString(),
        description: description.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, unknown> } };
      const data = ax.response?.data;
      if (data && typeof data === 'object') {
        const flat: string[] = [];
        for (const v of Object.values(data)) {
          if (Array.isArray(v)) flat.push(...v.map(String));
          else if (typeof v === 'string') flat.push(v);
        }
        setError(flat.join(' ') || t('submitError'));
      } else {
        setError(t('submitError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={t('modalTitle')}
        className="w-full max-w-lg bg-surface-primary rounded-2xl shadow-xl border border-border-primary overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-primary">
          <h2 className="text-base font-semibold text-text-primary">{t('modalTitle')}</h2>
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-text-primary">{t('fieldDate')}</span>
            <input
              type="datetime-local"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-400"
              data-testid="event-date-input"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-primary">{t('fieldDescription')}</span>
            <textarea
              required
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="mt-1 w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-400"
              data-testid="event-description-input"
            />
            <span className="mt-1 block text-xs text-text-tertiary">{description.length}/2000</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border-primary">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white text-sm font-semibold transition-colors"
            data-testid="event-submit"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
