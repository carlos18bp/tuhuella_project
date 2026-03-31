import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TermsPage from '../page';

jest.mock('@/components/ui', () => ({
  Container: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'page-container' }, children),
  TermsModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'terms-modal' },
          React.createElement('button', { 'data-testid': 'close-modal', onClick: onClose }, 'Close'),
        )
      : null,
}));

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

  it('renders interactive read button', () => {
    render(<TermsPage />);
    expect(screen.getByRole('button', { name: /Términos y Condiciones/ })).toBeInTheDocument();
  });

  it('opens modal when button is clicked', async () => {
    render(<TermsPage />);
    expect(screen.queryByTestId('terms-modal')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Términos y Condiciones/ }));
    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();
  });

  it('closes modal when onClose is triggered', async () => {
    render(<TermsPage />);
    await userEvent.click(screen.getByRole('button', { name: /Términos y Condiciones/ }));
    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('terms-modal')).not.toBeInTheDocument();
  });
});
