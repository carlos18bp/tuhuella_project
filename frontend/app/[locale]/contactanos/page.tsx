'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, MessageCircle, Send } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

import { Container } from '@/components/ui';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';

const MESSAGE_MAX = 5000;

const WHATSAPP_LINES = [
  { labelKey: 'whatsappGeneral' as const, digits: '573001112233' },
  { labelKey: 'whatsappAdoptions' as const, digits: '573009998877' },
];

export default function ContactanosPage() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [siteKey, setSiteKey] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    api.get('google-captcha/site-key/')
      .then((res) => setSiteKey(res.data.site_key || ''))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_MAX) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!form.name.trim()) errors.name = [t('fieldRequired')];
    if (!form.email.trim()) errors.email = [t('fieldRequired')];
    if (!form.subject.trim()) errors.subject = [t('fieldRequired')];
    if (!form.message.trim()) errors.message = [t('fieldRequired')];

    if (siteKey && !captchaToken) {
      errors.captcha = [t('captchaRequired')];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(API_ENDPOINTS.CONTACT, {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        captcha_token: captchaToken ?? undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: Record<string, unknown> } };
      const status = ax.response?.status;
      const data = ax.response?.data;
      if (status === 503) {
        setError(t('sendUnavailable'));
      } else if (data && typeof data === 'object' && !('message' in data && typeof (data as { message?: string }).message === 'string')) {
        const fe: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(data)) {
          if (k === 'error' || k === 'detail') continue;
          if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
            fe[k] = v as string[];
          }
        }
        if (Object.keys(fe).length > 0) {
          setFieldErrors(fe);
        } else {
          setError(t('submitError'));
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

  if (submitted) {
    return (
      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/25 p-8 md:p-10 text-center">
          <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-emerald-500 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-text-primary">{t('successTitle')}</h1>
          <p className="mt-2 text-text-secondary leading-relaxed">{t('successBody')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-text-primary heading-decorated-center">{t('title')}</h1>
        <p className="mt-3 text-text-secondary leading-relaxed">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start min-w-0">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border-primary bg-surface-primary p-6 md:p-8 shadow-sm space-y-5">
          {error ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-800/40 p-4 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <FieldInput
            label={t('name')}
            name="name"
            value={form.name}
            onChange={handleChange}
            errors={fieldErrors.name}
            required
          />
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
            label={t('subject')}
            name="subject"
            value={form.subject}
            onChange={handleChange}
            errors={fieldErrors.subject}
            required
          />

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1.5">
              {t('message')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="input-base w-full resize-none"
              required
            />
            <div className="flex justify-between mt-1">
              {fieldErrors.message?.length ? (
                <p className="text-xs text-red-600">{fieldErrors.message[0]}</p>
              ) : null}
              <p className="text-xs text-text-quaternary ml-auto">
                {t('messageHint', { max: MESSAGE_MAX })} · {form.message.length}/{MESSAGE_MAX}
              </p>
            </div>
          </div>

          {siteKey ? (
            <div>
              <ReCAPTCHA
                ref={captchaRef}
                sitekey={siteKey}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
              {fieldErrors.captcha?.length ? (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.captcha[0]}</p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || (Boolean(siteKey) && !captchaToken)}
            className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 dark:hover:from-teal-500 dark:hover:to-teal-600 text-white rounded-full px-8 py-3 font-medium btn-base shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? t('submitting') : t('submit')}
          </button>
        </form>

        <aside className="rounded-2xl border border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-b from-teal-50/80 to-surface-primary dark:from-teal-950/25 dark:to-surface-primary p-6 md:p-8">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
            <MessageCircle className="h-6 w-6 shrink-0" aria-hidden />
            <h2 className="text-lg font-bold text-text-primary">{t('whatsappTitle')}</h2>
          </div>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">{t('whatsappIntro')}</p>
          <ul className="mt-6 space-y-4">
            {WHATSAPP_LINES.map((line) => (
              <li key={line.digits}>
                <a
                  href={`https://wa.me/${line.digits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-xl border border-teal-100 dark:border-teal-800/50 bg-white/80 dark:bg-surface-secondary/80 px-4 py-3 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-semibold text-teal-800 dark:text-teal-200">{t(line.labelKey)}</span>
                  <span className="text-xs text-text-tertiary mt-0.5 font-mono">{formatCoDemoNumber(line.digits)}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-text-quaternary leading-relaxed">{t('whatsappHours')}</p>
        </aside>
      </div>
    </Container>
  );
}

function formatCoDemoNumber(digits: string): string {
  if (digits.startsWith('57') && digits.length >= 12) {
    const rest = digits.slice(2);
    return `+57 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }
  return `+${digits}`;
}

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
        {label} {required ? <span className="text-red-500">*</span> : null}
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
      {errors?.length ? <p className="text-xs text-red-600 mt-1">{errors[0]}</p> : null}
    </div>
  );
}
