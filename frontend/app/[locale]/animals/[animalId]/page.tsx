'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Heart, ArrowLeft, Weight, Zap, BatteryLow, Flame,
  Palette, Home, Cpu, Baby, Dog, Cat,
} from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { AnimalGallery, FAQAccordion, SimilarAnimals } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import type { AnimalCompatibility } from '@/lib/types';

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function monthsAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)));
}

export default function AnimalDetailPage() {
  const params = useParams();
  const animalId = Number(params.animalId);
  const locale = useLocale();
  const t = useTranslations('animals');
  const tCommon = useTranslations('common');

  const animal = useAnimalStore((s) => s.animal);
  const loading = useAnimalStore((s) => s.loading);
  const fetchAnimal = useAnimalStore((s) => s.fetchAnimal);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);
  const { items: adoptionFaqs } = useFAQsByTopic('adoption');

  useEffect(() => {
    if (animalId) void fetchAnimal(animalId, locale);
  }, [animalId, fetchAnimal, locale]);

  useEffect(() => {
    if (isAuthenticated) void fetchFavorites();
  }, [isAuthenticated, fetchFavorites]);

  if (loading || !animal) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div data-testid="loading-skeleton" className="space-y-6">
          <div className="h-8 animate-shimmer rounded w-1/3" />
          <div className="aspect-video animate-shimmer rounded-2xl" />
          <div className="h-4 animate-shimmer rounded w-2/3" />
        </div>
      </div>
    );
  }

  const genderLabel = animal.gender === 'male' ? t('male') : animal.gender === 'female' ? t('female') : t('unknown');

  const energyIcons = { low: BatteryLow, medium: Zap, high: Flame };
  const energyLabels = { low: t('energyLow'), medium: t('energyMedium'), high: t('energyHigh') };
  const EnergyIcon = energyIcons[animal.energy_level] ?? Zap;

  const compatibilityColor = (v: AnimalCompatibility) =>
    v === 'yes' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
      : v === 'no' ? 'bg-red-50 text-red-700 ring-red-200/60'
        : 'bg-stone-100 text-stone-500 ring-stone-200/60';

  const compatibilityLabel = (v: AnimalCompatibility) =>
    v === 'yes' ? t('compatibilityYes') : v === 'no' ? t('compatibilityNo') : t('compatibilityUnknown');

  const showCompatibility =
    animal.good_with_kids !== 'unknown' ||
    animal.good_with_dogs !== 'unknown' ||
    animal.good_with_cats !== 'unknown';

  const showDetails =
    animal.weight || animal.energy_level || animal.coat_color ||
    animal.is_house_trained || animal.microchip_id;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.ANIMALS} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t('backToAnimals')}
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <AnimalGallery
          images={animal.gallery_urls ?? []}
          species={animal.species}
          name={animal.name}
        />

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-text-primary">{animal.name}</h1>
                {animal.status === 'in_process' && (
                  <span data-testid="status-badge" className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 font-medium">
                    {t('adoptionInProgress')}
                  </span>
                )}
              </div>
              <p className="text-text-tertiary mt-1">
                <Link href={`/shelter/${animal.shelter}`} className="hover:text-teal-600 transition-colors underline-offset-2 hover:underline">
                  {animal.shelter_name}
                </Link>
                {' · '}{animal.shelter_city}
              </p>
              <p className="text-xs text-text-quaternary mt-1">
                {t('publishedAgo', { days: daysAgo(animal.created_at) })}
              </p>
              {animal.intake_date && (
                <p data-testid="intake-date" className="text-xs text-text-quaternary mt-0.5">
                  {t('inShelterSince', { months: monthsAgo(animal.intake_date) })}
                </p>
              )}
            </div>
            {isAuthenticated && (() => {
              const favorited = favorites.some((f) => f.animal === animal.id);
              return (
                <button
                  type="button"
                  aria-label="favorite"
                  onClick={() => toggleFavorite(animal.id)}
                  className={`p-2.5 rounded-full transition-all duration-200 shadow-sm ${
                    favorited ? 'bg-red-50 text-red-500' : 'bg-surface-tertiary text-text-quaternary hover:bg-surface-hover'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
                </button>
              );
            })()}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary ring-1 ring-border-primary/60">{animal.breed}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary ring-1 ring-border-primary/60">{animal.age_range}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary ring-1 ring-border-primary/60">{animal.size}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary ring-1 ring-border-primary/60">
              {genderLabel}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {animal.is_vaccinated && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">{t('vaccinated')}</span>
            )}
            {animal.is_sterilized && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">{t('sterilized')}</span>
            )}
          </div>

          {animal.description && (
            <p className="mt-6 text-text-secondary leading-relaxed">{animal.description}</p>
          )}

          {animal.special_needs && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 ring-1 ring-amber-200/60">
              <p className="text-sm font-medium text-amber-800">{t('specialNeeds')}</p>
              <p className="text-sm text-amber-700 mt-1">{animal.special_needs}</p>
            </div>
          )}

          {/* Details section */}
          {showDetails && (
            <div data-testid="details-section" className="mt-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('detailsTitle')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {animal.weight && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Weight className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-text-tertiary">{t('weight')}</p>
                      <p className="text-sm font-medium text-text-primary">{t('weightUnit', { value: animal.weight })}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                  <EnergyIcon className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs text-text-tertiary">{t('energyLevel')}</p>
                    <p className="text-sm font-medium text-text-primary">{energyLabels[animal.energy_level]}</p>
                  </div>
                </div>
                {animal.coat_color && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Palette className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-text-tertiary">{t('coatColor')}</p>
                      <p className="text-sm font-medium text-text-primary">{animal.coat_color}</p>
                    </div>
                  </div>
                )}
                {animal.is_house_trained && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50">
                    <Home className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium text-emerald-700">{t('houseTrained')}</p>
                  </div>
                )}
                {animal.microchip_id && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Cpu className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-text-tertiary">{t('microchip')}</p>
                      <p className="text-sm font-medium text-text-primary">{animal.microchip_id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compatibility section */}
          {showCompatibility && (
            <div data-testid="compatibility-section" className="mt-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">{t('compatibilityTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ring-1 font-medium ${compatibilityColor(animal.good_with_kids)}`}>
                  <Baby className="h-3.5 w-3.5" />
                  {t('kids')}: {compatibilityLabel(animal.good_with_kids)}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ring-1 font-medium ${compatibilityColor(animal.good_with_dogs)}`}>
                  <Dog className="h-3.5 w-3.5" />
                  {t('dogs')}: {compatibilityLabel(animal.good_with_dogs)}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ring-1 font-medium ${compatibilityColor(animal.good_with_cats)}`}>
                  <Cat className="h-3.5 w-3.5" />
                  {t('cats')}: {compatibilityLabel(animal.good_with_cats)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={ROUTES.ADOPT(animal.id)}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
                >
                  {t('adoptButton')}
                </Link>
                <Link
                  href={`${ROUTES.CHECKOUT_SPONSORSHIP}?animal=${animal.id}`}
                  className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 btn-base"
                >
                  {t('sponsorButton')}
                </Link>
              </>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
              >
                {t('signInToAdopt')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Similar animals */}
      <SimilarAnimals animalId={animalId} />

      {/* FAQ section */}
      {adoptionFaqs.length > 0 && (
        <div className="mt-16 border-t border-border-primary pt-2">
          <FAQAccordion
            items={adoptionFaqs}
            title={tCommon('faq')}
            subtitle={t('faqSubtitle')}
          />
        </div>
      )}
    </div>
  );
}
