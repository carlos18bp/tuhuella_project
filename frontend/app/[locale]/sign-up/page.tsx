'use client';

import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
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

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, googleLogin } = useAuthStore();

  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    setMounted(true);
    api.get('google-captcha/site-key/')
      .then((res) => setSiteKey(res.data.site_key || ''))
      .catch(() => {});
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (siteKey && !captchaToken) {
      setError('Please complete the captcha');
      setLoading(false);
      return;
    }

    try {
      await signUp({ 
        email, 
        password, 
        first_name: firstName,
        last_name: lastName,
        captcha_token: captchaToken ?? undefined,
      });
      router.replace(ROUTES.HOME);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.error) {
        setError(data.error);
      } else if (data) {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        setError(Array.isArray(val) ? val[0] : String(val));
      } else {
        setError('Registration failed');
      }
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
        setError('Google registration failed');
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
      setError(err.response?.data?.error || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google registration failed');
  };

  const inputClasses = "border border-stone-200 rounded-xl px-3.5 py-2.5 w-full bg-white text-stone-800 placeholder:text-stone-400 shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-colors";

  return (
    <main className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-stone-50 to-stone-100/50">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-teal-100/30 blur-3xl pointer-events-none" />
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 shadow-lg ring-1 ring-black/[0.02]">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 shadow-sm flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Crear cuenta</h1>
            <p className="text-sm text-stone-500">Únete a la comunidad Tu Huella</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-firstname" className="block text-sm font-medium text-stone-700 mb-1.5">Nombre</label>
              <input 
                id="signup-firstname"
                className={inputClasses}
                placeholder="Juan" 
                type="text"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="signup-lastname" className="block text-sm font-medium text-stone-700 mb-1.5">Apellido</label>
              <input 
                id="signup-lastname"
                className={inputClasses}
                placeholder="Pérez" 
                type="text"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                autoComplete="family-name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-stone-700 mb-1.5">Correo electrónico</label>
            <input 
              id="signup-email"
              className={inputClasses}
              placeholder="tu@email.com" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoComplete="email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
            <input 
              id="signup-password"
              className={inputClasses}
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-stone-400 mt-1">Mínimo 8 caracteres</p>
          </div>
          
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-stone-700 mb-1.5">Confirmar contraseña</label>
            <input 
              id="signup-confirm"
              className={inputClasses}
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type="password" 
              autoComplete="new-password"
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
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-full px-5 py-3 w-full font-medium disabled:opacity-50 btn-base shadow-sm hover:shadow-md" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {error ? <p className="text-red-600 text-sm bg-red-50 border border-red-200/60 rounded-lg px-3 py-2">{error}</p> : null}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-stone-400">O continúa con</span>
            </div>
          </div>

          {mounted && hasGoogleClientId ? (
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          ) : mounted ? (
            <p className="mt-6 text-sm text-red-600 text-center">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
          ) : null}
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-stone-500">¿Ya tienes cuenta? </span>
          <Link href="/sign-in" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
            Iniciar sesión
          </Link>
        </div>

        {siteKey && (
          <p className="mt-4 text-center text-[10px] text-stone-400 leading-relaxed">
            Protegido por reCAPTCHA de Google.{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacidad</a>
            {' y '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Términos</a>.
          </p>
        )}

        <p className="mt-4 text-center text-[10px] text-stone-400">
          Powered by{' '}
          <a href="https://projectapp.co" target="_blank" rel="noopener noreferrer" className="hover:text-teal-500 transition-colors">
            ProjectApp.co
          </a>
        </p>
      </div>
    </main>
  );
}
