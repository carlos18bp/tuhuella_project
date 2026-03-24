'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Heart, Shield, Users, TrendingUp } from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { AnimalCard, CampaignCard, ShelterCard, FAQAccordion } from '@/components/ui';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { ROUTES } from '@/lib/constants';
import { homeFaqs } from '@/lib/data/faqs';

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

  const featuredAnimals = animals.slice(0, 8);
  const activeCampaigns = campaigns.slice(0, 6);
  const featuredShelters = shelters.slice(0, 3);

  const stepsRef = useScrollReveal<HTMLDivElement>(0.15);
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
                className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm"
              >
                Ver Animales
              </Link>
              <Link
                href={ROUTES.LOOKING_TO_ADOPT}
                className="border border-stone-300 text-stone-700 rounded-full px-6 py-3 font-medium hover:bg-white btn-base shadow-sm"
              >
                Busco Adoptar
              </Link>
              <Link
                href={ROUTES.CAMPAIGNS}
                className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 btn-base shadow-sm"
              >
                Donar
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">Adopción</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Proceso guiado y seguro</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">Apadrinamiento</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Apoya mensual o una vez</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">Refugios</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">Verificados y confiables</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals Carousel */}
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

          {featuredAnimals.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-12"
            >
              {featuredAnimals.map((animal) => (
                <SwiperSlide key={animal.id}>
                  <AnimalCard animal={animal} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
                  <div className="aspect-[4/3] animate-shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">Explora</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Filtra por especie, tamaño, edad y ubicación. Encuentra al compañero ideal.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">Conecta</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Envía tu solicitud de adopción o elige apadrinar mensualmente.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">Transforma</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Dale un hogar, sigue su progreso, y recibe actualizaciones del refugio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Carousel */}
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

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-12"
            >
              {activeCampaigns.map((campaign) => (
                <SwiperSlide key={campaign.id}>
                  <CampaignCard campaign={campaign} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Why Adopt — Value Content */}
      <section className="py-16 bg-stone-100/50 border-y border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800">¿Por qué adoptar?</h2>
            <p className="mt-2 text-stone-500 max-w-lg mx-auto">
              Adoptar transforma vidas — la del animal y la tuya
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Salvas una vida</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Cada adopción libera un espacio en el refugio para rescatar otro animal.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Proceso seguro</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Refugios verificados, seguimiento post-adopción y asesoría veterinaria.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Comunidad activa</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Únete a una red de personas comprometidas con el bienestar animal.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">Impacto real</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Tus donaciones y apadrinamientos generan cambios medibles en los refugios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shelter Spotlight */}
      {featuredShelters.length > 0 && (
        <section className="py-16">
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

      {/* FAQ */}
      <div className="border-t border-stone-200 bg-stone-50/50">
        <FAQAccordion
          items={homeFaqs}
          title="Preguntas frecuentes"
          subtitle="Todo lo que necesitas saber sobre Tu Huella"
        />
      </div>
    </>
  );
}
