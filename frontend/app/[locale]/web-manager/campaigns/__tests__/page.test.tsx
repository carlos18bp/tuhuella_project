import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WebManagerCampaignsPage from '../page';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('@/lib/stores/webManagerStore', () => ({ useWebManagerStore: jest.fn() }));

const mockUseWebManagerStore = useWebManagerStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    campaigns: [],
    campaignsMeta: null,
    campaignsLoading: false,
    fetchCampaigns: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  return state;
};

const mockCampaigns = [
  {
    id: 1,
    title: 'Fondo Veterinario',
    shelter_name: 'Patitas Felices',
    goal_amount: '500000',
    approval_status: 'pending',
    submitted_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Campaña de alimentos',
    shelter_name: 'Hogar Animal',
    goal_amount: '300000',
    approval_status: 'approved',
    submitted_at: null,
  },
];

describe('WebManagerCampaignsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<WebManagerCampaignsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Campañas');
  });

  it('renders subtitle text', () => {
    setupMock();
    render(<WebManagerCampaignsPage />);
    expect(
      screen.getByText(/Revisa solicitudes de refugios y gestiona/),
    ).toBeInTheDocument();
  });

  it('renders new campaign link', () => {
    setupMock();
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText('Nueva campaña')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    setupMock({ campaignsLoading: true });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...');
  });

  it('renders empty state when no campaigns', () => {
    setupMock({ campaigns: [] });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText('No hay campañas en este estado.')).toBeInTheDocument();
  });

  it('renders campaign list when data is loaded', () => {
    setupMock({ campaigns: mockCampaigns });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText('Fondo Veterinario')).toBeInTheDocument();
    expect(screen.getByText('Campaña de alimentos')).toBeInTheDocument();
  });

  it('renders campaign shelter name and goal', () => {
    setupMock({ campaigns: mockCampaigns });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText(/Patitas Felices/)).toBeInTheDocument();
    expect(screen.getByText(/Hogar Animal/)).toBeInTheDocument();
  });

  it('renders submitted date when available', () => {
    setupMock({ campaigns: mockCampaigns });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText(/Enviada:/)).toBeInTheDocument();
  });

  it('renders results count when meta is available', () => {
    setupMock({ campaigns: mockCampaigns, campaignsMeta: { count: 2, page: 1, total_pages: 1 } });
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('renders tab filter buttons', () => {
    setupMock();
    render(<WebManagerCampaignsPage />);
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Aprobadas')).toBeInTheDocument();
    expect(screen.getByText('Rechazadas')).toBeInTheDocument();
    expect(screen.getByText('Todas')).toBeInTheDocument();
  });

  it('calls fetchCampaigns on mount', () => {
    const state = setupMock();
    render(<WebManagerCampaignsPage />);
    expect(state.fetchCampaigns).toHaveBeenCalled();
  });

  it('renders campaign links', () => {
    setupMock({ campaigns: mockCampaigns });
    render(<WebManagerCampaignsPage />);
    const links = screen.getAllByRole('link');
    // 2 campaign links + 1 new campaign link
    expect(links.length).toBe(3);
  });
});
