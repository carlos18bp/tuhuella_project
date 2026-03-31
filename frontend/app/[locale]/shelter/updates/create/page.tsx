'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

type SelectOption = { id: number; name?: string; title?: string };

export default function ShelterUpdateCreatePage() {
  useRequireAuth();
  const t = useTranslations('updates');
  const router = useRouter();

  const [shelter, setShelter] = useState<SelectOption | null>(null);
  const [campaigns, setCampaigns] = useState<SelectOption[]>([]);
  const [animals, setAnimals] = useState<SelectOption[]>([]);

  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const shelterRes = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        if (shelterRes.data.length > 0) {
          const s = shelterRes.data[0];
          setShelter(s);
          const [campRes, animRes] = await Promise.all([
            api.get(API_ENDPOINTS.CAMPAIGNS, { params: { shelter: s.id } }),
            api.get(API_ENDPOINTS.ANIMALS, { params: { shelter: s.id } }),
          ]);
          setCampaigns(campRes.data.results ?? campRes.data);
          setAnimals(animRes.data.results ?? animRes.data);
        }
      } catch {
        // ignore
      }
    };
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelter) return;
    setSubmitting(true);
    setError('');
    try {
      const payload: Record<string, any> = {
        shelter: shelter.id,
        title_es: titleEs,
        title_en: titleEn || titleEs,
        content_es: contentEs,
        content_en: contentEn || contentEs,
      };
      if (campaignId) payload.campaign = Number(campaignId);
      if (animalId) payload.animal = Number(animalId);

      await api.post(API_ENDPOINTS.UPDATE_CREATE, payload);
      router.push(ROUTES.SHELTER_UPDATES);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || t('errorCreating');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'mt-1 w-full rounded-xl border border-border-primary bg-surface-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] dark:shadow-none p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/20 outline-none';

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 min-w-0 overflow-x-hidden">
      <Link
        href={ROUTES.SHELTER_UPDATES}
        className="inline-flex items-center justify-center gap-1.5 min-h-11 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors mb-6 -ml-1 pl-1 pr-2 rounded-lg hover:bg-surface-hover/80 dark:hover:bg-surface-hover/50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToUpdates')}
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{t('createTitle')}</h1>
      <p className="mt-1 text-text-tertiary text-sm">{t('createSubtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary">{t('fieldTitleEs')} <span className="text-red-400">*</span></label>
          <input type="text" value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className={inputClasses} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">{t('fieldTitleEn')}</label>
          <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClasses} placeholder={t('optionalFallback')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">{t('fieldContentEs')} <span className="text-red-400">*</span></label>
          <textarea value={contentEs} onChange={(e) => setContentEs(e.target.value)} rows={5} className={inputClasses} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">{t('fieldContentEn')}</label>
          <textarea value={contentEn} onChange={(e) => setContentEn(e.target.value)} rows={5} className={inputClasses} placeholder={t('optionalFallback')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">{t('fieldCampaign')}</label>
            <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={inputClasses}>
              <option value="">{t('noCampaign')}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.title || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">{t('fieldAnimal')}</label>
            <select value={animalId} onChange={(e) => setAnimalId(e.target.value)} className={inputClasses}>
              <option value="">{t('noAnimal')}</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/25 dark:border-red-800/40 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !titleEs.trim() || !contentEs.trim()}
          className="w-full inline-flex items-center justify-center min-h-11 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? t('publishing') : t('publishButton')}
        </button>
      </form>
    </div>
  );
}
