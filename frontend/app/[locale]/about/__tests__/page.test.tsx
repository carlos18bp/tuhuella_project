import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  Shield: () => <span data-testid="icon-shield" />,
  Users: () => <span data-testid="icon-users" />,
  Target: () => <span data-testid="icon-target" />,
  Code: () => <span data-testid="icon-code" />,
  Stethoscope: () => <span data-testid="icon-stethoscope" />,
  PawPrint: () => <span data-testid="icon-pawprint" />,
  ArrowRight: () => <span data-testid="icon-arrowright" />,
}));

import AboutPage from '../page';

describe('AboutPage', () => {
  it('renders hero heading "Conectamos corazones"', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conectamos corazones');
  });

  it('renders mission heading "Nuestra misión"', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /Nuestra misión/i })).toBeInTheDocument();
  });

  it('renders the four value cards', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: 'Compasión' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confianza' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Comunidad' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Impacto' })).toBeInTheDocument();
  });

  it('renders "Ver Animales" CTA link', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Ver Animales' })).toBeInTheDocument();
  });

  it('renders "Ver Campañas" CTA link', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Ver Campañas' })).toBeInTheDocument();
  });

  it('renders "Explorar Refugios" CTA link', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Explorar Refugios' })).toBeInTheDocument();
  });
});
