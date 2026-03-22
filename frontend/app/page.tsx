'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { AnimalCard, CampaignCard, ShelterCard } from '@/components/ui';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  const animals = useAnimalStore((s) => s.animals);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const shelters = useShelterStore((s) => s.shelters);
  const fetchShelters = useShelterStore((s) => s.fetchShelters);

  useEffect(() => {
    if (animals.length === 0) void fetchAnimals();
    if (campaigns.length === 0) void fetchCampaigns();
    if (shelters.length === 0) void fetchShelters();
  }, [fetchAnimals, animals.length, fetchCampaigns, campaigns.length, fetchShelters, shelters.length]);

  const featuredAnimals = animals.slice(0, 6);
  const activeCampaigns = campaigns.slice(0, 3);
  const featuredShelters = shelters.slice(0, 3);

  const animalsGridRef = useScrollReveal<HTMLDivElement>(0.1);
  const stepsRef = useScrollReveal<HTMLDivElement>(0.15);
  const campaignsGridRef = useScrollReveal<HTMLDivElement>(0.1);
  const sheltersGridRef = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-50 via-teal-50/30 to-stone-50">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              Plataforma de adopción y apadrinamiento animal
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mt-6 leading-tight">
              Cada huella cuenta.
              <br />
              <span className="text-teal-600">Adopta, apadrina, transforma.</span>
            </h1>
            <p className="mt-6 text-lg text-stone-600 max-w-2xl leading-relaxed">
              Conectamos refugios con personas que quieren dar un hogar o apoyar a un animal.
              Encuentra tu compañero ideal o ayuda desde donde estés.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ROUTES.ANIMALS}
                className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                Ver Animales
              </Link>
              <Link
                href={ROUTES.BUSCO_ADOPTAR}
                className="border border-stone-300 text-stone-700 rounded-full px-6 py-3 font-medium hover:bg-white transition-colors shadow-sm"
              >
                Busco Adoptar
              </Link>
              <Link
                href={ROUTES.CAMPAIGNS}
                className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 transition-colors shadow-sm"
              >
                Donar
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Adopción</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Proceso guiado y seguro</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Apadrinamiento</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Apoya mensual o una vez</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Refugios</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Verificados y confiables</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Animales en busca de hogar</h2>
              <p className="mt-1 text-stone-500">Estos amigos esperan por ti</p>
            </div>
            <Link href={ROUTES.ANIMALS} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Ver todos &rarr;
            </Link>
          </div>

          <div ref={animalsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAnimals.length > 0 ? (
              featuredAnimals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-stone-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-2/3" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-stone-100/50 border-y border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6 text-center">
          <h2 className="text-2xl font-bold text-stone-800">¿Cómo funciona?</h2>
          <p className="mt-2 text-stone-500 max-w-lg mx-auto">
            Tres pasos sencillos para transformar una vida
          </p>

          <div ref={stepsRef} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Explora</h3>
              <p className="mt-2 text-sm text-stone-500">
                Filtra por especie, tamaño, edad y ubicación. Encuentra al compañero ideal.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Conecta</h3>
              <p className="mt-2 text-sm text-stone-500">
                Envía tu solicitud de adopción o elige apadrinar mensualmente.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Transforma</h3>
              <p className="mt-2 text-sm text-stone-500">
                Dale un hogar, sigue su progreso, y recibe actualizaciones del refugio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Campañas activas</h2>
                <p className="mt-1 text-stone-500">Ayuda a quienes más lo necesitan</p>
              </div>
              <Link href={ROUTES.CAMPAIGNS} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Ver todas &rarr;
              </Link>
            </div>

            <div ref={campaignsGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shelter Spotlight */}
      {featuredShelters.length > 0 && (
        <section className="py-16 bg-stone-100/50 border-y border-stone-200">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Refugios destacados</h2>
                <p className="mt-1 text-stone-500">Organizaciones verificadas que protegen vidas</p>
              </div>
              <Link href={ROUTES.SHELTERS} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ver todos &rarr;
              </Link>
            </div>

            <div ref={sheltersGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredShelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
