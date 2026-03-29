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
  Container: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  FAQAccordion: () => null,
  SimilarAnimals: () =>
    React.createElement('div', { 'data-testid': 'similar-animals' }),
}));
jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
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
    favorites: [],
    toggleFavorite: jest.fn(),
    isFavorited: jest.fn().mockReturnValue(false),
    fetchFavorites: jest.fn(),
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
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders loading skeleton when animal is null', () => {
    setupMocks({ loading: false, animal: null });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'favorite' })).toBeInTheDocument();
  });

  it('hides favorite button when not authenticated', () => {
    setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: false });
    render(<AnimalDetailPage />);
    expect(screen.queryByRole('button', { name: 'favorite' })).not.toBeInTheDocument();
  });

  it('calls toggleFavorite when favorite button clicked', async () => {
    const state = setupMocks({ loading: false, animal: mockAnimal, isAuthenticated: true });
    render(<AnimalDetailPage />);
    await userEvent.click(screen.getByRole('button', { name: 'favorite' }));
    expect(state.toggleFavorite).toHaveBeenCalledWith(1);
  });

  it('applies favorited styling when animal is favorited', () => {
    setupMocks({
      loading: false,
      animal: mockAnimal,
      isAuthenticated: true,
      favorites: [{ animal: mockAnimal.id }],
    });
    render(<AnimalDetailPage />);
    const heartBtn = screen.getByRole('button', { name: 'favorite' });
    expect(heartBtn.className).toContain('bg-red-50');
  });

  it('calls fetchAnimal on mount with id from params', () => {
    const state = setupMocks();
    render(<AnimalDetailPage />);
    expect(state.fetchAnimal).toHaveBeenCalledWith(1, 'es');
  });

  // ── New field tests ──────────────────────────────────────────────────────

  it('renders details section with weight', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('details-section')).toBeInTheDocument();
    expect(screen.getByText('18.5 kg')).toBeInTheDocument();
  });

  it('renders energy level in details section', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Nivel de energía')).toBeInTheDocument();
    expect(screen.getByText('Medio')).toBeInTheDocument();
  });

  it('renders coat color when provided', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Golden')).toBeInTheDocument();
  });

  it('renders house trained badge when true', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Entrenado para casa')).toBeInTheDocument();
  });

  it('renders microchip ID when provided', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText('MC-001-LUNA')).toBeInTheDocument();
  });

  it('renders compatibility section when not all unknown', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('compatibility-section')).toBeInTheDocument();
    expect(screen.getByText(/Niños/)).toBeInTheDocument();
  });

  it('hides compatibility section when all unknown', () => {
    const allUnknown = {
      ...mockAnimal,
      good_with_kids: 'unknown',
      good_with_dogs: 'unknown',
      good_with_cats: 'unknown',
    };
    setupMocks({ loading: false, animal: allUnknown });
    render(<AnimalDetailPage />);
    expect(screen.queryByTestId('compatibility-section')).not.toBeInTheDocument();
  });

  it('renders adoption in progress badge for in_process status', () => {
    const inProcess = { ...mockAnimal, status: 'in_process' };
    setupMocks({ loading: false, animal: inProcess });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('En proceso de adopción');
  });

  it('does not render status badge for published status', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.queryByTestId('status-badge')).not.toBeInTheDocument();
  });

  it('renders published ago text', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByText(/Publicado hace/)).toBeInTheDocument();
  });

  it('renders intake date when provided', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('intake-date')).toBeInTheDocument();
    expect(screen.getByText(/En el refugio hace/)).toBeInTheDocument();
  });

  it('hides intake date when not provided', () => {
    const noIntake = { ...mockAnimal, intake_date: undefined };
    setupMocks({ loading: false, animal: noIntake });
    render(<AnimalDetailPage />);
    expect(screen.queryByTestId('intake-date')).not.toBeInTheDocument();
  });

  it('renders similar animals component', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('similar-animals')).toBeInTheDocument();
  });

  it('renders shelter name as a link', () => {
    setupMocks({ loading: false, animal: mockAnimal });
    render(<AnimalDetailPage />);
    const shelterLink = screen.getByText('Patitas Felices');
    expect(shelterLink.closest('a')).toHaveAttribute('href', '/shelter/1');
  });

  it('renders compatibility "no" labels correctly', () => {
    const noCompat = {
      ...mockAnimal,
      good_with_kids: 'no',
      good_with_dogs: 'no',
      good_with_cats: 'yes',
    };
    setupMocks({ loading: false, animal: noCompat });
    render(<AnimalDetailPage />);
    expect(screen.getByTestId('compatibility-section')).toBeInTheDocument();
    // Kids and Dogs should show "No" label
    expect(screen.getByText(/Niños.*No/)).toBeInTheDocument();
    expect(screen.getByText(/Perros.*No/)).toBeInTheDocument();
    // Cats should show "Sí"
    expect(screen.getByText(/Gatos.*Sí/)).toBeInTheDocument();
  });

  it('renders low energy icon and label', () => {
    const lowEnergy = { ...mockAnimal, energy_level: 'low' };
    setupMocks({ loading: false, animal: lowEnergy });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Bajo')).toBeInTheDocument();
  });

  it('renders high energy icon and label', () => {
    const highEnergy = { ...mockAnimal, energy_level: 'high' };
    setupMocks({ loading: false, animal: highEnergy });
    render(<AnimalDetailPage />);
    expect(screen.getByText('Alto')).toBeInTheDocument();
  });
});
