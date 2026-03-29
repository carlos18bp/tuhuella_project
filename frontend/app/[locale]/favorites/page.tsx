'use client';

import { useEffect, useState, useCallback, useMemo, useRef, type ReactElement } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Heart, HeartOff, LayoutGrid, List, PawPrint, Dog, Cat, ChevronDown,
  StickyNote, X, Check, HelpCircle, ArrowRight,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { ROUTES } from '@/lib/constants';
import AnimalCard from '@/components/ui/AnimalCard';
import type { Favorite, Animal, AnimalSpecies, AnimalSize } from '@/lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function favoriteToAnimal(fav: Favorite): Animal {
  return {
    id: fav.animal,
    name: fav.animal_name,
    species: fav.animal_species,
    breed: fav.breed || '',
    age_range: fav.age_range || 'adult',
    gender: fav.gender || 'unknown',
    size: fav.size || 'medium',
    status: fav.status || 'published',
    is_vaccinated: fav.is_vaccinated ?? false,
    is_sterilized: fav.is_sterilized ?? false,
    is_house_trained: false,
    good_with_kids: 'unknown',
    good_with_dogs: 'unknown',
    good_with_cats: 'unknown',
    energy_level: 'medium',
    shelter: 0,
    shelter_name: fav.shelter_name,
    shelter_city: fav.shelter_city,
    gallery_urls: fav.thumbnail_url ? [fav.thumbnail_url] : [],
    created_at: fav.created_at,
  } as Animal;
}

function getStatusBadge(status: string, t: (key: string) => string) {
  switch (status) {
    case 'adopted':
      return { label: t('statusAdopted'), className: 'bg-red-500 text-white' };
    case 'in_process':
      return { label: t('statusInProcess'), className: 'bg-amber-500 text-white' };
    case 'archived':
    case 'draft':
      return { label: t('statusUnavailable'), className: 'bg-stone-400 text-white' };
    default:
      return null;
  }
}

function getRelativeDate(dateStr: string, t: (key: string, values?: Record<string, string | number | Date>) => string) {
  const now = new Date();
  const saved = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - saved.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('savedToday');
  if (diffDays === 1) return t('savedYesterday');
  return t('savedDaysAgo', { days: diffDays });
}

type SortOption = 'recent' | 'name_asc' | 'name_desc' | 'species';

function sortFavorites(list: Favorite[], sortBy: SortOption): Favorite[] {
  const sorted = [...list];
  switch (sortBy) {
    case 'name_asc':
      return sorted.sort((a, b) => a.animal_name.localeCompare(b.animal_name));
    case 'name_desc':
      return sorted.sort((a, b) => b.animal_name.localeCompare(a.animal_name));
    case 'species':
      return sorted.sort((a, b) => a.animal_species.localeCompare(b.animal_species));
    default:
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RemoveFavoriteButton({ animalId, onRemoved }: { animalId: number; onRemoved: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const t = useTranslations('favorites');

  const handleRemove = async () => {
    await toggleFavorite(animalId);
    onRemoved();
  };

  if (confirming) {
    return (
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-surface-elevated/95 backdrop-blur-md rounded-lg px-2 py-1.5 shadow-lg ring-1 ring-border-primary">
        <span className="text-xs text-text-secondary mr-1">{t('confirmRemove')}</span>
        <button type="button" onClick={handleRemove} className="text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors">
          {t('yes')}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-xs px-2 py-0.5 rounded bg-surface-hover text-text-secondary hover:bg-surface-tertiary transition-colors">
          {t('no')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true); }}
      className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-surface-elevated/90 backdrop-blur-md shadow-sm ring-1 ring-border-primary flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
      aria-label={t('removeFromFavorites')}
    >
      <HeartOff className="h-4 w-4" />
    </button>
  );
}

function FavoriteNote({ favoriteId, initialNote }: { favoriteId: number; initialNote: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(initialNote);
  const updateFavoriteNote = useFavoriteStore((s) => s.updateFavoriteNote);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const t = useTranslations('favorites');

  const handleChange = (value: string) => {
    setNote(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void updateFavoriteNote(favoriteId, value);
    }, 500);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="px-5 pb-2">
      <button
        type="button"
        aria-label="Nota"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1 text-xs transition-colors ${note ? 'text-teal-600' : 'text-text-quaternary hover:text-text-tertiary'}`}
      >
        <StickyNote className="h-3 w-3" fill={note ? 'currentColor' : 'none'} />
        {!open && note && <span className="truncate max-w-[120px]">{note}</span>}
      </button>
      {open && (
        <textarea
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('addNote')}
          className="mt-1 w-full text-xs p-2 rounded-lg border border-border-primary bg-surface-secondary text-text-secondary placeholder:text-text-quaternary resize-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
          rows={2}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />
      )}
    </div>
  );
}

function FavoriteGridCard({ fav, fadingOut, compareSelected, onToggleCompare }: {
  fav: Favorite; fadingOut: number | null; compareSelected: boolean; onToggleCompare: (id: number) => void;
}) {
  const t = useTranslations('favorites');
  const badge = getStatusBadge(fav.status, t);
  const isUnavailable = fav.status === 'adopted' || fav.status === 'archived' || fav.status === 'draft';
  const isFadingOut = fadingOut === fav.animal;

  return (
    <div className={`relative transition-all duration-300 ${isFadingOut ? 'opacity-0 scale-95' : 'opacity-100'} ${isUnavailable ? 'opacity-60' : ''} ${compareSelected ? 'ring-2 ring-teal-500 rounded-2xl' : ''}`}>
      {badge && (
        <div className={`absolute top-2 left-2 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${badge.className}`}>
          {badge.label}
        </div>
      )}
      {/* Compare checkbox */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(fav.animal); }}
        className={`absolute top-2 left-2 z-10 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${
          badge ? 'top-10' : 'top-2'
        } ${compareSelected ? 'bg-teal-600 border-teal-600 text-white' : 'bg-surface-elevated/90 border-border-primary text-transparent hover:border-teal-400'}`}
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <RemoveFavoriteButton animalId={fav.animal} onRemoved={() => {}} />
      <AnimalCard animal={favoriteToAnimal(fav)} />
      <div className="px-5 pb-1 -mt-1 flex items-center text-xs text-text-quaternary">
        <span>{fav.shelter_city && `${fav.shelter_city} · `}{getRelativeDate(fav.created_at, t)}</span>
      </div>
      <FavoriteNote favoriteId={fav.id} initialNote={fav.note} />
    </div>
  );
}

function FavoriteListRow({ fav, fadingOut }: { fav: Favorite; fadingOut: number | null }) {
  const t = useTranslations('favorites');
  const tAnimals = useTranslations('animals');
  const badge = getStatusBadge(fav.status, t);
  const isUnavailable = fav.status === 'adopted' || fav.status === 'archived' || fav.status === 'draft';
  const isFadingOut = fadingOut === fav.animal;
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const SpeciesIcon = fav.animal_species === 'dog' ? Dog : fav.animal_species === 'cat' ? Cat : PawPrint;

  return (
    <div className={`relative flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-primary shadow-sm transition-all duration-300 ${isFadingOut ? 'opacity-0 scale-95' : 'opacity-100'} ${isUnavailable ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <Link href={ROUTES.ANIMAL_DETAIL(fav.animal)} className="shrink-0">
        <div className="h-12 w-12 rounded-lg bg-surface-tertiary flex items-center justify-center overflow-hidden">
          {fav.thumbnail_url ? (
            <img src={fav.thumbnail_url} alt={fav.animal_name} className="h-full w-full object-cover" />
          ) : (
            <SpeciesIcon className="h-5 w-5 text-text-quaternary" />
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={ROUTES.ANIMAL_DETAIL(fav.animal)} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary truncate">{fav.animal_name}</h3>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">
          {fav.breed && `${fav.breed} · `}{fav.animal_species === 'dog' ? tAnimals('dogs') : fav.animal_species === 'cat' ? tAnimals('cats') : tAnimals('others')} · {fav.size} · {fav.age_range}
        </p>
      </Link>

      {/* Shelter + city */}
      <div className="hidden sm:block text-xs text-text-quaternary text-right shrink-0">
        <p>{fav.shelter_name}</p>
        {fav.shelter_city && <p>{fav.shelter_city}</p>}
      </div>

      {/* Health badges */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {fav.is_vaccinated && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">{tAnimals('vaccinated')}</span>
        )}
        {fav.is_sterilized && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">{tAnimals('sterilized')}</span>
        )}
      </div>

      {/* Date */}
      <span className="hidden lg:block text-xs text-text-quaternary shrink-0">
        {getRelativeDate(fav.created_at, t)}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => void toggleFavorite(fav.animal)}
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
        aria-label={t('removeFromFavorites')}
      >
        <HeartOff className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compare Modal
// ---------------------------------------------------------------------------

function CompareModal({ favorites, selected, onClose }: { favorites: Favorite[]; selected: number[]; onClose: () => void }) {
  const t = useTranslations('favorites');
  const tAnimals = useTranslations('animals');
  const items = selected.map((id) => favorites.find((f) => f.animal === id)).filter(Boolean) as Favorite[];

  const rows: { label: string; values: (string | ReactElement)[] }[] = [
    { label: tAnimals('speciesFilter'), values: items.map((f) => f.animal_species === 'dog' ? tAnimals('dogs') : f.animal_species === 'cat' ? tAnimals('cats') : tAnimals('others')) },
    { label: tAnimals('breed') || 'Raza', values: items.map((f) => f.breed || '—') },
    { label: tAnimals('ageFilter'), values: items.map((f) => f.age_range || '—') },
    { label: tAnimals('sizeFilter'), values: items.map((f) => f.size || '—') },
    { label: tAnimals('vaccinated'), values: items.map((f) => f.is_vaccinated ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-red-400 mx-auto" />) },
    { label: tAnimals('sterilized'), values: items.map((f) => f.is_sterilized ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-red-400 mx-auto" />) },
    { label: 'Shelter', values: items.map((f) => `${f.shelter_name}${f.shelter_city ? ` · ${f.shelter_city}` : ''}`) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-primary rounded-2xl border border-border-primary shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border-primary">
          <h2 className="text-lg font-bold text-text-primary">{t('comparePlural', { count: items.length })}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="h-5 w-5 text-text-tertiary" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header with animal names */}
            <thead>
              <tr className="border-b border-border-primary">
                <th className="p-3 text-left text-text-quaternary font-medium w-32" />
                {items.map((f) => (
                  <th key={f.animal} className="p-3 text-center">
                    <Link href={ROUTES.ANIMAL_DETAIL(f.animal)} className="font-semibold text-teal-700 hover:text-teal-600">
                      {f.animal_name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-surface-secondary/50' : ''}>
                  <td className="p-3 text-text-quaternary font-medium text-xs">{row.label}</td>
                  {row.values.map((val, j) => (
                    <td key={j} className="p-3 text-center text-text-secondary">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center gap-3 p-4 border-t border-border-primary">
          {items.map((f) => (
            <Link
              key={f.animal}
              href={ROUTES.ANIMAL_DETAIL(f.animal)}
              className="text-xs px-4 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium"
            >
              {f.animal_name} <ArrowRight className="h-3 w-3 inline ml-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FavoritosPage() {
  const favorites = useFavoriteStore((s) => s.favorites);
  const loading = useFavoriteStore((s) => s.loading);
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);
  const t = useTranslations('favorites');

  const animals = useAnimalStore((s) => s.animals);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);

  const [fadingOut, setFadingOut] = useState<number | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<'' | AnimalSpecies>('');
  const [sizeFilter, setSizeFilter] = useState<'' | AnimalSize>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [compareSelected, setCompareSelected] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fav_view') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  // Fetch popular animals for empty state
  useEffect(() => {
    if (!loading && favorites.length === 0) {
      void fetchAnimals({});
    }
  }, [loading, favorites.length, fetchAnimals]);

  useEffect(() => {
    localStorage.setItem('fav_view', viewMode);
  }, [viewMode]);

  const hasActiveFilters = speciesFilter !== '' || sizeFilter !== '';

  const filteredFavorites = useMemo(() => {
    let result = favorites;
    if (speciesFilter) result = result.filter((f) => f.animal_species === speciesFilter);
    if (sizeFilter) result = result.filter((f) => f.size === sizeFilter);
    return sortFavorites(result, sortBy);
  }, [favorites, speciesFilter, sizeFilter, sortBy]);

  const handleRemoved = useCallback((animalId: number) => {
    setFadingOut(animalId);
    setTimeout(() => setFadingOut(null), 300);
  }, []);

  const clearFilters = () => {
    setSpeciesFilter('');
    setSizeFilter('');
  };

  const handleToggleCompare = useCallback((animalId: number) => {
    setCompareSelected((prev) => {
      if (prev.includes(animalId)) return prev.filter((id) => id !== animalId);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, animalId];
    });
  }, []);

  const speciesOptions: { value: '' | AnimalSpecies; label: string; icon?: typeof Dog }[] = [
    { value: '', label: t('allSpecies') },
    { value: 'dog', label: t('dogs'), icon: Dog },
    { value: 'cat', label: t('cats'), icon: Cat },
    { value: 'other', label: t('others'), icon: PawPrint },
  ];

  const sizeOptions: { value: '' | AnimalSize; label: string }[] = [
    { value: '', label: t('allSizes') },
    { value: 'small', label: t('small') },
    { value: 'medium', label: t('medium') },
    { value: 'large', label: t('large') },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: t('sortRecent') },
    { value: 'name_asc', label: t('sortNameAZ') },
    { value: 'name_desc', label: t('sortNameZA') },
    { value: 'species', label: t('sortSpecies') },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('title')}{favorites.length > 0 && ` (${favorites.length})`}
          </h1>
          <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary bg-surface-primary overflow-hidden">
              <div className="aspect-[4/3] animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 animate-shimmer rounded w-2/3" />
                <div className="h-3 animate-shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        /* Empty state */
        <div className="mt-10">
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto" />
            <p className="mt-3 text-text-quaternary text-lg">{t('empty')}</p>
            <Link
              href={ROUTES.ANIMALS}
              className="mt-4 inline-block bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm"
            >
              {t('exploreAnimals')} &rarr;
            </Link>
          </div>
          {/* Popular animals carousel */}
          {animals.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('popularAnimals')}</h2>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: true }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="pb-12"
              >
                {animals.slice(0, 8).map((animal) => (
                  <SwiperSlide key={animal.id}>
                    <AnimalCard animal={animal} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters toolbar */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Species filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {speciesOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeciesFilter(opt.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    speciesFilter === opt.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {opt.icon && <opt.icon className="h-3 w-3" />}
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Size filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSizeFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sizeFilter === opt.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border-primary bg-surface-primary text-xs text-text-secondary focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-quaternary pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border-primary bg-surface-primary p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'text-text-quaternary hover:text-text-secondary'}`}
                aria-label={t('gridView')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'text-text-quaternary hover:text-text-secondary'}`}
                aria-label={t('listView')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results info */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-xs text-text-quaternary">
              <span>{t('results', { count: filteredFavorites.length })}</span>
              <button type="button" onClick={clearFilters} className="text-teal-600 hover:text-teal-700 font-medium">
                {t('clearFilters')}
              </button>
            </div>
          )}

          {/* Content */}
          {filteredFavorites.length === 0 ? (
            <div className="mt-10 text-center py-12">
              <PawPrint className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="mt-3 text-text-quaternary">{t('noResults')}</p>
              <button type="button" onClick={clearFilters} className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t('clearFilters')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((fav) => (
                <FavoriteGridCard
                  key={fav.id}
                  fav={fav}
                  fadingOut={fadingOut}
                  compareSelected={compareSelected.includes(fav.animal)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {filteredFavorites.map((fav) => (
                <FavoriteListRow key={fav.id} fav={fav} fadingOut={fadingOut} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Compare floating bar */}
      {compareSelected.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-full bg-teal-700 text-white shadow-xl">
          <span className="text-sm font-medium">{t('comparePlural', { count: compareSelected.length })}</span>
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="px-4 py-1.5 rounded-full bg-white text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
          >
            <ArrowRight className="h-4 w-4 inline mr-1" />
            {t('comparePlural', { count: compareSelected.length }).split(' ')[0]}
          </button>
          <button
            type="button"
            onClick={() => setCompareSelected([])}
            className="p-1 rounded-full hover:bg-teal-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && (
        <CompareModal
          favorites={favorites}
          selected={compareSelected}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
