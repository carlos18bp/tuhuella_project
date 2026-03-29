'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Mail, Globe } from 'lucide-react';

import { useShelterStore } from '@/lib/stores/shelterStore';
import { ShelterGallery } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

export default function ShelterDetailPage() {
  const params = useParams();
  const shelterId = Number(params.shelterId);
  const t = useTranslations('shelterDetail');

  const shelter = useShelterStore((s) => s.shelter);
  const loading = useShelterStore((s) => s.loading);
  const fetchShelter = useShelterStore((s) => s.fetchShelter);

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

      {/* Cover Photo + Logo Overlay */}
      <div className="mt-4 relative">
        {shelter.cover_image_url ? (
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
            <Image
              src={shelter.cover_image_url}
              alt={shelter.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="rounded-2xl h-64 md:h-80 bg-gradient-to-br from-teal-500 to-teal-600" />
        )}

        {/* Logo as profile avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative h-24 w-24 rounded-full bg-surface-primary border-4 border-surface-primary shadow-lg flex items-center justify-center overflow-hidden">
            {shelter.logo_url ? (
              <Image src={shelter.logo_url} alt={`${shelter.name} logo`} fill sizes="96px" className="object-cover" />
            ) : (
              <span className="text-2xl font-bold text-teal-700">
                {shelter.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
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

        {/* Gallery Carousel */}
        {galleryUrls.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary mb-4">{t('gallery')}</h2>
            <ShelterGallery images={galleryUrls} shelterName={shelter.name} />
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

    </div>
  );
}
