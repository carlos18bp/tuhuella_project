'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

type UpdatePostItem = {
  id: number;
  title: string;
  shelter: number;
  shelter_name: string;
  campaign: number | null;
  animal: number | null;
  image_url: string | null;
  created_at: string;
};

export default function ShelterUpdatesPage() {
  useRequireAuth();
  const locale = useLocale();
  const t = useTranslations('updates');
  const [updates, setUpdates] = useState<UpdatePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shelterIds, setShelterIds] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const shelterRes = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        const ids = shelterRes.data.map((s: any) => s.id);
        setShelterIds(ids);
        if (ids.length > 0) {
          const res = await api.get(API_ENDPOINTS.UPDATES, { params: { shelter: ids[0], lang: locale } });
          setUpdates(res.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [locale]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await api.delete(API_ENDPOINTS.UPDATE_DELETE(id));
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.SHELTER_DASHBOARD} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('backToDashboard')}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('shelterTitle')}</h1>
          <p className="mt-1 text-text-tertiary">{t('shelterSubtitle')}</p>
        </div>
        <Link
          href={ROUTES.SHELTER_UPDATES_CREATE}
          className="bg-teal-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors text-center"
        >
          + {t('createNew')}
        </Link>
      </div>

      {loading ? (
        <div role="status" aria-label="loading" className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        <p className="mt-8 text-text-quaternary">{t('noUpdates')}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {updates.map((update) => (
            <div key={update.id} role="article" className="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm">
              <div className="flex gap-4">
                {update.image_url && (
                  <img src={update.image_url} alt={update.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">{update.title}</h3>
                  <p className="text-xs text-text-quaternary mt-1">
                    {new Date(update.created_at).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(update.id)}
                  className="text-text-quaternary hover:text-red-500 transition-colors self-start p-1"
                  title={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
