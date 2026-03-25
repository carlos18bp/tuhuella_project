import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import CampaignDetailPage from '../page';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { mockCampaign } from '@/lib/__tests__/fixtures';

jest.mock('next/navigation', () => ({
  useParams: () => ({ campaignId: '1' }),
}));

jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
}));

const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const setupMocks = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    campaign: null,
    loading: true,
    fetchCampaign: jest.fn(),
    isAuthenticated: false,
  };
  const state = { ...defaults, ...overrides };
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('CampaignDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    setupMocks({ loading: true, campaign: null });
    const { container } = render(<CampaignDetailPage />);
    expect(container.querySelector('.animate-shimmer')).toBeInTheDocument();
  });

  it('renders loading skeleton when campaign is null', () => {
    setupMocks({ loading: false, campaign: null });
    const { container } = render(<CampaignDetailPage />);
    expect(container.querySelector('.animate-shimmer')).toBeInTheDocument();
  });

  it('renders campaign title when loaded', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fondo Médico de Emergencia');
  });

  it('renders back link to campaigns list', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByText(/Volver a campañas/)).toBeInTheDocument();
  });

  it('renders shelter name', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('renders progress bar and percentage', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByText('25% completado')).toBeInTheDocument();
  });

  it('renders goal and raised amounts', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByText(/125,000/)).toBeInTheDocument();
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    setupMocks({ loading: false, campaign: mockCampaign });
    render(<CampaignDetailPage />);
    expect(screen.getByText(/Ayúdanos a cubrir/)).toBeInTheDocument();
  });

  it('hides description when not provided', () => {
    const noDesc = { ...mockCampaign, description: undefined };
    setupMocks({ loading: false, campaign: noDesc });
    render(<CampaignDetailPage />);
    expect(screen.queryByText(/Ayúdanos/)).not.toBeInTheDocument();
  });

  it('shows donate link when authenticated', () => {
    setupMocks({ loading: false, campaign: mockCampaign, isAuthenticated: true });
    render(<CampaignDetailPage />);
    expect(screen.getByText('Donar a esta campaña')).toBeInTheDocument();
  });

  it('shows sign-in CTA when not authenticated', () => {
    setupMocks({ loading: false, campaign: mockCampaign, isAuthenticated: false });
    render(<CampaignDetailPage />);
    expect(screen.getByText('Inicia sesión para donar')).toBeInTheDocument();
  });

  it('calls fetchCampaign on mount', () => {
    const state = setupMocks();
    render(<CampaignDetailPage />);
    expect(state.fetchCampaign).toHaveBeenCalledWith(1, 'es');
  });

  it('caps progress bar width at 100%', () => {
    const overCampaign = { ...mockCampaign, progress_percentage: 150 };
    setupMocks({ loading: false, campaign: overCampaign });
    const { container } = render(<CampaignDetailPage />);
    const bar = container.querySelector('[style*="width"]');
    expect(bar?.getAttribute('style')).toContain('100%');
  });
});
