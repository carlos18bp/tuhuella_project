'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CalendarDays, Plus, ShieldCheck, Building2, UserCog } from 'lucide-react';

import type { AdoptionApplicationEvent, UserRole } from '@/lib/types';
import AdoptionEventCreateModal from './AdoptionEventCreateModal';

type AdoptionEventTimelineProps = {
  events: AdoptionApplicationEvent[];
  canCreate: boolean;
  onCreate?: (payload: { event_date: string; description: string }) => Promise<void>;
};

const roleIcon = (role: UserRole) => {
  if (role === 'web_manager' || role === 'admin') return ShieldCheck;
  if (role === 'shelter_admin') return Building2;
  return UserCog;
};

export default function AdoptionEventTimeline({
  events,
  canCreate,
  onCreate,
}: AdoptionEventTimelineProps) {
  const t = useTranslations('adoption.events');
  const locale = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="rounded-2xl border border-border-primary bg-surface-primary p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-teal-500" />
          {t('timelineTitle')}
        </h3>
        {canCreate && onCreate && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
            data-testid="event-add-button"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('addEvent')}
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t('empty')}</p>
      ) : (
        <ol className="space-y-3" role="list">
          {events.map((event) => {
            const Icon = roleIcon(event.created_by_role);
            return (
              <li
                key={event.id}
                className="flex gap-3 rounded-xl border border-border-primary/70 bg-surface-secondary/40 p-4"
                data-testid="event-item"
              >
                <div className="h-9 w-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-medium text-text-primary">
                      {event.created_by_name}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {t(`role.${event.created_by_role}` as 'role.web_manager')}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {formatter.format(new Date(event.event_date))}
                  </p>
                  <p className="mt-2 text-sm text-text-primary whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {canCreate && onCreate && (
        <AdoptionEventCreateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={onCreate}
        />
      )}
    </section>
  );
}
