'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Heart, ArrowLeft, Weight, Zap, BatteryLow, Flame,
  Palette, Home, Cpu, Baby, Dog, Cat, Share2, Check,
} from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { AnimalGallery, Container, FAQAccordion, SimilarAnimals } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import {
  animalAmberStatusBadgeClass,
  animalCompatibilityYesClass,
  animalEmeraldHealthPillClass,
  animalHouseTrainedRowClass,
  animalSpecialNeedsBodyClass,
  animalSpecialNeedsCalloutClass,
  animalSpecialNeedsTitleClass,
  ctaAmberOutlineClass,
} from '@/lib/ui/pastelAccent';
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
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: animal?.name ?? '', url });
      } catch {
        // user cancelled or error — no action needed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }, [animal?.name]);

  useEffect(() => {
    if (animalId) void fetchAnimal(animalId, locale);
  }, [animalId, fetchAnimal, locale]);

  useEffect(() => {
    if (isAuthenticated) void fetchFavorites();
  }, [isAuthenticated, fetchFavorites]);

  if (loading || !animal) {
    return (
      <Container className="py-10">
        <div data-testid="loading-skeleton" className="space-y-6">
          <div className="h-8 animate-shimmer rounded w-1/3" />
          <div className="aspect-video animate-shimmer rounded-2xl" />
          <div className="h-4 animate-shimmer rounded w-2/3" />
        </div>
      </Container>
    );
  }

  const genderLabel = animal.gender === 'male' ? t('male') : animal.gender === 'female' ? t('female') : t('unknown');

  const energyIcons = { low: BatteryLow, medium: Zap, high: Flame };
  const energyLabels = { low: t('energyLow'), medium: t('energyMedium'), high: t('energyHigh') };
  const EnergyIcon = energyIcons[animal.energy_level] ?? Zap;

  const compatibilityColor = (v: AnimalCompatibility) =>
    v === 'yes'
      ? animalCompatibilityYesClass
      : v === 'no'
        ? 'bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-800/40'
        : 'bg-stone-100 text-stone-500 ring-stone-200/60 dark:bg-surface-tertiary dark:text-text-tertiary dark:ring-border-primary';

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
    <Container className="py-10 min-w-0 overflow-x-hidden">
      <Link
        href={ROUTES.ANIMALS}
        className="inline-flex items-center justify-center gap-1.5 min-h-11 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors -ml-1 pl-1 pr-2 rounded-lg hover:bg-surface-hover/80 dark:hover:bg-surface-hover/50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToAnimals')}
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-text-primary">{animal.name}</h1>
                {animal.status === 'in_process' && (
                  <span data-testid="status-badge" className={animalAmberStatusBadgeClass}>
                    {t('adoptionInProgress')}
                  </span>
                )}
              </div>
              <p className="text-text-tertiary mt-1">
                <Link href={`/shelter/${animal.shelter}`} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors underline-offset-2 hover:underline">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('share')}
                onClick={() => { void handleShare(); }}
                className="min-h-11 min-w-11 p-2.5 rounded-full bg-surface-tertiary text-text-quaternary hover:bg-surface-hover transition-all duration-200 shadow-sm relative inline-flex items-center justify-center"
              >
                {shareCopied
                  ? <Check className="h-5 w-5 text-emerald-500" />
                  : <Share2 className="h-5 w-5" />}
              </button>
              {isAuthenticated && (() => {
                const favorited = favorites.some((f) => f.animal === animal.id);
                return (
                  <button
                    type="button"
                    aria-label="favorite"
                    onClick={() => toggleFavorite(animal.id)}
                    className={`min-h-11 min-w-11 p-2.5 rounded-full transition-all duration-200 shadow-sm inline-flex items-center justify-center ${
                      favorited
                        ? 'bg-red-50 text-red-500 dark:bg-red-950/35 dark:text-red-400'
                        : 'bg-surface-tertiary text-text-quaternary hover:bg-surface-hover'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
                  </button>
                );
              })()}
            </div>
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
              <span className={animalEmeraldHealthPillClass}>{t('vaccinated')}</span>
            )}
            {animal.is_sterilized && (
              <span className={animalEmeraldHealthPillClass}>{t('sterilized')}</span>
            )}
          </div>

          {animal.description && (
            <p className="mt-6 text-text-secondary leading-relaxed">{animal.description}</p>
          )}

          {animal.special_needs && (
            <div className={animalSpecialNeedsCalloutClass}>
              <p className={animalSpecialNeedsTitleClass}>{t('specialNeeds')}</p>
              <p className={animalSpecialNeedsBodyClass}>{animal.special_needs}</p>
            </div>
          )}

          {/* Details section */}
          {showDetails && (
            <div data-testid="details-section" className="mt-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('detailsTitle')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {animal.weight && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Weight className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <p className="text-xs text-text-tertiary">{t('weight')}</p>
                      <p className="text-sm font-medium text-text-primary">{t('weightUnit', { value: animal.weight })}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                  <EnergyIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <p className="text-xs text-text-tertiary">{t('energyLevel')}</p>
                    <p className="text-sm font-medium text-text-primary">{energyLabels[animal.energy_level]}</p>
                  </div>
                </div>
                {animal.coat_color && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Palette className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <p className="text-xs text-text-tertiary">{t('coatColor')}</p>
                      <p className="text-sm font-medium text-text-primary">{animal.coat_color}</p>
                    </div>
                  </div>
                )}
                {animal.is_house_trained && (
                  <div className={animalHouseTrainedRowClass}>
                    <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('houseTrained')}</p>
                  </div>
                )}
                {animal.microchip_id && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary">
                    <Cpu className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
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

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={ROUTES.ADOPT(animal.id)}
                  className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
                >
                  {t('adoptButton')}
                </Link>
                <Link
                  href={`${ROUTES.CHECKOUT_SPONSORSHIP}?animal=${animal.id}`}
                  className={ctaAmberOutlineClass}
                >
                  {t('sponsorButton')}
                </Link>
              </>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
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
        <div className="mt-10 md:mt-16 border-t border-border-primary pt-2">
          <FAQAccordion
            items={adoptionFaqs}
            title={tCommon('faq')}
            subtitle={t('faqSubtitle')}
          />
        </div>
      )}
    </Container>
  );
}
