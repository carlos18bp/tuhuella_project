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
    localStorage.clear();
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      error: null,
      fetchFavorites: jest.fn(),
      toggleFavorite: jest.fn().mockResolvedValue({ status: 'removed' }),
      updateFavoriteNote: jest.fn(),
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
      favorites: [makeFavorite({ created_at: '2026-03-28T12:00:00.000Z' })],
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

  it('switches to list view and persists to localStorage', async () => {
    useFavoriteStore.setState({ favorites: [makeFavorite()] });

    render(<FavoritosPage />);
    const listViewBtn = screen.getByRole('button', { name: /Vista lista/ });

    await userEvent.click(listViewBtn);

    expect(localStorage.getItem('fav_view')).toBe('list');
  });

  it('restores view mode from localStorage on mount', () => {
    localStorage.setItem('fav_view', 'list');
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    render(<FavoritosPage />);

    // In list view, the remove button has a different structure (not absolute positioned)
    // Check that the list view button has the active style
    const listViewBtn = screen.getByRole('button', { name: /Vista lista/ });
    expect(listViewBtn.className).toContain('text-teal-700');
  });

  it('filters by size when size chip is clicked', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Luna', size: 'large' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Tiny', size: 'small' }),
      ],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Tiny')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pequeño' }));
    expect(screen.queryByText('Luna')).not.toBeInTheDocument();
    expect(screen.getByText('Tiny')).toBeInTheDocument();
  });

  it('clears active filters when clear button is clicked', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Luna', animal_species: 'dog' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Michi', animal_species: 'cat' }),
      ],
    });

    render(<FavoritosPage />);
    await userEvent.click(screen.getByRole('button', { name: /Gatos/ }));
    expect(screen.queryByText('Luna')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Limpiar filtros'));
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Michi')).toBeInTheDocument();
  });

  it('sorts by name descending when sort option is changed', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Alpha', created_at: '2026-01-01T00:00:00Z' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Zeta', created_at: '2026-01-02T00:00:00Z' }),
      ],
    });

    render(<FavoritosPage />);
    const sortSelect = screen.getByRole('combobox');

    await userEvent.selectOptions(sortSelect, 'name_desc');

    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map(h => h.textContent).filter(n => n === 'Zeta' || n === 'Alpha');
    expect(names[0]).toBe('Zeta');
    expect(names[1]).toBe('Alpha');
  });

  it('sorts by species when sort option is changed', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Luna', animal_species: 'dog' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Michi', animal_species: 'cat' }),
      ],
    });

    render(<FavoritosPage />);
    const sortSelect = screen.getByRole('combobox');

    await userEvent.selectOptions(sortSelect, 'species');

    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map(h => h.textContent).filter(n => n === 'Michi' || n === 'Luna');
    // 'cat' comes before 'dog' alphabetically
    expect(names[0]).toBe('Michi');
    expect(names[1]).toBe('Luna');
  });

  it('renders archived status badge as unavailable', () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite({ status: 'archived' })],
    });

    render(<FavoritosPage />);
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });

  it('shows confirmation dialog when remove button is clicked', async () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    render(<FavoritosPage />);
    await userEvent.click(screen.getByRole('button', { name: /Quitar de favoritos/ }));

    expect(screen.getByText('¿Quitar?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sí' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('shows confirmation dialog and dismiss with No button', async () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    render(<FavoritosPage />);

    // The remove button has aria-label "Quitar de favoritos"
    const removeBtn = screen.getByRole('button', { name: /Quitar de favoritos/ });
    await userEvent.click(removeBtn);

    // After clicking, the confirmation dialog should appear
    expect(screen.getByText('¿Quitar?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sí' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.queryByText('¿Quitar?')).not.toBeInTheDocument();
  });

  it('opens note textarea when note toggle is clicked', async () => {
    useFavoriteStore.setState({
      favorites: [makeFavorite()],
    });

    const { container } = render(<FavoritosPage />);
    // Find the note toggle button by querying for SVG with lucide-sticky-note class
    const noteIcons = container.querySelectorAll('svg.lucide-sticky-note');
    expect(noteIcons.length).toBeGreaterThan(0);

    const noteBtn = noteIcons[0].closest('button')!;
    await userEvent.click(noteBtn);

    expect(screen.getByPlaceholderText('Agrega una nota personal...')).toBeInTheDocument();
  });

  it('toggles compare checkbox and shows compare bar when 2 selected', async () => {
    useFavoriteStore.setState({
      favorites: [
        makeFavorite({ id: 1, animal: 10, animal_name: 'Luna' }),
        makeFavorite({ id: 2, animal: 20, animal_name: 'Max' }),
        makeFavorite({ id: 3, animal: 30, animal_name: 'Michi' }),
      ],
    });

    const { container } = render(<FavoritosPage />);

    // Find compare checkboxes - they contain the lucide-check SVG icon
    const checkIcons = container.querySelectorAll('svg.lucide-check');
    expect(checkIcons.length).toBeGreaterThanOrEqual(3);

    // Click first two compare checkboxes
    await userEvent.click(checkIcons[0].closest('button')!);
    await userEvent.click(checkIcons[1].closest('button')!);

    // Compare floating bar should appear
    expect(screen.getByText('Comparar 2 animales')).toBeInTheDocument();
  });

  it('renders popular animals carousel in empty state when animals exist', () => {
    const { useAnimalStore } = jest.requireActual('@/lib/stores/animalStore') as any;
    useAnimalStore.setState({
      animals: [
        { id: 1, name: 'Popular Dog', species: 'dog', breed: 'Lab', age_range: 'adult', gender: 'male', size: 'large', status: 'published', is_vaccinated: true, is_sterilized: false, is_house_trained: false, good_with_kids: 'unknown', good_with_dogs: 'unknown', good_with_cats: 'unknown', energy_level: 'medium', shelter: 1, shelter_name: 'Shelter', shelter_city: 'City', gallery_urls: [], created_at: '2026-01-01' },
      ],
      loading: false,
      fetchAnimals: jest.fn(),
    });
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      fetchFavorites: jest.fn(),
    });

    render(<FavoritosPage />);

    expect(screen.getByText('Animales populares')).toBeInTheDocument();
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
  });
});
