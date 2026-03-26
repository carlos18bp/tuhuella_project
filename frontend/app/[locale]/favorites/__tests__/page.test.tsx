import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useFavoriteStore } from '@/lib/stores/favoriteStore';

import FavoritosPage from '../page';

describe('FavoritosPage', () => {
  beforeEach(() => {
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      fetchFavorites: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<FavoritosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis favoritos');
  });

  it('renders empty state when no favorites', () => {
    render(<FavoritosPage />);
    expect(screen.getByText('No tienes favoritos aún')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar animales/ })).toHaveAttribute('href', '/animals');
  });

  it('renders favorite cards when favorites exist', () => {
    useFavoriteStore.setState({
      favorites: [
        {
          id: 1,
          animal: 10,
          animal_name: 'Luna',
          animal_species: 'dog',
          shelter_name: 'Happy Paws',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText(/Perro · Happy Paws/)).toBeInTheDocument();
  });

  it('renders loading skeletons when loading is true', () => {
    useFavoriteStore.setState({
      favorites: [],
      loading: true,
      fetchFavorites: jest.fn(),
    });

    render(<FavoritosPage />);
    const skeletons = document.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders cat species label for cat favorite', () => {
    useFavoriteStore.setState({
      favorites: [
        {
          id: 2,
          animal: 20,
          animal_name: 'Michi',
          animal_species: 'cat',
          shelter_name: 'Cat Rescue',
          created_at: '2026-01-05T00:00:00Z',
        },
      ],
    });

    render(<FavoritosPage />);
    expect(screen.getByText(/Gato · Cat Rescue/)).toBeInTheDocument();
  });

  it('renders other species label for non-dog non-cat favorite', () => {
    useFavoriteStore.setState({
      favorites: [
        {
          id: 3,
          animal: 30,
          animal_name: 'Coney',
          animal_species: 'rabbit',
          shelter_name: 'Zoo Rescue',
          created_at: '2026-01-10T00:00:00Z',
        },
      ],
    });

    render(<FavoritosPage />);
    expect(screen.getByText(/Otro · Zoo Rescue/)).toBeInTheDocument();
  });
});
