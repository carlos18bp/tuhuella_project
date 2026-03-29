import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterProfile from '../ShelterProfile';
import type { Shelter } from '@/lib/types';

const baseShelter: Shelter = {
  id: 1,
  name: 'Patitas Felices',
  city: 'Bogotá',
  verification_status: 'verified',
  is_verified: true,
  owner_email: 'admin@patitas.org',
  created_at: '2026-01-01T00:00:00Z',
};

describe('ShelterProfile', () => {
  it('renders shelter name as heading', () => {
    render(<ShelterProfile shelter={baseShelter} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Patitas Felices');
  });

  it('renders shelter city', () => {
    render(<ShelterProfile shelter={baseShelter} />);
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
  });

  it('renders verified badge', () => {
    render(<ShelterProfile shelter={baseShelter} />);
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const shelter = { ...baseShelter, description: 'We rescue animals' };
    render(<ShelterProfile shelter={shelter} />);
    expect(screen.getByText('We rescue animals')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<ShelterProfile shelter={baseShelter} />);
    expect(screen.queryByText('We rescue animals')).toBeNull();
  });

  it('renders phone when provided', () => {
    const shelter = { ...baseShelter, phone: '+57 300 123 4567' };
    render(<ShelterProfile shelter={shelter} />);
    expect(screen.getByText('+57 300 123 4567')).toBeInTheDocument();
  });

  it('renders email when provided', () => {
    const shelter = { ...baseShelter, email: 'info@patitas.org' };
    render(<ShelterProfile shelter={shelter} />);
    expect(screen.getByText('info@patitas.org')).toBeInTheDocument();
  });

  it('renders website link when provided', () => {
    const shelter = { ...baseShelter, website: 'https://patitas.org' };
    render(<ShelterProfile shelter={shelter} />);
    const link = screen.getByRole('link', { name: 'https://patitas.org' });
    expect(link).toHaveAttribute('href', 'https://patitas.org');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
