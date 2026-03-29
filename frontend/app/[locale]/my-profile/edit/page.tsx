'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  ArrowLeft, User, Mail, Shield, Calendar, MapPin, Phone,
  Check, Circle, ChevronRight, Users, Eye, EyeOff,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/lib/stores/authStore'
import { ROUTES, API_ENDPOINTS } from '@/lib/constants'
import { api } from '@/lib/services/http'
import ShelterAdminProfileSection from '@/components/ui/ShelterAdminProfileSection'
import AdminProfileSection from '@/components/ui/AdminProfileSection'

// ---------------------------------------------------------------------------
// Profile completeness helpers
// ---------------------------------------------------------------------------

type UserData = NonNullable<ReturnType<typeof useAuthStore.getState>['user']>

interface CompletenessItem {
  key: string
  label: string
  done: boolean
  fieldRef?: string
}

function getCompletenessItems(
  user: UserData,
  hasIntent: boolean,
  t: (key: string) => string,
): CompletenessItem[] {
  return [
    { key: 'name', label: t('completenessName'), done: !!(user.first_name && user.last_name), fieldRef: 'first_name' },
    { key: 'email', label: t('completenessEmail'), done: !!user.email },
    { key: 'phone', label: t('completenessPhone'), done: !!user.phone, fieldRef: 'phone' },
    { key: 'city', label: t('completenessCity'), done: !!user.city, fieldRef: 'city' },
    { key: 'intent', label: t('completenessIntent'), done: hasIntent },
  ]
}

function calcCompleteness(user: UserData, hasIntent: boolean) {
  let score = 0
  if (user.first_name && user.last_name) score += 15
  if (user.email) score += 15
  if (user.phone) score += 20
  if (user.city) score += 20
  if (hasIntent) score += 30
  return score
}

// ---------------------------------------------------------------------------
// Intent status badge
// ---------------------------------------------------------------------------

function IntentStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    paused: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    matched: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  }
  const cls = colorMap[status] || colorMap.active

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function EditProfilePage() {
  const user = useAuthStore((s) => s.user)
  const profileStats = useAuthStore((s) => s.profileStats)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const fetchProfileStats = useAuthStore((s) => s.fetchProfileStats)
  const t = useTranslations('editProfile')

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [roleData, setRoleData] = useState<Record<string, unknown> | null>(null)

  // Refs for focus-on-complete-now
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    first_name: firstNameRef,
    last_name: lastNameRef,
    phone: phoneRef,
    city: cityRef,
  }

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        city: user.city,
      })
    }
  }, [user])

  useEffect(() => {
    void fetchProfileStats()
    api.get(API_ENDPOINTS.UPDATE_PROFILE).then((r) => setRoleData(r.data)).catch(() => {})
  }, [fetchProfileStats])

  // Clear success message after a delay
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [success])

  const handleChange = useCallback((field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError(t('nameRequired'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile(form)
      setSuccess(true)
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const focusField = (fieldRef?: string) => {
    if (!fieldRef) return
    const ref = fieldRefs[fieldRef]
    ref?.current?.focus()
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (!user) {
    return (
      <div data-testid="loading-skeleton" className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-8 w-48 rounded-lg animate-shimmer mb-8" />
        <div className="space-y-6">
          <div className="rounded-2xl border border-border-primary p-8 h-80 animate-shimmer" />
          <div className="rounded-2xl border border-border-primary p-8 h-40 animate-shimmer" />
          <div className="rounded-2xl border border-border-primary p-8 h-48 animate-shimmer" />
          <div className="rounded-2xl border border-border-primary p-8 h-32 animate-shimmer" />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  const hasIntent = !!profileStats?.adopter_intent
  const completeness = calcCompleteness(user, hasIntent)
  const completenessColor =
    completeness < 50 ? 'bg-red-500' : completeness < 80 ? 'bg-amber-500' : 'bg-emerald-500'
  const completenessTextColor =
    completeness < 50 ? 'text-red-600' : completeness < 80 ? 'text-amber-600' : 'text-emerald-600'
  const completenessItems = getCompletenessItems(user, hasIntent, t)

  const memberSince = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    : ''

  const isAdopter = user.role === 'adopter'

  const inputClasses = 'w-full px-3 py-2.5 rounded-lg border border-border-primary bg-surface-secondary text-sm text-text-primary focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* ----------------------------------------------------------------- */}
      {/* Section 1 — Header                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-8">
        <Link
          href={ROUTES.MY_PROFILE}
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-teal-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToProfile')}
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {isAdopter ? t('subtitleAdopter') : t('subtitleDefault')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --------------------------------------------------------------- */}
        {/* Section 2 — Personal Info Card                                   */}
        {/* --------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
          {/* Avatar */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
              {initials ? (
                <span className="text-2xl font-bold text-white">{initials}</span>
              ) : (
                <User className="h-8 w-8 text-white/80" />
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">{t('sectionPersonal')}</h2>

            {/* Error / Success messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{t('saveSuccess')}</p>
              </div>
            )}

            {/* Form fields — 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-medium text-text-tertiary mb-1.5">
                  {t('firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstNameRef}
                  id="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange('first_name')}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs font-medium text-text-tertiary mb-1.5">
                  {t('lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={lastNameRef}
                  id="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange('last_name')}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-text-tertiary mb-1.5">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-quaternary" />
                  <input
                    ref={phoneRef}
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+57 300 123 4567"
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="city" className="block text-xs font-medium text-text-tertiary mb-1.5">
                  {t('city')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-quaternary" />
                  <input
                    ref={cityRef}
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange('city')}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Section 3 — Adoption Intent Summary (adopters only)              */}
        {/* --------------------------------------------------------------- */}
        {isAdopter && (
          <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              {t('sectionIntent')}
            </h2>

            {profileStats?.adopter_intent ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IntentStatusBadge status={profileStats.adopter_intent.status} />
                  <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                    {profileStats.adopter_intent.visibility === 'public' ? (
                      <Eye className="h-4 w-4 text-text-quaternary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-text-quaternary" />
                    )}
                    {t(`visibility_${profileStats.adopter_intent.visibility}`)}
                  </span>
                </div>
                <Link
                  href={ROUTES.MY_INTENT}
                  className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t('editIntent')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-teal-100/80 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-text-primary">{t('intentCtaTitle')}</p>
                <p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto leading-relaxed">
                  {t('intentCtaDescription')}
                </p>
                <Link
                  href={ROUTES.MY_INTENT}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium bg-teal-600 text-white rounded-full px-5 py-2 hover:bg-teal-700 transition-colors shadow-sm"
                >
                  {t('intentCtaButton')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Section 4 — Profile Completeness                                 */}
        {/* --------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">{t('sectionCompleteness')}</h2>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={`font-medium ${completenessTextColor}`}>
                {completeness < 100 ? t('completenessIncomplete') : t('completenessComplete')}
              </span>
              <span className="text-text-quaternary font-medium">{completeness}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-tertiary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completenessColor}`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <ul className="space-y-2">
            {completenessItems.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-secondary"
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-text-quaternary shrink-0" />
                  )}
                  <span className={`text-sm ${item.done ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                    {item.label}
                  </span>
                </div>
                {!item.done && item.fieldRef && (
                  <button
                    type="button"
                    onClick={() => focusField(item.fieldRef)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    {t('completeNow')}
                  </button>
                )}
                {!item.done && item.key === 'intent' && (
                  <Link
                    href={ROUTES.MY_INTENT}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    {t('completeNow')}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Shelter Admin Section                                            */}
        {/* --------------------------------------------------------------- */}
        {user.role === 'shelter_admin' && (
          <ShelterAdminProfileSection
            shelter={(roleData as any)?.shelter ?? null}
            stats={undefined}
          />
        )}

        {/* --------------------------------------------------------------- */}
        {/* Admin Section                                                    */}
        {/* --------------------------------------------------------------- */}
        {user.role === 'admin' && (
          <AdminProfileSection
            adminStats={(roleData as any)?.admin_stats ?? undefined}
          />
        )}

        {/* --------------------------------------------------------------- */}
        {/* Section 5 — Account Info (read-only)                             */}
        {/* --------------------------------------------------------------- */}
        <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">{t('sectionAccount')}</h2>

          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-surface-secondary">
              <Mail className="h-4 w-4 text-text-quaternary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-text-quaternary uppercase tracking-wider">{t('email')}</p>
                <p className="text-sm text-text-tertiary truncate">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-surface-secondary">
              <Shield className="h-4 w-4 text-text-quaternary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-text-quaternary uppercase tracking-wider">{t('role')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Member since */}
            {memberSince && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-surface-secondary">
                <Calendar className="h-4 w-4 text-text-quaternary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-text-quaternary uppercase tracking-wider">{t('memberSince')}</p>
                  <p className="text-sm text-text-secondary">{memberSince}</p>
                </div>
              </div>
            )}

            {/* Terms version */}
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-surface-secondary">
              <Shield className="h-4 w-4 text-text-quaternary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-text-quaternary uppercase tracking-wider">{t('termsAccepted')}</p>
                <p className="text-sm text-text-secondary">{t('termsVersion')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Footer — Actions                                                 */}
        {/* --------------------------------------------------------------- */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <Link
            href={ROUTES.MY_PROFILE}
            className="px-5 py-2.5 text-sm rounded-lg border border-border-primary text-text-secondary hover:bg-surface-hover transition-colors font-medium"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}
