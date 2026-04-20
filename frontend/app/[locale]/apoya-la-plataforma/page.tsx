'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Server,
  Mail,
  Globe2,
  Wrench,
  HeartHandshake,
  PawPrint,
  Megaphone,
  Sparkles,
  Gift,
  Building2,
  ArrowRight,
} from 'lucide-react';

import { Container, FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { ROUTES } from '@/lib/constants';

export default function PlatformSupportPage() {
  const t = useTranslations('platformSupport');
  const { items: faqs } = useFAQsByTopic('apoyo-plataforma');

  const costs = [
    { icon: Server, title: t('costHosting'), desc: t('costHostingDesc') },
    { icon: Mail, title: t('costEmail'), desc: t('costEmailDesc') },
    { icon: Globe2, title: t('costDomain'), desc: t('costDomainDesc') },
    { icon: Wrench, title: t('costDev'), desc: t('costDevDesc') },
  ];

  const ways = [
    { icon: PawPrint, title: t('compareAdoption'), desc: t('compareAdoptionDesc'), href: ROUTES.ANIMALS },
    { icon: HeartHandshake, title: t('compareSponsorship'), desc: t('compareSponsorshipDesc'), href: ROUTES.ANIMALS },
    { icon: Building2, title: t('compareShelter'), desc: t('compareShelterDesc'), href: ROUTES.SHELTERS },
    { icon: Megaphone, title: t('compareCampaign'), desc: t('compareCampaignDesc'), href: ROUTES.CAMPAIGNS },
    { icon: Sparkles, title: t('comparePlatform'), desc: t('comparePlatformDesc'), href: ROUTES.PLATFORM_SUPPORT, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-background to-background dark:from-rose-950/10">
      <Container className="py-12 sm:py-16">
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/25 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5" />
            {t('badge')}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent">
              {t('titleAccent')}
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary">{t('subtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.CHECKOUT_PLATFORM}
              className="min-h-11 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-rose-400 hover:to-rose-500 btn-base"
            >
              <Gift className="h-4 w-4" />
              {t('cta')}
            </Link>
            <Link
              href={ROUTES.BLOG_DETAIL('por-que-tuhuella-tiene-costos')}
              className="min-h-11 inline-flex items-center gap-2 rounded-full border border-border-primary bg-surface-primary px-6 py-3 text-sm font-medium text-text-secondary hover:bg-surface-hover btn-base"
            >
              {t('ctaSecondary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('costsTitle')}</h2>
          <p className="mt-2 text-text-secondary">{t('costsIntro')}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {costs.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary">{c.title}</h3>
                    <p className="mt-1 text-sm text-text-tertiary">{c.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 dark:border-rose-800/40 dark:bg-rose-950/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('transparencyTitle')}</h2>
            <p className="mt-2 text-text-secondary">{t('transparencyIntro')}</p>
            <ul className="mt-5 space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t('transparencyItem1')}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t('transparencyItem2')}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t('transparencyItem3')}
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('compareTitle')}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ways.map((w) => (
              <Link
                key={w.title}
                href={w.href}
                className={`group rounded-2xl border p-5 transition-all ${
                  w.highlight
                    ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-white shadow-sm hover:shadow-md dark:border-rose-700/50 dark:from-rose-950/30 dark:to-background'
                    : 'border-border-primary bg-surface-primary hover:bg-surface-hover'
                }`}
              >
                <w.icon className={`h-5 w-5 ${w.highlight ? 'text-rose-600 dark:text-rose-400' : 'text-text-tertiary'}`} />
                <h3 className="mt-3 font-semibold text-text-primary">{w.title}</h3>
                <p className="mt-1 text-sm text-text-tertiary">{w.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-border-primary bg-surface-secondary/60 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t('readBlogTitle')}</h2>
          <p className="mt-2 text-text-secondary">{t('readBlogDesc')}</p>
          <Link
            href={ROUTES.BLOG_DETAIL('por-que-tuhuella-tiene-costos')}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
          >
            {t('readBlogCta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {faqs.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl">
            <FAQAccordion items={faqs} title={t('faqTitle')} subtitle={t('faqSubtitle')} />
          </section>
        )}

        <section className="mx-auto mt-16 max-w-2xl text-center">
          <Link
            href={ROUTES.CHECKOUT_PLATFORM}
            className="min-h-11 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:from-rose-400 hover:to-rose-500 btn-base"
          >
            <Gift className="h-5 w-5" />
            {t('cta')}
          </Link>
        </section>
      </Container>
    </div>
  );
}
