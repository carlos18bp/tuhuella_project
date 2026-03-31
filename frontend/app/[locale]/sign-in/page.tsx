'use client';

import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { FormEvent, useState, useEffect, useRef } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import ReCAPTCHA from 'react-google-recaptcha';
import { PawPrint } from 'lucide-react';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { ROUTES } from '@/lib/constants';
import { authInputFieldClass } from '@/lib/ui/authFormClasses';

type GoogleUser = {
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export default function SignInPage() {
  const router = useRouter();
  const { signIn, googleLogin } = useAuthStore();

  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    api.get('google-captcha/site-key/')
      .then((res) => setSiteKey(res.data.site_key || ''))
      .catch(() => {});
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (siteKey && !captchaToken) {
      setError('Please complete the captcha');
      return;
    }

    setLoading(true);

    try {
      await signIn({ email, password, captcha_token: captchaToken ?? undefined });
      router.replace(ROUTES.HOME);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Google login failed');
        return;
      }

      let decoded: GoogleUser | null = null;
      try {
        decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
      } catch {
        decoded = null;
      }

      await googleLogin({
        credential: credentialResponse.credential,
        email: decoded?.email,
        given_name: decoded?.given_name,
        family_name: decoded?.family_name,
        picture: decoded?.picture,
      });
      
      router.replace(ROUTES.HOME);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <main className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-surface-secondary to-surface-tertiary/50 min-w-0 overflow-x-hidden">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-teal-100/30 dark:bg-teal-900/20 blur-3xl pointer-events-none" />
      <div className="w-full max-w-md bg-surface-primary border border-border-primary rounded-2xl p-6 sm:p-8 shadow-lg ring-1 ring-border-tertiary">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30 shadow-sm ring-1 ring-teal-200/50 dark:ring-teal-700/30 flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Iniciar sesión</h1>
            <p className="text-sm text-text-tertiary">Bienvenido de vuelta a Tu Huella</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
            <input
              id="signin-email"
              className={authInputFieldClass}
              placeholder="tu@email.com" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="signin-password" className="block text-sm font-medium text-text-secondary mb-1.5">Contraseña</label>
            <input
              id="signin-password"
              className={authInputFieldClass}
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              autoComplete="current-password"
              required
            />
          </div>

          {siteKey && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
          )}

          <button
            className="inline-flex items-center justify-center min-h-11 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-full px-5 py-3 w-full font-medium disabled:opacity-50 btn-base shadow-sm hover:shadow-md"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {error ? (
            <p className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-950/25 border border-red-200/60 dark:border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center min-h-11 text-sm text-text-tertiary hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-surface-primary text-text-quaternary">O continúa con</span>
            </div>
          </div>

          {hasGoogleClientId ? (
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-red-600 text-center">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
          )}
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-text-tertiary">¿No tienes cuenta? </span>
          <Link
            href="/sign-up"
            className="text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 dark:hover:text-teal-300 transition-colors inline-flex items-center min-h-11"
          >
            Regístrate
          </Link>
        </div>

        {siteKey && (
          <p className="mt-4 text-center text-[10px] text-text-quaternary leading-relaxed">
            Protegido por reCAPTCHA de Google.{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacidad</a>
            {' y '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Términos</a>.
          </p>
        )}

        <p className="mt-4 text-center text-[10px] text-text-quaternary">
          Powered by{' '}
          <a href="https://projectapp.co" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500 transition-colors">
            ProjectApp.co
          </a>
        </p>
      </div>
    </main>
  );
}
