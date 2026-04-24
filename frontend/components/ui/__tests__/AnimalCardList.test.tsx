import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AnimalCardList from '../AnimalCardList';
import { mockAnimals } from '@/lib/__tests__/fixtures';

describe('AnimalCardList', () => {
  it('renders animal name and breed info', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText(/Labrador/)).toBeInTheDocument();
  });

  it('renders cat species animal', () => {
    render(<AnimalCardList animal={mockAnimals[1]} />);

    expect(screen.getByText('Milo')).toBeInTheDocument();
  });

  it('renders other species animal', () => {
    render(<AnimalCardList animal={mockAnimals[3]} />);

    expect(screen.getByText('Coco')).toBeInTheDocument();
  });

  it('shows gender badge for female gender', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    expect(screen.getByText('Hembra')).toBeInTheDocument();
  });

  it('shows gender badge for male gender', () => {
    render(<AnimalCardList animal={mockAnimals[1]} />);

    expect(screen.getByText('Macho')).toBeInTheDocument();
  });

  it('hides gender badge when gender is unknown', () => {
    render(<AnimalCardList animal={mockAnimals[3]} />);

    expect(screen.queryByText('Macho')).not.toBeInTheDocument();
    expect(screen.queryByText('Hembra')).not.toBeInTheDocument();
  });

  it('shows vaccinated badge when animal is vaccinated', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    expect(screen.getByText('Vacunado')).toBeInTheDocument();
  });

  it('shows sterilized badge when animal is sterilized', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    expect(screen.getByText('Esterilizado')).toBeInTheDocument();
  });

  it('hides vaccinated and sterilized badges when not applicable', () => {
    render(<AnimalCardList animal={mockAnimals[2]} />);

    expect(screen.queryByText('Vacunado')).not.toBeInTheDocument();
    expect(screen.queryByText('Esterilizado')).not.toBeInTheDocument();
  });

  it('renders shelter name', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('links to animal detail page', () => {
    render(<AnimalCardList animal={mockAnimals[0]} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('1'));
  });
});
