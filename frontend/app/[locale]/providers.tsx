'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthSyncProvider } from '@/components/providers/AuthSyncProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

  return (
    <ThemeProvider>
      <AuthSyncProvider>{content}</AuthSyncProvider>
    </ThemeProvider>
  );
}
