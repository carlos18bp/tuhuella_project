import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterAdminProfileSection from '../ShelterAdminProfileSection';

const baseShelter = {
  name: 'Patitas Felices',
  legal_name: 'Fundación Patitas',
  description: 'Refugio dedicado al rescate de animales',
  city: 'Bogotá',
  address: 'Calle 45 #12-30',
  phone: '3001112233',
  email: 'info@patitas.org',
  website: 'https://patitas.org',
  verification_status: 'verified' as const,
};

const baseStats = {
  animals_count: 15,
  pending_applications: 3,
  active_campaigns: 2,
};

describe('ShelterAdminProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders no-shelter message when shelter is null', () => {
    render(<ShelterAdminProfileSection shelter={null} />);
    expect(screen.getByText('No tienes un refugio registrado')).toBeInTheDocument();
    expect(screen.getByText('Registra tu refugio para publicar animales y gestionar adopciones.')).toBeInTheDocument();
  });

  it('renders register shelter link when shelter is null', () => {
    render(<ShelterAdminProfileSection shelter={null} />);
    expect(screen.getByText('registerShelter')).toBeInTheDocument();
  });

  it('renders shelter name when shelter is provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('renders verified badge for verified status', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('renders pending badge for pending status', () => {
    render(
      <ShelterAdminProfileSection
        shelter={{ ...baseShelter, verification_status: 'pending' }}
      />,
    );
    expect(screen.getByText('Pendiente de verificación')).toBeInTheDocument();
  });

  it('renders rejected badge for rejected status', () => {
    render(
      <ShelterAdminProfileSection
        shelter={{ ...baseShelter, verification_status: 'rejected' }}
      />,
    );
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
  });

  it('renders city and address when provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Calle 45 #12-30, Bogotá')).toBeInTheDocument();
  });

  it('renders phone when provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('3001112233')).toBeInTheDocument();
  });

  it('renders email when provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('info@patitas.org')).toBeInTheDocument();
  });

  it('renders website link when provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    const link = screen.getByText('https://patitas.org');
    expect(link).toHaveAttribute('href', 'https://patitas.org');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders description when provided', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Refugio dedicado al rescate de animales')).toBeInTheDocument();
  });

  it('hides contact info when not provided', () => {
    const minimal = { name: 'Test', verification_status: 'verified' as const };
    render(<ShelterAdminProfileSection shelter={minimal} />);
    expect(screen.queryByText('3001112233')).not.toBeInTheDocument();
    expect(screen.queryByText('info@patitas.org')).not.toBeInTheDocument();
  });

  it('renders stats cards with provided values', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} stats={baseStats} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders stats cards with default zero values when stats undefined', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('renders quick action links', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Agregar animal')).toBeInTheDocument();
    expect(screen.getByText('Ver solicitudes')).toBeInTheDocument();
    expect(screen.getByText('Crear campaña')).toBeInTheDocument();
  });

  it('renders manage shelter link', () => {
    render(<ShelterAdminProfileSection shelter={baseShelter} />);
    expect(screen.getByText('Administrar refugio')).toBeInTheDocument();
  });
});
