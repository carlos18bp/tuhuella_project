import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AdminProfileSection from '../AdminProfileSection';

const mockStats = {
  total_users: 1234,
  total_shelters: 56,
  total_animals: 789,
  pending_verifications: 12,
};

describe('AdminProfileSection', () => {
  it('renders platform overview heading', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Resumen de la plataforma')).toBeInTheDocument();
  });

  it('renders stat cards with formatted values', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders em-dash for undefined stats', () => {
    render(<AdminProfileSection />);
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBe(4);
  });

  it('renders quick actions heading', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument();
  });

  it('renders four quick action links', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
    expect(screen.getByText('Gestionar refugios')).toBeInTheDocument();
    expect(screen.getByText('Ver métricas')).toBeInTheDocument();
    expect(screen.getByText('Gestionar blog')).toBeInTheDocument();
  });

  it('renders system health section with last login', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Último acceso')).toBeInTheDocument();
  });

  it('renders admin role badge', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(<AdminProfileSection adminStats={mockStats} />);
    expect(screen.getByText('Usuarios totales')).toBeInTheDocument();
    expect(screen.getByText('Refugios registrados')).toBeInTheDocument();
    expect(screen.getByText('Animales publicados')).toBeInTheDocument();
    expect(screen.getByText('Verificaciones pendientes')).toBeInTheDocument();
  });
});
