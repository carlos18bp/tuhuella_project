'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  ClipboardList,
  Megaphone,
  Plus,
  ChevronRight,
  Zap,
  Clock,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { api } from '@/lib/services/http';

const PLACEHOLDER = '\u2014';

type Counts = {
  pendingShelters: number | null;
  submittedApplications: number | null;
  pendingCampaigns: number | null;
};

const INITIAL_COUNTS: Counts = {
  pendingShelters: null,
  submittedApplications: null,
  pendingCampaigns: null,
};

function formatStat(value: number | null): string {
  if (value === null) return PLACEHOLDER;
  return value.toLocaleString();
}

async function fetchCount(endpoint: string, params: Record<string, string>): Promise<number | null> {
  try {
    const qs = new URLSearchParams({ ...params, page_size: '1' }).toString();
    const res = await api.get<{ count: number }>(`${endpoint}?${qs}`);
    return res.data.count ?? 0;
  } catch {
    return null;
  }
}

export default function WebManagerProfileSection() {
  const t = useTranslations('webManager');
  const tEdit = useTranslations('editProfile');
  const [counts, setCounts] = useState<Counts>(INITIAL_COUNTS);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchCount(API_ENDPOINTS.ADMIN_SHELTERS_ALL, { verification_status: 'pending' }),
      fetchCount(API_ENDPOINTS.ADMIN_APPLICATIONS, { status: 'submitted' }),
      fetchCount(API_ENDPOINTS.ADMIN_CAMPAIGNS, { approval_status: 'pending' }),
    ]).then(([pendingShelters, submittedApplications, pendingCampaigns]) => {
      if (cancelled) return;
      setCounts({ pendingShelters, submittedApplications, pendingCampaigns });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      icon: Clock,
      value: formatStat(counts.pendingShelters),
      label: t('pendingShelters'),
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      href: ROUTES.WEB_MANAGER_SHELTERS,
    },
    {
      icon: ClipboardList,
      value: formatStat(counts.submittedApplications),
      label: t('submittedApplications'),
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
      href: ROUTES.WEB_MANAGER_APPLICATIONS,
    },
    {
      icon: Megaphone,
      value: formatStat(counts.pendingCampaigns),
      label: t('pendingCampaigns'),
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      href: ROUTES.WEB_MANAGER_CAMPAIGNS,
    },
  ];

  const quickActions = [
    {
      icon: Building2,
      label: t('sheltersTitle'),
      href: ROUTES.WEB_MANAGER_SHELTERS,
    },
    {
      icon: ClipboardList,
      label: t('applicationsTitle'),
      href: ROUTES.WEB_MANAGER_APPLICATIONS,
    },
    {
      icon: Megaphone,
      label: t('campaignsTitle'),
      href: ROUTES.WEB_MANAGER_CAMPAIGNS,
    },
    {
      icon: Plus,
      label: t('newCampaign'),
      href: ROUTES.WEB_MANAGER_CAMPAIGN_NEW,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-primary bg-teal-50/50 dark:bg-teal-900/10">
          <div className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-base font-bold text-text-primary">{t('overviewTitle')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group rounded-xl bg-surface-secondary p-4 text-center transition-shadow hover:shadow-sm"
                >
                  <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{stat.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-primary">
          <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-base font-bold text-text-primary">{tEdit('quickActions')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label + action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-border-primary bg-surface-primary px-4 py-3 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">
                    <Icon className="h-4 w-4 text-text-tertiary group-hover:text-teal-600 transition-colors" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
