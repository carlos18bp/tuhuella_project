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

import { useShelterStore } from '@/lib/stores/shelterStore';

import RefugiosPage from '../page';

describe('RefugiosPage', () => {
  beforeEach(() => {
    useShelterStore.setState({
      shelters: [],
      shelter: null,
      loading: false,
      error: null,
      fetchShelters: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<RefugiosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Refugios verificados');
  });

  it('renders empty state when no shelters', () => {
    render(<RefugiosPage />);
    expect(screen.getByText('No hay refugios disponibles.')).toBeInTheDocument();
  });

  it('renders shelter cards when shelters exist', () => {
    useShelterStore.setState({
      shelters: [
        {
          id: 1,
          name: 'Patitas Felices',
          city: 'Bogotá',
          verification_status: 'verified',
          is_verified: true,
          owner_email: 'admin@test.com',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    render(<RefugiosPage />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });
});
