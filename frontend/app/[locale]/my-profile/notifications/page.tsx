'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Bell } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { ROUTES } from '@/lib/constants';

const EVENT_GROUPS = [
  {
    titleKey: 'groupAdoption',
    events: ['adoption_submitted', 'adoption_status_changed', 'adoption_info_requested', 'adoption_interview_scheduled'],
  },
  {
    titleKey: 'groupShelter',
    events: ['shelter_invite_sent', 'shelter_invite_responded'],
  },
  {
    titleKey: 'groupDonations',
    events: ['donation_paid', 'donation_failed', 'sponsorship_paid', 'sponsorship_failed'],
  },
  {
    titleKey: 'groupCampaigns',
    events: ['campaign_update_published', 'campaign_goal_reached'],
  },
];

const CHANNELS = ['email', 'in_app'] as const;

export default function NotificationPreferencesPage() {
  useRequireAuth();
  const t = useTranslations('notifications');
  const preferences = useNotificationStore((s) => s.preferences);
  const initPreferences = useNotificationStore((s) => s.initPreferences);
  const updatePreference = useNotificationStore((s) => s.updatePreference);

  useEffect(() => {
    void initPreferences();
  }, [initPreferences]);

  const getPref = (eventKey: string, channel: string) => {
    return preferences.find((p) => p.event_key === eventKey && p.channel === channel);
  };

  const handleToggle = (eventKey: string, channel: string) => {
    const pref = getPref(eventKey, channel);
    if (pref) {
      void updatePreference(pref.id, !pref.enabled);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href={ROUTES.MY_PROFILE} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('backToProfile')}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <Bell className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('preferencesTitle')}</h1>
          <p className="text-sm text-text-tertiary">{t('preferencesSubtitle')}</p>
        </div>
      </div>

      <div className="space-y-8">
        {EVENT_GROUPS.map((group) => (
          <div key={group.titleKey}>
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-3">
              {t(group.titleKey)}
            </h2>
            <div className="rounded-2xl border border-border-primary bg-surface-primary overflow-hidden divide-y divide-border-tertiary">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_80px] px-5 py-3 bg-surface-secondary text-xs font-medium text-text-quaternary uppercase">
                <span>{t('event')}</span>
                {CHANNELS.map((ch) => (
                  <span key={ch} className="text-center">{t(`channel_${ch}`)}</span>
                ))}
              </div>
              {group.events.map((eventKey) => (
                <div key={eventKey} className="grid grid-cols-[1fr_80px_80px] px-5 py-3 items-center">
                  <span className="text-sm text-text-secondary">{t(`events.${eventKey}`)}</span>
                  {CHANNELS.map((ch) => {
                    const pref = getPref(eventKey, ch);
                    return (
                      <div key={ch} className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(eventKey, ch)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            pref?.enabled ? 'bg-teal-500' : 'bg-stone-200'
                          }`}
                          aria-label={`${t(`events.${eventKey}`)} ${t(`channel_${ch}`)}`}
                        >
                          <span className={`block w-4 h-4 bg-surface-primary rounded-full shadow-sm absolute top-0.5 transition-transform ${
                            pref?.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
