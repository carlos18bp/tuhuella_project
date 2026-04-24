import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterCampaignDetailPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/components/campaigns/CampaignMessageThread', () => ({
  __esModule: true,
  default: () => <div data-testid="message-thread" />,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;

const mockCampaign = {
  id: 1,
  title: 'Fondo Veterinario',
  description: 'Ayuda con los gastos médicos',
  goal_amount: '500000',
  approval_status: 'pending',
};

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    campaign: mockCampaign,
    loading: false,
    fetchCampaign: jest.fn(),
    submitForApproval: jest.fn(),
    updateCampaign: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  mockUseAuthStore.mockImplementation((sel: any) => sel({ user: { id: 10 } }));
  return state;
};

describe('ShelterCampaignDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    setupMock({ loading: true, campaign: null });
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders not found when campaign is null', () => {
    setupMock({ campaign: null });
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText('Campaña no encontrada.')).toBeInTheDocument();
  });

  it('renders campaign title', () => {
    setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fondo Veterinario');
  });

  it('renders campaign goal amount', () => {
    setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
  });

  it('renders description in view mode', () => {
    setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText('Ayuda con los gastos médicos')).toBeInTheDocument();
  });

  it('shows edit button for pending campaign', () => {
    setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('shows rejection notice for rejected campaign', () => {
    setupMock({ campaign: { ...mockCampaign, approval_status: 'rejected' } });
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByText(/fue rechazada/)).toBeInTheDocument();
    expect(screen.getByText('Reenviar a revisión')).toBeInTheDocument();
  });

  it('hides edit button for approved campaign', () => {
    setupMock({ campaign: { ...mockCampaign, approval_status: 'approved' } });
    render(<ShelterCampaignDetailPage />);
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });

  it('renders message thread', () => {
    setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(screen.getByTestId('message-thread')).toBeInTheDocument();
  });

  it('calls fetchCampaign on mount', () => {
    const state = setupMock();
    render(<ShelterCampaignDetailPage />);
    expect(state.fetchCampaign).toHaveBeenCalledWith(1);
  });
});
