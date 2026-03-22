import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterCard from '../ShelterCard';
import { mockShelters } from '@/lib/__tests__/fixtures';

describe('ShelterCard', () => {
  it('renders shelter name', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('renders shelter city', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
  });

  it('renders shelter description when provided', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    expect(screen.getByText('Refugio dedicado al rescate de animales en Bogotá')).toBeInTheDocument();
  });

  it('links to shelter detail page', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/refugios/1');
  });

  it('shows verified badge for verified shelters', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('hides verified badge for unverified shelters', () => {
    render(<ShelterCard shelter={mockShelters[1]} />);
    expect(screen.queryByText('Verificado')).not.toBeInTheDocument();
  });
});
