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
import { AnimalCard, CampaignCard, ShelterCard, FAQAccordion, CTASection, Container } from '@/components/ui';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { ROUTES } from '@/lib/constants';
import {
  ctaAmberOutlineClass,
  heroTealPillClass,
  pastelIconCircle12Class,
  pastelStepTile14Class,
} from '@/lib/ui/pastelAccent';

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

  const sheltersGridRef = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-primary bg-gradient-to-b from-surface-secondary via-teal-50/30 to-surface-secondary dark:via-teal-950/25">
        <Container className="py-12 md:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className={heroTealPillClass}>
              {t('badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mt-6 leading-tight">
              {t('title')}
              <br />
              <span className="text-teal-600 dark:text-teal-400">{t('titleAccent')}</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
              <Link
                href={ROUTES.ANIMALS}
                className="inline-flex justify-center items-center min-h-11 w-full sm:w-auto bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm"
              >
                {t('ctaAnimals')}
              </Link>
              <Link
                href={ROUTES.LOOKING_TO_ADOPT}
                className="inline-flex justify-center items-center min-h-11 w-full sm:w-auto border border-border-secondary text-text-secondary rounded-full px-6 py-3 font-medium hover:bg-surface-primary dark:hover:bg-surface-hover btn-base shadow-sm"
              >
                {t('ctaAdopt')}
              </Link>
              <Link
                href={ROUTES.CAMPAIGNS}
                className={ctaAmberOutlineClass}
              >
                {t('ctaDonate')}
              </Link>
              <Link
                href={ROUTES.WORK_WITH_US}
                className="inline-flex justify-center items-center min-h-11 w-full sm:w-auto border border-teal-200 text-teal-700 rounded-full px-6 py-3 font-medium hover:bg-teal-50 dark:border-teal-500/35 dark:text-teal-400 dark:hover:bg-teal-950/40 btn-base shadow-sm"
              >
                {t('ctaWork')}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="min-w-0 rounded-2xl bg-surface-primary/80 border border-border-primary p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-text-tertiary truncate">{t('statAdoptionLabel')}</p>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-text-primary leading-tight break-words">{t('statAdoption')}</p>
              </div>
              <div className="min-w-0 rounded-2xl bg-surface-primary/80 border border-border-primary p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-text-tertiary truncate">{t('statSponsorshipLabel')}</p>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-text-primary leading-tight break-words">{t('statSponsorship')}</p>
              </div>
              <div className="min-w-0 rounded-2xl bg-surface-primary/80 border border-border-primary p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-text-tertiary truncate">{t('statSheltersLabel')}</p>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-text-primary leading-tight break-words">{t('statShelters')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Animals Carousel */}
      <section className="py-10 md:py-16 overflow-x-hidden min-w-0">
        <CTASection
          title={t('featuredTitle')}
          subtitle={t('featuredSubtitle')}
          linkHref={ROUTES.ANIMALS}
          linkLabel={t('viewAll')}
          decorated
        >
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
                <div key={i} className="rounded-2xl border border-border-primary/60 bg-surface-primary overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] animate-shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 animate-shimmer rounded w-2/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CTASection>
      </section>

      {/* How It Works */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-surface-secondary via-surface-tertiary/35 to-surface-secondary border-y border-border-primary">
        <Container className="text-center">
          <h2 className="text-2xl font-bold text-text-primary heading-decorated-center">{t('howTitle')}</h2>
          <p className="mt-2 text-text-tertiary max-w-lg mx-auto">
            {t('howSubtitle')}
          </p>

          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className={pastelStepTile14Class('teal')}>
                1
              </div>
              <h3 className="mt-5 font-semibold text-text-primary">{t('step1Title')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className={pastelStepTile14Class('amber')}>
                2
              </div>
              <h3 className="mt-5 font-semibold text-text-primary">{t('step2Title')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-5 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className={pastelStepTile14Class('emerald')}>
                3
              </div>
              <h3 className="mt-5 font-semibold text-text-primary">{t('step3Title')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Active Campaigns Carousel */}
      {activeCampaigns.length > 0 && (
        <section className="py-10 md:py-16 overflow-x-hidden min-w-0">
          <CTASection
            title={t('campaignsTitle')}
            subtitle={t('campaignsSubtitle')}
            linkHref={ROUTES.CAMPAIGNS}
            linkLabel={t('viewAllFeminine')}
            linkColor="text-amber-600 hover:text-amber-700"
            decorated
          >
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
          </CTASection>
        </section>
      )}

      {/* Why Adopt — Value Content */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-surface-secondary via-surface-tertiary/35 to-surface-secondary border-y border-border-primary">
        <Container>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-text-primary heading-decorated-center">{t('whyAdoptTitle')}</h2>
            <p className="mt-2 text-text-tertiary max-w-lg mx-auto">
              {t('whyAdoptSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('teal')}>
                <Heart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">{t('whySaveLives')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('whySaveLivesDesc')}
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('amber')}>
                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">{t('whySafeProcess')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('whySafeProcessDesc')}
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('emerald')}>
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">{t('whyCommunity')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('whyCommunityDesc')}
              </p>
            </div>
            <div className="bg-surface-primary rounded-2xl border border-border-primary p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={pastelIconCircle12Class('rose')}>
                <TrendingUp className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="mt-4 font-semibold text-text-primary">{t('whyImpact')}</h3>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
                {t('whyImpactDesc')}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Shelter Spotlight */}
      {featuredShelters.length > 0 && (
        <section className="py-10 md:py-16 overflow-x-hidden min-w-0">
          <CTASection
            title={t('sheltersTitle')}
            subtitle={t('sheltersSubtitle')}
            linkHref={ROUTES.SHELTERS}
            linkLabel={t('viewAll')}
            linkColor="text-emerald-600 hover:text-emerald-700"
            decorated
          >
            {/* Carrusel en móvil */}
            <div className="md:hidden -mx-1 min-w-0 overflow-x-hidden px-1">
              <Swiper
                modules={[Pagination]}
                spaceBetween={12}
                slidesPerView={1.1}
                pagination={{ clickable: true }}
                className="pb-10"
              >
                {featuredShelters.map((shelter) => (
                  <SwiperSlide key={shelter.id}>
                    <ShelterCard shelter={shelter} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {/* Grid en desktop */}
            <div ref={sheltersGridRef} className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>
          </CTASection>
        </section>
      )}

      {/* FAQ */}
      {homeFaqs.length > 0 && (
        <div className="border-t border-border-primary bg-surface-secondary/50">
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
