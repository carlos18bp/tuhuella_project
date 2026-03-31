'use client';

import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { FormEvent, useState } from 'react';
import { PawPrint, ArrowLeft } from 'lucide-react';

import { useAuthStore } from '@/lib/stores/authStore';
import { authInputCodeClass, authInputFieldClass } from '@/lib/ui/authFormClasses';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendPasswordResetCode, resetPassword } = useAuthStore();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetCode(email);
      setMessage('Verification code sent to your email');
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ email, code, new_password: newPassword });
      setMessage('Password reset successfully! Redirecting...');
      router.replace('/sign-in');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-surface-secondary to-surface-tertiary/50 min-w-0 overflow-x-hidden">
      <div className="w-full max-w-md bg-surface-primary border border-border-primary rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-200/50 dark:ring-teal-700/30 flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Recuperar contraseña</h1>
            <p className="text-sm text-text-tertiary">
              {step === 'email' ? 'Te enviaremos un código de verificación' : 'Ingresa el código y tu nueva contraseña'}
            </p>
          </div>
        </div>

        {step === 'email' ? (
          <form className="space-y-4" onSubmit={onSendCode}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
              <input 
                id="reset-email"
                className={authInputFieldClass}
                placeholder="tu@email.com" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="email"
                required
              />
            </div>

            <button
              className="inline-flex items-center justify-center min-h-11 bg-teal-600 text-white rounded-full px-5 py-3 w-full font-medium disabled:opacity-50 hover:bg-teal-700 btn-base shadow-sm"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar código de verificación'}
            </button>

            {error ? <p className="text-red-600 dark:text-red-300 text-sm">{error}</p> : null}
            {message ? <p className="text-emerald-600 dark:text-emerald-300 text-sm">{message}</p> : null}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onResetPassword}>
            <p className="text-sm text-text-tertiary">
              Ingresa el código de 6 dígitos enviado a <strong className="text-text-secondary">{email}</strong>
            </p>
            
            <div>
              <label htmlFor="reset-code" className="block text-sm font-medium text-text-secondary mb-1.5">Código</label>
              <input 
                id="reset-code"
                className={authInputCodeClass} 
                placeholder="000000" 
                type="text"
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                maxLength={6}
                required
              />
              <p className="text-xs text-text-quaternary mt-1">Código de 6 dígitos del correo</p>
            </div>
            
            <div>
              <label htmlFor="reset-newpw" className="block text-sm font-medium text-text-secondary mb-1.5">Nueva contraseña</label>
              <input 
                id="reset-newpw"
                className={authInputFieldClass}
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                type="password" 
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-text-quaternary mt-1">Mínimo 8 caracteres</p>
            </div>
            
            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-text-secondary mb-1.5">Confirmar contraseña</label>
              <input 
                id="reset-confirm"
                className={authInputFieldClass}
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                type="password" 
                autoComplete="new-password"
                required
              />
            </div>

            <button
              className="inline-flex items-center justify-center min-h-11 bg-teal-600 text-white rounded-full px-5 py-3 w-full font-medium disabled:opacity-50 hover:bg-teal-700 btn-base shadow-sm"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>

            {error ? <p className="text-red-600 dark:text-red-300 text-sm">{error}</p> : null}
            {message ? <p className="text-emerald-600 dark:text-emerald-300 text-sm">{message}</p> : null}

            <button
              type="button"
              onClick={() => setStep('email')}
              className="flex items-center justify-center gap-1 min-h-11 text-sm text-text-tertiary hover:text-teal-600 dark:hover:text-teal-400 transition-colors w-full"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al correo
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-1 min-h-11 text-text-tertiary hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
