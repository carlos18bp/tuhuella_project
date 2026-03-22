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
    expect(screen.getByRole('link', { name: /Explorar animales/ })).toHaveAttribute('href', '/animales');
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
});
