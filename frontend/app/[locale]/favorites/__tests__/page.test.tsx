import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => React.createElement('div', { 'data-testid': 'swiper' }, children),
  SwiperSlide: ({ children }: any) => React.createElement('div', null, children),
}));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {}, Autoplay: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});

import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import type { Favorite } from '@/lib/types';

import FavoritosPage from '../page';

const makeFavorite = (overrides: Partial<Favorite> = {}): Favorite => ({
  id: 1,
  animal: 10,
  animal_name: 'Luna',
  animal_species: 'dog',
  breed: 'Labrador',
  age_range: 'young',
  size: 'large',
  gender: 'female',
  is_vaccinated: true,
  is_sterilized: false,
  status: 'published',
  shelter_name: 'Happy Paws',
  shelter_city: 'Bogotá',
  thumbnail_url: null,
  note: '',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('FavoritosPage', () => {
  beforeEach(() => {
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      error: null,
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

  it('renders AnimalCard when favorites exist', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText(/Labrador/)).toBeInTheDocument();
    expect(screen.getByText('Happy Paws')).toBeInTheDocument();
  });

  it('renders counter in title when favorites exist', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite(), makeFavorite({ id: 2, animal: 20, animal_name: 'Max' })],
    });

    render(<FavoritosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis favoritos (2)');
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

  it('renders adopted status badge', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite({ status: 'adopted' })],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('Adoptado')).toBeInTheDocument();
  });

  it('renders in_process status badge', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite({ status: 'in_process' })],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('En proceso')).toBeInTheDocument();
  });

  it('renders remove favorite button', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    render(<FavoritosPage />);
    expect(screen.getByRole('button', { name: /Quitar de favoritos/ })).toBeInTheDocument();
  });

  it('renders relative saved date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-28T12:00:00Z'));

    useFavoriteStore.setState({
      favorites: [makeFavorite({ created_at: new Date().toISOString() })],
    });

    render(<FavoritosPage />);
    expect(screen.getByText(/Guardado hoy/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('renders species filter chips when favorites exist', () => {
    useFavoriteStore.setState({ favorites: [makeFavorite()] });

    render(<FavoritosPage />);
    const allButtons = screen.getAllByRole('button', { name: 'Todos' });
    expect(allButtons.length).toBe(2); // species + size
    expect(screen.getByRole('button', { name: /Perros/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gatos/ })).toBeInTheDocument();
  });

  it('filters by species when chip is clicked', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Luna', animal_species: 'dog' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Michi', animal_species: 'cat' }),
      ],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Michi')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Gatos/ }));
    expect(screen.queryByText('Luna')).not.toBeInTheDocument();
    expect(screen.getByText('Michi')).toBeInTheDocument();
  });

  it('renders grid/list view toggle', () => {
    useFavoriteStore.setState({ favorites: [makeFavorite()] });

    render(<FavoritosPage />);
    expect(screen.getByRole('button', { name: /Vista cuadrícula/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vista lista/ })).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    useFavoriteStore.setState({ favorites: [makeFavorite()] });

    render(<FavoritosPage />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows no-results message when filter has no matches', async () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite({ animal_species: 'dog' })],
    });

    render(<FavoritosPage />);
    await userEvent.click(screen.getByRole('button', { name: /Gatos/ }));
    expect(screen.getByText('No hay favoritos que coincidan con los filtros')).toBeInTheDocument();
  });
});
