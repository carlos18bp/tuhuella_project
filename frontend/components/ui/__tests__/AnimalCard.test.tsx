import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AnimalCard from '../AnimalCard';
import { mockAnimals } from '@/lib/__tests__/fixtures';

describe('AnimalCard', () => {
  it('renders animal name', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('renders breed, age range and size', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Labrador · young · medium')).toBeInTheDocument();
  });

  it('renders shelter name', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('links to animal detail page', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/animales/1');
  });

  it('shows gender badge for female animal', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Hembra')).toBeInTheDocument();
  });

  it('shows gender badge for male animal', () => {
    render(<AnimalCard animal={mockAnimals[1]} />);
    expect(screen.getByText('Macho')).toBeInTheDocument();
  });

  it('shows vaccinated badge when is_vaccinated is true', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Vacunado')).toBeInTheDocument();
  });

  it('shows sterilized badge when is_sterilized is true', () => {
    render(<AnimalCard animal={mockAnimals[0]} />);
    expect(screen.getByText('Esterilizado')).toBeInTheDocument();
  });

  it('hides vaccinated badge when is_vaccinated is false', () => {
    render(<AnimalCard animal={mockAnimals[2]} />);
    expect(screen.queryByText('Vacunado')).not.toBeInTheDocument();
  });

  it('renders dog emoji for dog species', () => {
    const { container } = render(<AnimalCard animal={mockAnimals[0]} />);
    expect(container.textContent).toContain('🐕');
  });

  it('renders cat emoji for cat species', () => {
    const { container } = render(<AnimalCard animal={mockAnimals[1]} />);
    expect(container.textContent).toContain('🐈');
  });

  it('renders generic emoji for other species', () => {
    const otherAnimal = { ...mockAnimals[0], species: 'rabbit' as never };
    const { container } = render(<AnimalCard animal={otherAnimal} />);
    expect(container.textContent).toContain('🐾');
  });

  it('hides gender badge when gender is unknown', () => {
    const unknownGender = { ...mockAnimals[0], gender: 'unknown' as never };
    render(<AnimalCard animal={unknownGender} />);
    expect(screen.queryByText('Macho')).not.toBeInTheDocument();
    expect(screen.queryByText('Hembra')).not.toBeInTheDocument();
  });
});
