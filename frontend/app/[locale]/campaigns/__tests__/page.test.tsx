import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('swiper/react', () => ({ Swiper: () => null, SwiperSlide: () => null }));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});
jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
}));

import { useCampaignStore } from '@/lib/stores/campaignStore';

import CampanasPage from '../page';

describe('CampanasPage', () => {
  beforeEach(() => {
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
});
