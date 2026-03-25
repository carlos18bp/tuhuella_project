'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  const animals = useAnimalStore((s) => s.animals);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const shelters = useShelterStore((s) => s.shelters);
  const fetchShelters = useShelterStore((s) => s.fetchShelters);

  useEffect(() => {
    void fetchAnimals(undefined, locale);
    void fetchCampaigns(locale);
    void fetchShelters(locale);
  }, [fetchAnimals, fetchCampaigns, fetchShelters, locale]);

  const featuredAnimals = animals.slice(0, 8);
  const activeCampaigns = campaigns.slice(0, 6);
  const featuredShelters = shelters.slice(0, 3);

  const { items: homeFaqs } = useFAQsByTopic('home');

  const stepsRef = useScrollReveal<HTMLDivElement>(0.15);
  const sheltersGridRef = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-50 via-teal-50/30 to-stone-50">
        <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              {t('badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mt-6 leading-tight">
              {t('title')}
              <br />
              <span className="text-teal-600">{t('titleAccent')}</span>
            </h1>
            <p className="mt-6 text-lg text-stone-600 max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ROUTES.ANIMALS}
                className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm"
              >
                {t('ctaAnimals')}
              </Link>
              <Link
                href={ROUTES.LOOKING_TO_ADOPT}
                className="border border-stone-300 text-stone-700 rounded-full px-6 py-3 font-medium hover:bg-white btn-base shadow-sm"
              >
                {t('ctaAdopt')}
              </Link>
              <Link
                href={ROUTES.CAMPAIGNS}
                className="border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 btn-base shadow-sm"
              >
                {t('ctaDonate')}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">{t('statAdoptionLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{t('statAdoption')}</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">{t('statSponsorshipLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{t('statSponsorship')}</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-stone-500">{t('statSheltersLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{t('statShelters')}</p>
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
              <h2 className="text-2xl font-bold text-stone-800 heading-decorated">{t('featuredTitle')}</h2>
              <p className="mt-1 text-stone-500">{t('featuredSubtitle')}</p>
            </div>
            <Link href={ROUTES.ANIMALS} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              {t('viewAll')} &rarr;
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
                <div key={i} className="rounded-2xl border border-stone-200/60 bg-white overflow-hidden shadow-sm">
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
      <section className="py-16 bg-gradient-to-b from-stone-100/60 via-stone-50/30 to-stone-100/60 border-y border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6 text-center">
          <h2 className="text-2xl font-bold text-stone-800 heading-decorated-center">{t('howTitle')}</h2>
          <p className="mt-2 text-stone-500 max-w-lg mx-auto">
            {t('howSubtitle')}
          </p>

          <div ref={stepsRef} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">{t('step1Title')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">{t('step2Title')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="mt-5 font-semibold text-stone-800">{t('step3Title')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('step3Desc')}
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
                <h2 className="text-2xl font-bold text-stone-800 heading-decorated">{t('campaignsTitle')}</h2>
                <p className="mt-1 text-stone-500">{t('campaignsSubtitle')}</p>
              </div>
              <Link href={ROUTES.CAMPAIGNS} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                {t('viewAllFeminine')} &rarr;
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
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
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
      <section className="py-16 bg-gradient-to-b from-stone-100/60 via-stone-50/30 to-stone-100/60 border-y border-stone-200">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800 heading-decorated-center">{t('whyAdoptTitle')}</h2>
            <p className="mt-2 text-stone-500 max-w-lg mx-auto">
              {t('whyAdoptSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">{t('whySaveLives')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('whySaveLivesDesc')}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">{t('whySafeProcess')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('whySafeProcessDesc')}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">{t('whyCommunity')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('whyCommunityDesc')}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-800">{t('whyImpact')}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                {t('whyImpactDesc')}
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
                <h2 className="text-2xl font-bold text-stone-800 heading-decorated">{t('sheltersTitle')}</h2>
                <p className="mt-1 text-stone-500">{t('sheltersSubtitle')}</p>
              </div>
              <Link href={ROUTES.SHELTERS} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                {t('viewAll')} &rarr;
              </Link>
            </div>

            <div ref={sheltersGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {homeFaqs.length > 0 && (
        <div className="border-t border-stone-200 bg-stone-50/50">
          <FAQAccordion
            items={homeFaqs}
            title={tCommon('faq')}
            subtitle={tCommon('faqSubtitle')}
          />
        </div>
      )}
    </>
  );
}
