'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MapPin, Phone, Mail, Globe, X } from 'lucide-react';

import { useShelterStore } from '@/lib/stores/shelterStore';
import { ROUTES } from '@/lib/constants';

export default function ShelterDetailPage() {
  const params = useParams();
  const shelterId = Number(params.shelterId);
  const t = useTranslations('shelterDetail');

  const shelter = useShelterStore((s) => s.shelter);
  const loading = useShelterStore((s) => s.loading);
  const fetchShelter = useShelterStore((s) => s.fetchShelter);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (shelterId) void fetchShelter(shelterId);
  }, [shelterId, fetchShelter]);

  if (loading || !shelter) {
    return (
      <div role="status" aria-label="loading" className="mx-auto max-w-[1400px] px-6 py-10 space-y-4">
        <div className="h-64 animate-shimmer rounded-2xl" />
        <div className="h-8 animate-shimmer rounded w-1/3" />
        <div className="h-4 animate-shimmer rounded w-1/2" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-4 h-20 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const galleryUrls = shelter.gallery_urls ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.SHELTERS} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t('backToShelters')}
      </Link>

      {/* Cover Photo */}
      {shelter.cover_image_url && (
        <div className="mt-4 rounded-2xl overflow-hidden">
          <img
            src={shelter.cover_image_url}
            alt={shelter.name}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      )}

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-text-primary">{shelter.name}</h1>
        {shelter.city && (
          <div className="flex items-center gap-1.5 mt-1 text-text-tertiary">
            <MapPin className="h-4 w-4 text-text-quaternary" />
            {shelter.city}
          </div>
        )}
        {shelter.description && (
          <p className="mt-4 text-text-secondary leading-relaxed max-w-3xl">{shelter.description}</p>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelter.phone && (
            <div className="rounded-xl border border-border-primary p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-text-quaternary" />
                <p className="text-xs text-text-tertiary">{t('phone')}</p>
              </div>
              <p className="text-sm font-medium text-text-secondary mt-1.5">{shelter.phone}</p>
            </div>
          )}
          {shelter.email && (
            <div className="rounded-xl border border-border-primary p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-quaternary" />
                <p className="text-xs text-text-tertiary">{t('email')}</p>
              </div>
              <p className="text-sm font-medium text-text-secondary mt-1.5">{shelter.email}</p>
            </div>
          )}
          {shelter.website && (
            <div className="rounded-xl border border-border-primary p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-text-quaternary" />
                <p className="text-xs text-text-tertiary">{t('website')}</p>
              </div>
              <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal-600 mt-1.5 hover:underline block">
                {shelter.website}
              </a>
            </div>
          )}
        </div>

        {/* Gallery */}
        {galleryUrls.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary mb-4">{t('gallery')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="rounded-xl overflow-hidden aspect-square hover:opacity-90 transition-opacity"
                >
                  <img src={url} alt={`${shelter.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`${ROUTES.ANIMALS}?shelter=${shelter.id}`}
            className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm inline-block"
          >
            {t('viewAnimals')}
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div role="dialog" aria-label="Lightbox" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-stone-300" onClick={() => setLightboxIndex(null)}>
            <X className="h-8 w-8" />
          </button>
          <img
            src={galleryUrls[lightboxIndex]}
            alt=""
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
