import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterCampaignsPage from '../page';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { mockCampaigns } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));

const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    campaigns: [],
    loading: false,
    fetchCampaigns: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterCampaignsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<ShelterCampaignsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis Campañas');
  });

  it('renders new campaign link', () => {
    setupMock();
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('+ Nueva campaña')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    const { container } = render(<ShelterCampaignsPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty message when no campaigns exist', () => {
    setupMock({ campaigns: [] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('No tienes campañas creadas.')).toBeInTheDocument();
  });

  it('renders campaign cards when campaigns are loaded', () => {
    setupMock({ campaigns: mockCampaigns });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('Fondo Médico de Emergencia')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Refugio')).toBeInTheDocument();
  });

  it('renders campaign goal and raised amounts', () => {
    setupMock({ campaigns: [mockCampaigns[0]] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
    expect(screen.getByText(/125,000/)).toBeInTheDocument();
  });

  it('renders progress percentage', () => {
    setupMock({ campaigns: [mockCampaigns[0]] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('25% completado')).toBeInTheDocument();
  });

  it('renders status label for active campaign', () => {
    setupMock({ campaigns: [mockCampaigns[0]] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('renders status label for draft campaign', () => {
    setupMock({ campaigns: [mockCampaigns[1]] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('renders fallback status for unknown status', () => {
    const custom = { ...mockCampaigns[0], status: 'custom_status' };
    setupMock({ campaigns: [custom] });
    render(<ShelterCampaignsPage />);
    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });

  it('calls fetchCampaigns on mount', () => {
    const state = setupMock();
    render(<ShelterCampaignsPage />);
    expect(state.fetchCampaigns).toHaveBeenCalled();
  });
});
