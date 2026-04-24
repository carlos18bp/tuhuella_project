import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WebManagerSheltersPage from '../page';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('@/lib/stores/webManagerStore', () => ({ useWebManagerStore: jest.fn() }));

const mockUseWebManagerStore = useWebManagerStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    shelters: [],
    sheltersMeta: null,
    sheltersLoading: false,
    fetchShelters: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  return state;
};

const mockShelters = [
  { id: 1, name: 'Patitas Felices', city: 'Bogota', verification_status: 'verified' },
  { id: 2, name: 'Hogar Animal', city: 'Medellin', verification_status: 'pending' },
];

describe('WebManagerSheltersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<WebManagerSheltersPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Refugios');
  });

  it('renders subtitle text', () => {
    setupMock();
    render(<WebManagerSheltersPage />);
    expect(screen.getByText('Refugios registrados en la plataforma.')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    setupMock({ sheltersLoading: true });
    render(<WebManagerSheltersPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...');
  });

  it('renders empty state when no shelters', () => {
    setupMock({ shelters: [] });
    render(<WebManagerSheltersPage />);
    expect(screen.getByText('No hay refugios.')).toBeInTheDocument();
  });

  it('renders shelter list when data is loaded', () => {
    setupMock({ shelters: mockShelters });
    render(<WebManagerSheltersPage />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
    expect(screen.getByText('Hogar Animal')).toBeInTheDocument();
  });

  it('renders shelter city for each entry', () => {
    setupMock({ shelters: mockShelters });
    render(<WebManagerSheltersPage />);
    expect(screen.getByText(/Bogota/)).toBeInTheDocument();
    expect(screen.getByText(/Medellin/)).toBeInTheDocument();
  });

  it('renders results count when meta is available', () => {
    setupMock({ shelters: mockShelters, sheltersMeta: { count: 2, page: 1, total_pages: 1 } });
    render(<WebManagerSheltersPage />);
    expect(screen.getByText('2 resultado(s)')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    setupMock();
    render(<WebManagerSheltersPage />);
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Verificados')).toBeInTheDocument();
    expect(screen.getByText('Rechazados')).toBeInTheDocument();
  });

  it('calls fetchShelters on mount', () => {
    const state = setupMock();
    render(<WebManagerSheltersPage />);
    expect(state.fetchShelters).toHaveBeenCalled();
  });

  it('renders shelter links', () => {
    setupMock({ shelters: mockShelters });
    render(<WebManagerSheltersPage />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
  });
});
