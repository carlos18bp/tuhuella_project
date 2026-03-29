import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseFAQsByTopic = jest.fn().mockReturnValue({ items: [], loading: false });

jest.mock('swiper/react', () => ({ Swiper: () => null, SwiperSlide: () => null }));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});
jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: (...args: unknown[]) => mockUseFAQsByTopic(...args),
}));

import { useCampaignStore } from '@/lib/stores/campaignStore';

import CampanasPage from '../page';

describe('CampanasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFAQsByTopic.mockReturnValue({ items: [], loading: false });
    useCampaignStore.setState({
      campaigns: [],
      loading: false,
      error: null,
      fetchCampaigns: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<CampanasPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Campañas activas');
  });

  it('renders empty state when no campaigns', () => {
    render(<CampanasPage />);
    expect(screen.getByText('No hay campañas activas por el momento.')).toBeInTheDocument();
  });

  it('renders campaign cards when campaigns exist', () => {
    useCampaignStore.setState({
      campaigns: [
        {
          id: 1,
          title: 'Test Campaign',
          shelter: 1,
          shelter_name: 'Test Shelter',
          status: 'active',
          goal_amount: '100000.00',
          raised_amount: '25000.00',
          progress_percentage: 25,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    render(<CampanasPage />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('renders loading skeleton placeholders when loading', () => {
    useCampaignStore.setState({ loading: true });
    const { container } = render(<CampanasPage />);
    const shimmerElements = container.querySelectorAll('.animate-shimmer');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });

  it('renders subtitle text', () => {
    render(<CampanasPage />);
    expect(screen.getByText('Tu donación hace la diferencia')).toBeInTheDocument();
  });

  it('renders FAQ section when FAQ items are available', () => {
    mockUseFAQsByTopic.mockReturnValue({
      items: [
        { question: '¿Cómo puedo donar?', answer: 'Puedes donar en línea.' },
      ],
      loading: false,
    });
    render(<CampanasPage />);
    expect(screen.getByText('Preguntas frecuentes sobre campañas')).toBeInTheDocument();
    expect(screen.getByText('¿Cómo puedo donar?')).toBeInTheDocument();
  });

  it('does not render FAQ section when no FAQ items', () => {
    render(<CampanasPage />);
    expect(screen.queryByText('Preguntas frecuentes sobre campañas')).not.toBeInTheDocument();
  });

  it('switches to completed tab and shows completed empty message', async () => {
    const user = userEvent.setup();
    render(<CampanasPage />);

    await user.click(screen.getByText('Completadas'));
    expect(screen.getByText('No hay campañas completadas por el momento.')).toBeInTheDocument();
  });

  it('calls fetchCampaigns on mount', () => {
    const mockFetch = jest.fn();
    useCampaignStore.setState({ fetchCampaigns: mockFetch });
    render(<CampanasPage />);
    expect(mockFetch).toHaveBeenCalledWith('es', 'active');
  });

  it('calls fetchCampaigns with completed status after switching tabs', async () => {
    const user = userEvent.setup();
    const mockFetch = jest.fn();
    useCampaignStore.setState({ fetchCampaigns: mockFetch });
    render(<CampanasPage />);

    await user.click(screen.getByText('Completadas'));
    expect(mockFetch).toHaveBeenCalledWith('es', 'completed');
  });
});
