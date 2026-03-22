import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnimalDetailPage from '../page';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { useFavoriteStore } from '@/lib/stores/favoriteStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { mockAnimal } from '@/lib/__tests__/fixtures';

jest.mock('next/navigation', () => ({
  useParams: () => ({ animalId: '1' }),
}));

jest.mock('@/lib/stores/animalStore', () => ({ useAnimalStore: jest.fn() }));
jest.mock('@/lib/stores/favoriteStore', () => ({ useFavoriteStore: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/components/ui', () => ({
  AnimalGallery: ({ name }: any) =>
    React.createElement('div', { 'data-testid': 'gallery' }, name),
}));

const mockUseAnimalStore = useAnimalStore as unknown as jest.Mock;
const mockUseFavoriteStore = useFavoriteStore as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const setupMocks = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    animal: null,
    loading: true,
    fetchAnimal: jest.fn(),
    isAuthenticated: false,
    toggleFavorite: jest.fn(),
    isFavorited: jest.fn().mockReturnValue(false),
    user: null,
  };
  const state = { ...defaults, ...overrides };
  mockUseAnimalStore.mockImplementation((sel: any) => sel(state));
  mockUseFavoriteStore.mockImplementation((sel: any) => sel(state));
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('AnimalDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    setupMocks({ loading: true, animal: null });
    const { container } = render(<AnimalDetailPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders loading skeleton when animal is null', () => {
    setupMocks({ loading: false, animal: null });
    const { container } = render(<AnimalDetailPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders animal name when loaded', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luna');
  });

  it('renders back link to animals list', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText(/Volver a animales/)).toBeInTheDocument();
  });

  it('renders animal gallery', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('gallery')).toBeInTheDocument();
  });

  it('renders breed, age, size, and gender badges', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Labrador')).toBeInTheDocument();
    expect(screen.getByText('young')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Hembra')).toBeInTheDocument();
  });

  it('renders male gender label for male animal', () => {
    const maleAnimal = { ...mockAnimal, gender: 'male' };
    setupMocks({ loading: false, animal: maleAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Macho')).toBeInTheDocument();
  });

  it('renders unknown gender label for unknown gender', () => {
    const unknownAnimal = { ...mockAnimal, gender: 'unknown' };
    setupMocks({ loading: false, animal: unknownAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Desconocido')).toBeInTheDocument();
  });

  it('renders vaccinated badge when is_vaccinated', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Vacunado')).toBeInTheDocument();
  });

  it('renders sterilized badge when is_sterilized', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Esterilizado')).toBeInTheDocument();
  });

  it('hides vaccinated badge when not vaccinated', () => {
    const unvaccinated = { ...mockAnimal, is_vaccinated: false };
    setupMocks({ loading: false, animal: unvaccinated });
    render(<AnimalDetailPage />);
    expect(screen.queryByText('Vacunado')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Perrita cariñosa y juguetona')).toBeInTheDocument();
  });

  it('hides description when not provided', () => {
    const noDesc = { ...mockAnimal, description: undefined };
    setupMocks({ loading: false, animal: noDesc });
    render(<AnimalDetailPage />);
    expect(screen.queryByText('Perrita cariñosa y juguetona')).not.toBeInTheDocument();
  });

  it('renders special needs section when provided', () => {
    const withNeeds = { ...mockAnimal, special_needs: 'Needs daily exercise' };
    setupMocks({ loading: false, animal: withNeeds });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Needs daily exercise')).toBeInTheDocument();
    expect(screen.getByText('Necesidades especiales')).toBeInTheDocument();
  });

  it('shows sign-in CTA when not authenticated', () => {
    setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: false });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Inicia sesión para adoptar o apadrinar')).toBeInTheDocument();
  });

  it('shows adoption and sponsorship links when authenticated', () => {
    setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: true });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Solicitar Adopción')).toBeInTheDocument();
    expect(screen.getByText('Apadrinar')).toBeInTheDocument();
  });

  it('shows favorite button when authenticated', () => {
    setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: true });
    render(<AnimalDetailPage />);
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('hides favorite button when not authenticated', () => {
    setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: false });
    render(<AnimalDetailPage />);
    expect(screen.queryByText('♥')).not.toBeInTheDocument();
  });

  it('calls toggleFavorite when favorite button clicked', async () => {
    const state = setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: true });
    render(<AnimalDetailPage />);
    await userEvent.click(screen.getByText('♥'));
    expect(state.toggleFavorite).toHaveBeenCalledWith(1);
  });

  it('applies favorited styling when animal is favorited', () => {
    setupMocks({
      loading: false,
      animal: mockAnimal,
      isAuthenticated: true,
      isFavorited: jest.fn().mockReturnValue(true),
    });
    render(<AnimalDetailPage />);
    const btn = screen.getByText('♥').closest('button');
    expect(btn?.className).toContain('bg-red-50');
  });

  it('calls fetchAnimal on mount with id from params', () => {
    const state = setupMocks();
    render(<AnimalDetailPage />);
    expect(state.fetchAnimal).toHaveBeenCalledWith(1);
  });
});
