'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { Heart, Dog, Cat, PawPrint } from 'lucide-react';

import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { ROUTES } from '@/lib/constants';

export default function FavoritosPage() {
  const favorites = useFavoriteStore((s) => s.favorites);
  const loading = useFavoriteStore((s) => s.loading);
  const fetchFavorites = useFavoriteStore((s) => s.fetchFavorites);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Mis favoritos</h1>
          <p className="text-sm text-text-tertiary">Animales que te han llamado la atención</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary bg-surface-primary p-6 space-y-3">
              <div className="h-5 animate-shimmer rounded w-2/3" />
              <div className="h-3 animate-shimmer rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-10 text-center py-16">
          <Heart className="h-12 w-12 text-stone-300 mx-auto" />
          <p className="mt-3 text-text-quaternary text-lg">No tienes favoritos aún</p>
          <Link href={ROUTES.ANIMALS} className="mt-4 inline-block bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm">
            Explorar animales &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={ROUTES.ANIMAL_DETAIL(fav.animal)}
              className="group rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-text-quaternary">
                  {fav.animal_species === 'dog' ? <Dog className="h-5 w-5" /> : fav.animal_species === 'cat' ? <Cat className="h-5 w-5" /> : <PawPrint className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-teal-600 transition-colors">{fav.animal_name}</h3>
                  <p className="text-sm text-text-tertiary">
                    {fav.animal_species === 'dog' ? 'Perro' : fav.animal_species === 'cat' ? 'Gato' : 'Otro'} · {fav.shelter_name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
