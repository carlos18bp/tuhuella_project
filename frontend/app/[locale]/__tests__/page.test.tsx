import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import HomePage from '../page';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { mockAnimals, mockCampaigns, mockShelters } from '@/lib/__tests__/fixtures';

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => React.createElement('div', { 'data-testid': 'swiper' }, children),
  SwiperSlide: ({ children }: any) => React.createElement('div', null, children),
}));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {}, Autoplay: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});

jest.mock('@/lib/stores/animalStore', () => ({ useAnimalStore: jest.fn() }));
jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/lib/stores/shelterStore', () => ({ useShelterStore: jest.fn() }));
jest.mock('@/lib/hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({ current: null }),
}));
jest.mock('@/components/ui', () => ({
  AnimalCard: ({ animal }: any) =>
    React.createElement('div', { 'data-testid': `animal-${animal.id}` }, animal.name),
  CampaignCard: ({ campaign }: any) =>
    React.createElement('div', { 'data-testid': `campaign-${campaign.id}` }, campaign.title),
  ShelterCard: ({ shelter }: any) =>
    React.createElement('div', { 'data-testid': `shelter-${shelter.id}` }, shelter.name),
  FAQAccordion: () => null,
}));
jest.mock('@/lib/data/faqs', () => ({ homeFaqs: [] }));

const mockUseAnimalStore = useAnimalStore as unknown as jest.Mock;
const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;
const mockUseShelterStore = useShelterStore as unknown as jest.Mock;

const setupMocks = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    animals: [],
    fetchAnimals: jest.fn(),
    campaigns: [],
    fetchCampaigns: jest.fn(),
    shelters: [],
    fetchShelters: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseAnimalStore.mockImplementation((sel: any) => sel(state));
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  mockUseShelterStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('HomePage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders hero heading', () => {
    setupMocks();
    render(<HomePage />);
    expect(screen.getByText('Cada huella cuenta.')).toBeInTheDocument();
  });

  it('renders hero CTA links', () => {
    setupMocks();
    render(<HomePage />);
    expect(screen.getByText('Ver Animales')).toBeInTheDocument();
    expect(screen.getByText('Busco Adoptar')).toBeInTheDocument();
    expect(screen.getByText('Donar')).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    setupMocks();
    render(<HomePage />);
    expect(screen.getByText('¿Cómo funciona?')).toBeInTheDocument();
    expect(screen.getByText('Explora')).toBeInTheDocument();
    expect(screen.getByText('Conecta')).toBeInTheDocument();
    expect(screen.getByText('Transforma')).toBeInTheDocument();
  });

  it('renders loading skeletons when no animals', () => {
    setupMocks({ animals: [] });
    const { container } = render(<HomePage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders featured animal cards when animals are loaded', () => {
    setupMocks({ animals: mockAnimals });
    render(<HomePage />);
    expect(screen.getByTestId('animal-1')).toBeInTheDocument();
    expect(screen.getByTestId('animal-2')).toBeInTheDocument();
  });

  it('renders campaign section when campaigns are loaded', () => {
    setupMocks({ campaigns: mockCampaigns });
    render(<HomePage />);
    expect(screen.getByText('Campañas activas')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-1')).toBeInTheDocument();
  });

  it('hides campaign section when no campaigns', () => {
    setupMocks({ campaigns: [] });
    render(<HomePage />);
    expect(screen.queryByText('Campañas activas')).not.toBeInTheDocument();
  });

  it('renders shelter section when shelters are loaded', () => {
    setupMocks({ shelters: mockShelters });
    render(<HomePage />);
    expect(screen.getByText('Refugios destacados')).toBeInTheDocument();
    expect(screen.getByTestId('shelter-1')).toBeInTheDocument();
  });

  it('hides shelter section when no shelters', () => {
    setupMocks({ shelters: [] });
    render(<HomePage />);
    expect(screen.queryByText('Refugios destacados')).not.toBeInTheDocument();
  });

  it('calls fetchAnimals when animals array is empty', () => {
    const state = setupMocks({ animals: [] });
    render(<HomePage />);
    expect(state.fetchAnimals).toHaveBeenCalled();
  });

  it('does not call fetchAnimals when animals already loaded', () => {
    const state = setupMocks({ animals: mockAnimals });
    render(<HomePage />);
    expect(state.fetchAnimals).not.toHaveBeenCalled();
  });

  it('renders feature cards in hero section', () => {
    setupMocks();
    render(<HomePage />);
    expect(screen.getByText('Proceso guiado y seguro')).toBeInTheDocument();
    expect(screen.getByText('Apoya mensual o una vez')).toBeInTheDocument();
    expect(screen.getByText('Verificados y confiables')).toBeInTheDocument();
  });
});
