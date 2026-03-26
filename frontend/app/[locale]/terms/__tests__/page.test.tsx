import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import TermsPage from '../page';

describe('TermsPage', () => {
  it('renders page title', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Términos y Condiciones');
  });

  it('renders the last updated text with date', () => {
    render(<TermsPage />);
    expect(screen.getByText(/Última actualización/)).toBeInTheDocument();
    expect(screen.getByText(/2026-03-25/)).toBeInTheDocument();
  });

  it('renders section heading "1. Términos Generales de Uso"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Términos Generales de Uso/ })).toBeInTheDocument();
  });

  it('renders section heading "2. Responsabilidades del Usuario"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Responsabilidades del Usuario/ })).toBeInTheDocument();
  });

  it('renders section heading "3. Proceso de Adopción"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Proceso de Adopción/ })).toBeInTheDocument();
  });

  it('renders section heading "4. Donaciones y Apadrinamientos"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Donaciones y Apadrinamientos/ })).toBeInTheDocument();
  });

  it('renders section heading "5. Privacidad y Uso de Datos"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Privacidad y Uso de Datos/ })).toBeInTheDocument();
  });

  it('renders section heading "10. Contacto"', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Contacto/ })).toBeInTheDocument();
  });

  it('renders all ten section headings', () => {
    render(<TermsPage />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(10);
  });
});
