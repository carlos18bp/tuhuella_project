import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tu Huella — Adopta, Apadrina, Transforma',
  description: 'Plataforma de adopción y apadrinamiento animal. Conectamos refugios con personas que quieren dar un hogar o apoyar a un animal.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
