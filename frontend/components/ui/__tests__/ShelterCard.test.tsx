import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterCard from '../ShelterCard';
import { mockShelters } from '@/lib/__tests__/fixtures';
import type { Shelter } from '@/lib/types';

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
    expect(link).toHaveAttribute('href', '/shelters/1');
  });

  it('shows verified badge for verified shelters', () => {
    render(<ShelterCard shelter={mockShelters[0]} />);
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('hides verified badge for unverified shelters', () => {
    render(<ShelterCard shelter={mockShelters[1]} />);
    expect(screen.queryByText('Verificado')).not.toBeInTheDocument();
  });

  it('renders cover image when cover_image_url is provided', () => {
    const shelter: Shelter = {
      ...mockShelters[0],
      cover_image_url: 'https://example.com/cover.jpg',
    };
    render(<ShelterCard shelter={shelter} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(img).toHaveAttribute('alt', shelter.name);
  });

  it('renders logo image when only logo_url is provided', () => {
    const shelter: Shelter = {
      ...mockShelters[0],
      cover_image_url: undefined,
      logo_url: 'https://example.com/logo.jpg',
    };
    render(<ShelterCard shelter={shelter} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/logo.jpg');
  });

  it('renders placeholder icon when no image urls are provided', () => {
    const shelter: Shelter = {
      ...mockShelters[0],
      cover_image_url: undefined,
      logo_url: undefined,
    };
    render(<ShelterCard shelter={shelter} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render description section when description is absent', () => {
    const shelter: Shelter = {
      ...mockShelters[1],
      description: undefined,
    };
    render(<ShelterCard shelter={shelter} />);
    expect(screen.queryByText('Centro de adopción en Medellín')).not.toBeInTheDocument();
  });
});
