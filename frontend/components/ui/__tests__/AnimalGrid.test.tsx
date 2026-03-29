import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AnimalGrid from '../AnimalGrid';

const mockAnimals = [
  {
    id: 1,
    name: 'Luna',
    species: 'dog' as const,
    breed: 'Labrador',
    age_range: 'young' as const,
    gender: 'female' as const,
    size: 'medium' as const,
    status: 'published' as const,
    shelter_name: 'Happy Paws',
    shelter: 1,
    is_vaccinated: true,
    is_sterilized: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Milo',
    species: 'cat' as const,
    breed: 'Siamese',
    age_range: 'adult' as const,
    gender: 'male' as const,
    size: 'small' as const,
    status: 'published' as const,
    shelter_name: 'Cat Haven',
    shelter: 2,
    is_vaccinated: false,
    is_sterilized: true,
    created_at: '2026-01-02T00:00:00Z',
  },
];

describe('AnimalGrid', () => {
  it('renders animal cards when animals are provided', () => {
    render(<AnimalGrid animals={mockAnimals} />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Milo')).toBeInTheDocument();
  });

  it('renders empty message when animals array is empty', () => {
    render(<AnimalGrid animals={[]} />);
    expect(screen.getByText('No se encontraron animales.')).toBeInTheDocument();
  });

  it('renders custom empty message when provided', () => {
    render(<AnimalGrid animals={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders skeleton placeholders when loading', () => {
    const { container } = render(<AnimalGrid animals={[]} loading={true} skeletonCount={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });
});
