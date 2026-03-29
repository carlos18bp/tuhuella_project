'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ROUTES } from '@/lib/constants'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Clock,
  XCircle,
  Dog,
  ClipboardList,
  Megaphone,
  ChevronRight,
  Plus,
} from 'lucide-react'

interface ShelterAdminProfileSectionProps {
  shelter: {
    name: string
    legal_name?: string
    description?: string
    city?: string
    address?: string
    phone?: string
    email?: string
    website?: string
    verification_status: 'pending' | 'verified' | 'rejected'
  } | null
  stats?: {
    animals_count?: number
    pending_applications?: number
    active_campaigns?: number
  }
}

const verificationConfig = {
  verified: {
    icon: ShieldCheck,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200/60',
  },
  pending: {
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200/60',
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200/60',
  },
} as const

export default function ShelterAdminProfileSection({
  shelter,
  stats,
}: ShelterAdminProfileSectionProps) {
  const t = useTranslations('editProfile')

  if (!shelter) {
    return (
      <div className="rounded-2xl border border-border-primary bg-surface-primary p-8 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-text-quaternary" />
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          {t('noShelterRegistered')}
        </h3>
        <p className="mb-6 text-sm text-text-tertiary">
          {t('noShelterDescription')}
        </p>
        <Link
          href={ROUTES.SHELTER_ONBOARDING}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          {t('registerShelter')}
        </Link>
      </div>
    )
  }

  const verification = verificationConfig[shelter.verification_status]
  const VerificationIcon = verification.icon

  return (
    <div className="space-y-6">
      {/* My Shelter Summary */}
      <div className="rounded-2xl border border-border-primary bg-surface-primary p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
            <Building2 className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            {t('shelterSection')}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Name + verification */}
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-xl font-bold text-text-primary">{shelter.name}</h4>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${verification.bg} ${verification.text} ${verification.ring}`}
            >
              <VerificationIcon className="h-3.5 w-3.5" />
              {t(`verificationStatus.${shelter.verification_status}`)}
            </span>
          </div>

          {/* Location */}
          {(shelter.city || shelter.address) && (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-quaternary" />
              <span>
                {[shelter.address, shelter.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Contact info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {shelter.phone && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone className="h-4 w-4 text-text-quaternary" />
                <span>{shelter.phone}</span>
              </div>
            )}
            {shelter.email && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="h-4 w-4 text-text-quaternary" />
                <span>{shelter.email}</span>
              </div>
            )}
            {shelter.website && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Globe className="h-4 w-4 text-text-quaternary" />
                <a
                  href={shelter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-stone-300 transition-colors hover:text-teal-600"
                >
                  {shelter.website}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {shelter.description && (
            <p className="line-clamp-2 text-sm text-text-tertiary">
              {shelter.description}
            </p>
          )}

          {/* Manage shelter link */}
          <Link
            href={ROUTES.SHELTER_SETTINGS}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            {t('manageShelter')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href={ROUTES.SHELTER_ANIMALS}
          className="group rounded-2xl border border-border-primary bg-surface-primary p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 transition-colors group-hover:bg-teal-100">
            <Dog className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats?.animals_count ?? 0}
          </p>
          <p className="text-sm text-text-tertiary">{t('statsAnimals')}</p>
        </Link>

        <Link
          href={ROUTES.SHELTER_APPLICATIONS}
          className="group rounded-2xl border border-border-primary bg-surface-primary p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 transition-colors group-hover:bg-amber-100">
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats?.pending_applications ?? 0}
          </p>
          <p className="text-sm text-text-tertiary">{t('statsPendingApplications')}</p>
        </Link>

        <Link
          href={ROUTES.SHELTER_CAMPAIGNS}
          className="group rounded-2xl border border-border-primary bg-surface-primary p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 transition-colors group-hover:bg-emerald-100">
            <Megaphone className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats?.active_campaigns ?? 0}
          </p>
          <p className="text-sm text-text-tertiary">{t('statsActiveCampaigns')}</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border-primary bg-surface-primary p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-quaternary">
          {t('quickActions')}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.SHELTER_DASHBOARD}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            {t('actionAddAnimal')}
          </Link>
          <Link
            href={ROUTES.SHELTER_APPLICATIONS}
            className="inline-flex items-center gap-2 rounded-lg border border-border-primary bg-surface-primary px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-stone-50"
          >
            <ClipboardList className="h-4 w-4" />
            {t('actionViewApplications')}
          </Link>
          <Link
            href={ROUTES.SHELTER_CAMPAIGNS}
            className="inline-flex items-center gap-2 rounded-lg border border-border-primary bg-surface-primary px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-stone-50"
          >
            <Megaphone className="h-4 w-4" />
            {t('actionCreateCampaign')}
          </Link>
        </div>
      </div>
    </div>
  )
}
