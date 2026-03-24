'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, ArrowLeft } from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { AnimalGallery } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

export default function AnimalDetailPage() {
  const params = useParams();
  const animalId = Number(params.animalId);

  const animal = useAnimalStore((s) => s.animal);
  const loading = useAnimalStore((s) => s.loading);
  const fetchAnimal = useAnimalStore((s) => s.fetchAnimal);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const isFavorited = useFavoriteStore((s) => s.isFavorited);

  useEffect(() => {
    if (animalId) void fetchAnimal(animalId);
  }, [animalId, fetchAnimal]);

  if (loading || !animal) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="space-y-6">
          <div className="h-8 animate-shimmer rounded w-1/3" />
          <div className="aspect-video animate-shimmer rounded-2xl" />
          <div className="h-4 animate-shimmer rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.ANIMALS} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a animales
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
              <h1 className="text-3xl font-bold text-stone-800">{animal.name}</h1>
              <p className="text-stone-500 mt-1">{animal.shelter_name} · {animal.shelter_city}</p>
            </div>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => toggleFavorite(animal.id)}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  isFavorited(animal.id) ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited(animal.id) ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm px-3 py-1 rounded-full bg-stone-100 text-stone-600">{animal.breed}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-stone-100 text-stone-600">{animal.age_range}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-stone-100 text-stone-600">{animal.size}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-stone-100 text-stone-600">
              {animal.gender === 'male' ? 'Macho' : animal.gender === 'female' ? 'Hembra' : 'Desconocido'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {animal.is_vaccinated && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Vacunado</span>
            )}
            {animal.is_sterilized && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Esterilizado</span>
            )}
          </div>

          {animal.description && (
            <p className="mt-6 text-stone-600 leading-relaxed">{animal.description}</p>
          )}

          {animal.special_needs && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-800">Necesidades especiales</p>
              <p className="text-sm text-amber-700 mt-1">{animal.special_needs}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={`${ROUTES.MY_APPLICATIONS}?animal=${animal.id}`}
                  className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm"
                >
                  Solicitar Adopción
                </Link>
                <Link
                  href={`${ROUTES.CHECKOUT_SPONSORSHIP}?animal=${animal.id}`}
                  className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 btn-base"
                >
                  Apadrinar
                </Link>
              </>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm"
              >
                Inicia sesión para adoptar o apadrinar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
