import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

import Footer from '../Footer';

describe('Footer', () => {
  it('renders Tu Huella brand name', () => {
    render(<Footer />);
    const matches = screen.getAllByText(/Tu\s*Huella/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders explore section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Animales' })).toHaveAttribute('href', '/animals');
    expect(screen.getByRole('link', { name: 'Refugios' })).toHaveAttribute('href', '/shelters');
    expect(screen.getByRole('link', { name: 'Campañas' })).toHaveAttribute('href', '/campaigns');
    expect(screen.getByRole('link', { name: 'Busco Adoptar' })).toHaveAttribute('href', '/looking-to-adopt');
  });

  it('hides account section links when not authenticated', () => {
    render(<Footer />);
    expect(screen.queryByRole('link', { name: 'Favoritos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mis Solicitudes' })).not.toBeInTheDocument();
  });

  it('renders info section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Preguntas Frecuentes' })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: 'Contáctanos' })).toHaveAttribute('href', '/contactanos');
    expect(screen.getByRole('link', { name: 'Registrar Refugio' })).toHaveAttribute('href', '/shelter/onboarding');
  });

  it('renders copyright text with current year', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15'));
    render(<Footer />);
    expect(screen.getByText(/2026.*Tu Huella/)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('renders section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Explorar')).toBeInTheDocument();
    expect(screen.queryByText('Mi Cuenta')).not.toBeInTheDocument();
    expect(screen.getByText('Información')).toBeInTheDocument();
  });

  it('renders account section links when user is authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, isAuthReady: true });
    render(<Footer />);
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Favoritos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mis Solicitudes' })).toBeInTheDocument();
    useAuthStore.setState({ isAuthenticated: false, isAuthReady: false });
  });
});
