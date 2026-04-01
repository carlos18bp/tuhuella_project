import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterAnimalsPage from '../page';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { mockAnimals } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/animalStore', () => ({ useAnimalStore: jest.fn() }));

const mockUseAnimalStore = useAnimalStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    animals: [],
    loading: false,
    fetchAnimals: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseAnimalStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterAnimalsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<ShelterAnimalsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gestión de Animales');
  });

  it('renders add animal link', () => {
    setupMock();
    render(<ShelterAnimalsPage />);
    expect(screen.getByText('+ Agregar animal')).toBeInTheDocument();
  });

  it('renders animal count', () => {
    setupMock({ animals: mockAnimals });
    render(<ShelterAnimalsPage />);
    expect(
      screen.getByText(`${mockAnimals.length} animales registrados`),
    ).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    render(<ShelterAnimalsPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders empty message when no animals match filter', () => {
    setupMock({ animals: [] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText('No hay animales con este filtro.')).toBeInTheDocument();
  });

  it('renders animal cards when animals are loaded', () => {
    setupMock({ animals: mockAnimals });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Milo')).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    setupMock();
    render(<ShelterAnimalsPage />);
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Borrador' })).toBeInTheDocument();
  });

  it('filters animals when status button is clicked', async () => {
    setupMock({ animals: mockAnimals });
    render(<ShelterAnimalsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Borrador' }));

    expect(screen.queryByText('Luna')).not.toBeInTheDocument();
  });

  it('shows all animals when Todos filter is clicked', async () => {
    setupMock({ animals: mockAnimals });
    render(<ShelterAnimalsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Borrador' }));
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));

    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('renders species label for dog', () => {
    setupMock({ animals: [mockAnimals[0]] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText(/Perro/)).toBeInTheDocument();
  });

  it('renders species label for cat', () => {
    setupMock({ animals: [mockAnimals[1]] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText(/Gato/)).toBeInTheDocument();
  });

  it('renders species label for other', () => {
    const otherAnimal = { ...mockAnimals[0], species: 'rabbit' };
    setupMock({ animals: [otherAnimal] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText(/Otro/)).toBeInTheDocument();
  });

  it('renders vaccination status', () => {
    setupMock({ animals: [mockAnimals[0]] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText(/✓ Vacunado/)).toBeInTheDocument();
    expect(screen.getByText(/✓ Esterilizado/)).toBeInTheDocument();
  });

  it('renders unvaccinated status', () => {
    setupMock({ animals: [mockAnimals[2]] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText(/✗ Sin vacunar/)).toBeInTheDocument();
  });

  it('renders fallback status for unknown status value', () => {
    const unknownStatus = { ...mockAnimals[0], status: 'custom_status' };
    setupMock({ animals: [unknownStatus] });
    render(<ShelterAnimalsPage />);
    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });

  it('calls fetchAnimals on mount', () => {
    const state = setupMock();
    render(<ShelterAnimalsPage />);
    expect(state.fetchAnimals).toHaveBeenCalledWith({ shelter: -1 });
  });
});
