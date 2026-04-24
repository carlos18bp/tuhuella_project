import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WebManagerCampaignDetailPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '5' }),
}));

jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/lib/stores/webManagerStore', () => ({ useWebManagerStore: jest.fn() }));

jest.mock('@/components/campaigns/CampaignMessageThread', () => ({
  __esModule: true,
  default: ({ campaignId, currentUserId }: any) => (
    <div data-testid="campaign-message-thread">
      campaign={campaignId} user={currentUserId}
    </div>
  ),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;
const mockUseWebManagerStore = useWebManagerStore as unknown as jest.Mock;

const mockCampaign = {
  id: 5,
  title: 'Fondo Veterinario',
  shelter_name: 'Patitas Felices',
  goal_amount: '500000',
  approval_status: 'pending',
  description: 'Ayuda a los animales.',
  reviewed_by_name: null,
  reviewed_at: null,
};

const setupMocks = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    user: { id: 1, role: 'web_manager' },
    campaign: mockCampaign,
    loading: false,
    fetchCampaign: jest.fn(),
    approveCampaign: jest.fn().mockResolvedValue({ ...mockCampaign, approval_status: 'approved' }),
    rejectCampaign: jest.fn().mockResolvedValue({ ...mockCampaign, approval_status: 'rejected' }),
  };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('WebManagerCampaignDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when loading and no campaign', () => {
    setupMocks({ loading: true, campaign: null });
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders not found when campaign is null and not loading', () => {
    setupMocks({ loading: false, campaign: null });
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText('Campaña no encontrada.')).toBeInTheDocument();
  });

  it('renders campaign title in heading', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fondo Veterinario');
  });

  it('renders shelter name and goal amount', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText(/Patitas Felices/)).toBeInTheDocument();
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
  });

  it('renders campaign description', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText('Ayuda a los animales.')).toBeInTheDocument();
  });

  it('hides description section when description is empty', () => {
    setupMocks({ campaign: { ...mockCampaign, description: null } });
    render(<WebManagerCampaignDetailPage />);
    expect(screen.queryByText('Descripcion')).not.toBeInTheDocument();
  });

  it('renders approval status badge for pending campaign', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders approve and reject buttons for pending campaign', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText('Aprobar')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  it('hides approve/reject buttons for approved campaign', () => {
    setupMocks({ campaign: { ...mockCampaign, approval_status: 'approved' } });
    render(<WebManagerCampaignDetailPage />);
    expect(screen.queryByText('Aprobar')).not.toBeInTheDocument();
    expect(screen.queryByText('Rechazar')).not.toBeInTheDocument();
  });

  it('shows reject reason form when reject button is clicked', async () => {
    const user = userEvent.setup();
    setupMocks();
    render(<WebManagerCampaignDetailPage />);

    await user.click(screen.getByText('Rechazar'));
    expect(screen.getByText('Motivo del rechazo')).toBeInTheDocument();
    expect(screen.getByText('Confirmar rechazo')).toBeInTheDocument();
  });

  it('renders reviewed-by info when available', () => {
    setupMocks({
      campaign: {
        ...mockCampaign,
        approval_status: 'approved',
        reviewed_by_name: 'Admin User',
        reviewed_at: '2026-01-20T12:00:00Z',
      },
    });
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByText(/Revisada por Admin User/)).toBeInTheDocument();
  });

  it('renders campaign message thread', () => {
    setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(screen.getByTestId('campaign-message-thread')).toBeInTheDocument();
  });

  it('calls fetchCampaign on mount', () => {
    const state = setupMocks();
    render(<WebManagerCampaignDetailPage />);
    expect(state.fetchCampaign).toHaveBeenCalledWith(5);
  });
});
