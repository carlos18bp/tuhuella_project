import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import Footer from '../Footer';

describe('Footer', () => {
  it('renders Mi Huella brand name', () => {
    render(<Footer />);
    const matches = screen.getAllByText(/Mi\s*Huella/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders explore section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Animales' })).toHaveAttribute('href', '/animales');
    expect(screen.getByRole('link', { name: 'Refugios' })).toHaveAttribute('href', '/refugios');
    expect(screen.getByRole('link', { name: 'Campañas' })).toHaveAttribute('href', '/campanas');
    expect(screen.getByRole('link', { name: 'Busco Adoptar' })).toHaveAttribute('href', '/busco-adoptar');
  });

  it('renders account section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Favoritos' })).toHaveAttribute('href', '/favoritos');
    expect(screen.getByRole('link', { name: 'Mis Solicitudes' })).toHaveAttribute('href', '/mis-solicitudes');
    expect(screen.getByRole('link', { name: 'Mis Donaciones' })).toHaveAttribute('href', '/mis-donaciones');
    expect(screen.getByRole('link', { name: 'Mis Apadrinamientos' })).toHaveAttribute('href', '/mis-apadrinamientos');
  });

  it('renders info section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Preguntas Frecuentes' })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: 'Registrar Refugio' })).toHaveAttribute('href', '/refugio/onboarding');
  });

  it('renders copyright text with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${currentYear}.*Mi Huella`))).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Explorar')).toBeInTheDocument();
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Información')).toBeInTheDocument();
  });
});
