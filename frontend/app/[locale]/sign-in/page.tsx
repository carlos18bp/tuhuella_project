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
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-stone-50 to-stone-100/50">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Iniciar sesión</h1>
            <p className="text-sm text-stone-500">Bienvenido de vuelta a Tu Huella</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium text-stone-700 mb-1.5">Correo electrónico</label>
            <input 
              id="signin-email"
              className="border border-stone-200 rounded-xl px-3.5 py-2.5 w-full bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" 
              placeholder="tu@email.com" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="signin-password" className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
            <input 
              id="signin-password"
              className="border border-stone-200 rounded-xl px-3.5 py-2.5 w-full bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" 
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
            className="bg-teal-600 text-white rounded-full px-5 py-3 w-full font-medium disabled:opacity-50 hover:bg-teal-700 btn-base shadow-sm" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-stone-500 hover:text-teal-600 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-stone-400">O continúa con</span>
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
          <span className="text-stone-500">¿No tienes cuenta? </span>
          <Link href="/sign-up" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
            Regístrate
          </Link>
        </div>

        <p className="mt-6 text-center text-[10px] text-stone-400">
          Powered by{' '}
          <a href="https://projectapp.co" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500 transition-colors">
            ProjectApp.co
          </a>
        </p>
      </div>
    </main>
  );
}
