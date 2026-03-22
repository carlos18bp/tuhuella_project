'use client';

import Link from 'next/link';
import { useEffect } from 'react';

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
      <h1 className="text-3xl font-bold text-stone-800">Mis favoritos</h1>
      <p className="mt-2 text-stone-500">Animales que te han llamado la atención</p>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6 animate-pulse space-y-3">
              <div className="h-5 bg-stone-100 rounded w-2/3" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-10 text-center py-16">
          <p className="text-stone-400 text-lg">No tienes favoritos aún</p>
          <Link href={ROUTES.ANIMALS} className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium">
            Explorar animales &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={ROUTES.ANIMAL_DETAIL(fav.animal)}
              className="rounded-2xl border border-stone-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-stone-800">{fav.animal_name}</h3>
              <p className="text-sm text-stone-500 mt-1">
                {fav.animal_species === 'dog' ? 'Perro' : fav.animal_species === 'cat' ? 'Gato' : 'Otro'} · {fav.shelter_name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
