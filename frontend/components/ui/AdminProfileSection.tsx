'use client'

import {
  Shield,
  Users,
  Building2,
  Dog,
  Clock,
  Zap,
  LayoutDashboard,
  BarChart3,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ROUTES } from '@/lib/constants'

interface AdminProfileSectionProps {
  adminStats?: {
    total_users?: number
    total_shelters?: number
    total_animals?: number
    pending_verifications?: number
  }
}

const PLACEHOLDER = '\u2014'

function formatStat(value?: number): string {
  if (value === undefined || value === null) return PLACEHOLDER
  return value.toLocaleString()
}

export default function AdminProfileSection({ adminStats }: AdminProfileSectionProps) {
  const t = useTranslations('editProfile')

  const overviewStats = [
    {
      icon: Users,
      value: formatStat(adminStats?.total_users),
      label: t('totalUsers'),
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
    },
    {
      icon: Building2,
      value: formatStat(adminStats?.total_shelters),
      label: t('totalShelters'),
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Dog,
      value: formatStat(adminStats?.total_animals),
      label: t('totalAnimals'),
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: Clock,
      value: formatStat(adminStats?.pending_verifications),
      label: t('pendingVerifications'),
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    },
  ]

  const quickActions = [
    {
      icon: LayoutDashboard,
      label: t('adminDashboard'),
      href: ROUTES.ADMIN_DASHBOARD,
    },
    {
      icon: Building2,
      label: t('manageShelters'),
      href: ROUTES.ADMIN_DASHBOARD,
    },
    {
      icon: BarChart3,
      label: t('viewMetrics'),
      href: ROUTES.ADMIN_METRICS,
    },
    {
      icon: FileText,
      label: t('manageBlog'),
      href: ROUTES.ADMIN_BLOG,
    },
  ]

  const lastLogin = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-text-primary">{t('platformOverview')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {overviewStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-xl bg-surface-secondary p-4 text-center"
                >
                  <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-primary">
          <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-base font-bold text-text-primary">{t('quickActions')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-border-primary bg-surface-primary px-4 py-3 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-text-tertiary group-hover:text-teal-600 transition-colors" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-surface-secondary flex items-center justify-center">
              <Clock className="h-4 w-4 text-text-quaternary" />
            </div>
            <div>
              <p className="text-xs text-text-quaternary">{t('lastLogin')}</p>
              <p className="text-sm font-medium text-text-secondary">{lastLogin}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {t('adminRole')}
          </span>
        </div>
      </div>
    </div>
  )
}
