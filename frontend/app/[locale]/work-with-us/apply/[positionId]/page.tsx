'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from '@/i18n/navigation';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { TermsModal } from '@/components/ui';
import type { VolunteerPosition } from '@/lib/types';

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  motivation: string;
};

const MOTIVATION_MAX = 1000;

export default function VolunteerApplyPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('workWithUs');
  const positionId = Number(params.positionId);

  const tTerms = useTranslations('termsAcceptance');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  const [position, setPosition] = useState<VolunteerPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [siteKey, setSiteKey] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [form, setForm] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    motivation: '',
  });

  // Fetch reCAPTCHA site key
  useEffect(() => {
    api.get('google-captcha/site-key/')
      .then((res) => setSiteKey(res.data.site_key || ''))
      .catch(() => {});
  }, []);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isAuthReady, isAuthenticated, router, locale]);

  // Auto-fill from user data
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        first_name: prev.first_name || user.first_name || '',
        last_name: prev.last_name || user.last_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        city: prev.city || user.city || '',
      }));
    }
  }, [user]);

  // Fetch position details
  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.VOLUNTEER_POSITIONS, { params: { lang: locale } });
        const found = (res.data as VolunteerPosition[]).find((p) => p.id === positionId);
        if (found) {
          setPosition(found);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    if (positionId) void fetchPosition();
  }, [positionId, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'motivation' && value.length > MOTIVATION_MAX) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string[]> = {};
    if (!form.first_name.trim()) errors.first_name = [t('fieldRequired')];
    if (!form.last_name.trim()) errors.last_name = [t('fieldRequired')];
    if (!form.email.trim()) errors.email = [t('fieldRequired')];
    if (!form.phone.trim()) errors.phone = [t('fieldRequired')];
    if (!form.city.trim()) errors.city = [t('fieldRequired')];
    if (!form.country.trim()) errors.country = [t('fieldRequired')];
    if (!form.motivation.trim()) errors.motivation = [t('fieldRequired')];
    else if (form.motivation.trim().length < 20) errors.motivation = [t('motivationMinLength')];

    if (!termsAccepted) {
      errors.terms = [tTerms('required')];
    }

    if (siteKey && !captchaToken) {
      errors.captcha = [t('captchaRequired')];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(API_ENDPOINTS.VOLUNTEER_APPLICATIONS, {
        position: positionId,
        ...form,
        captcha_token: captchaToken ?? undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object' && !data.message) {
          setFieldErrors(data);
        } else {
          setError(data.message || data.detail || t('submitError'));
        }
      } else {
        setError(t('submitError'));
      }
    } finally {
      setSubmitting(false);
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  if (!isAuthReady || (!isAuthenticated && isAuthReady)) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <div className="h-64 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10 space-y-4">
        <div className="h-8 animate-shimmer rounded w-1/3" />
        <div className="h-64 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10 text-center">
        <p className="text-text-tertiary">{t('positionNotFound')}</p>
        <Link href={ROUTES.WORK_WITH_US} className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium">
          {t('backToPositions')}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-10">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-text-primary">{t('successTitle')}</h2>
          <p className="mt-2 text-text-secondary">{t('successMessage')}</p>
          <Link
            href={ROUTES.WORK_WITH_US}
            className="mt-6 inline-block bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base"
          >
            {t('backToPositions')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <Link
        href={ROUTES.WORK_WITH_US}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToPositions')}
      </Link>

      {/* Position info */}
      <div className="mt-6 rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-text-primary">{t('applyTitle')}</h1>
        <p className="mt-1 text-text-tertiary">{t('applySubtitle')}</p>

        <div className="mt-4 rounded-xl bg-teal-50 p-4">
          <h3 className="font-semibold text-teal-800">{position.title}</h3>
          <p className="mt-1 text-sm text-teal-700">{position.description}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldInput
            label={t('firstName')}
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            errors={fieldErrors.first_name}
            required
          />
          <FieldInput
            label={t('lastName')}
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            errors={fieldErrors.last_name}
            required
          />
        </div>

        <FieldInput
          label={t('email')}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          errors={fieldErrors.email}
          required
        />

        <FieldInput
          label={t('phone')}
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          errors={fieldErrors.phone}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldInput
            label={t('city')}
            name="city"
            value={form.city}
            onChange={handleChange}
            errors={fieldErrors.city}
            required
          />
          <FieldInput
            label={t('country')}
            name="country"
            value={form.country}
            onChange={handleChange}
            errors={fieldErrors.country}
            required
          />
        </div>

        {/* Motivation textarea */}
        <div>
          <label htmlFor="motivation" className="block text-sm font-medium text-text-primary mb-1.5">
            {t('motivation')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="motivation"
            name="motivation"
            value={form.motivation}
            onChange={handleChange}
            rows={5}
            className="input-base w-full resize-none"
            placeholder={t('motivationPlaceholder')}
            required
          />
          <div className="flex justify-between mt-1">
            {fieldErrors.motivation?.length > 0 && (
              <p className="text-xs text-red-600">{fieldErrors.motivation[0]}</p>
            )}
            <p className="text-xs text-text-quaternary ml-auto">
              {t('motivationChars', { count: form.motivation.length })}
            </p>
          </div>
        </div>

        {/* reCAPTCHA */}
        {siteKey && (
          <div>
            <ReCAPTCHA
              ref={captchaRef}
              sitekey={siteKey}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
            {fieldErrors.captcha?.length > 0 && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.captcha[0]}</p>
            )}
          </div>
        )}

        {/* Terms acceptance */}
        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="volunteer-terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setFieldErrors((prev) => ({ ...prev, terms: [] }));
              }}
              className="mt-0.5 h-4 w-4 rounded border-border-primary text-teal-600 accent-teal-600 cursor-pointer"
            />
            <label htmlFor="volunteer-terms" className="text-sm text-text-secondary leading-snug cursor-pointer">
              {tTerms('checkboxLabel')}{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-teal-600 font-medium hover:text-teal-700 underline underline-offset-2 transition-colors"
              >
                {tTerms('termsLink')}
              </button>
            </label>
          </div>
          {fieldErrors.terms?.length > 0 && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.terms[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || (Boolean(siteKey) && !captchaToken)}
          className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-full px-8 py-3 font-medium btn-base shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          {submitting ? t('submitting') : t('submitApplication')}
        </button>
      </form>

      <TermsModal
        open={showTermsModal}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          setFieldErrors((prev) => ({ ...prev, terms: [] }));
        }}
        onDecline={() => {
          setTermsAccepted(false);
          setShowTermsModal(false);
        }}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
}

// Reusable field input component
function FieldInput({
  label,
  name,
  value,
  onChange,
  errors,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: string[];
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-text-primary mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="input-base w-full"
        required={required}
      />
      {errors && errors.length > 0 && (
        <p className="text-xs text-red-600 mt-1">{errors[0]}</p>
      )}
    </div>
  );
}
