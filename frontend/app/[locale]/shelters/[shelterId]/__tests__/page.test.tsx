import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterDetailPage from '../page';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { mockShelter } from '@/lib/__tests__/fixtures';

jest.mock('next/navigation', () => ({
  useParams: () => ({ shelterId: '1' }),
}));

jest.mock('@/lib/stores/shelterStore', () => ({ useShelterStore: jest.fn() }));

const mockUseShelterStore = useShelterStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    shelter: null,
    loading: true,
    fetchShelter: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseShelterStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true, shelter: null });
    const { container } = render(<ShelterDetailPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders loading skeleton when shelter is null', () => {
    setupMock({ loading: false, shelter: null });
    const { container } = render(<ShelterDetailPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders shelter name when loaded', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Patitas Felices');
  });

  it('renders back link to shelters list', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText(/Volver a refugios/)).toBeInTheDocument();
  });

  it('renders shelter city', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText(/Refugio dedicado al rescate/)).toBeInTheDocument();
  });

  it('hides description when not provided', () => {
    const noDesc = { ...mockShelter, description: undefined };
    setupMock({ loading: false, shelter: noDesc });
    render(<ShelterDetailPage />);
    expect(screen.queryByText(/Refugio dedicado/)).not.toBeInTheDocument();
  });

  it('renders phone when provided', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText('3001112233')).toBeInTheDocument();
  });

  it('hides phone when not provided', () => {
    const noPhone = { ...mockShelter, phone: undefined };
    setupMock({ loading: false, shelter: noPhone });
    render(<ShelterDetailPage />);
    expect(screen.queryByText('3001112233')).not.toBeInTheDocument();
  });

  it('renders email when provided', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText('info@patitasfelices.org')).toBeInTheDocument();
  });

  it('renders website link when provided', () => {
    const withWeb = { ...mockShelter, website: 'https://patitas.org' };
    setupMock({ loading: false, shelter: withWeb });
    render(<ShelterDetailPage />);
    const link = screen.getByRole('link', { name: 'https://patitas.org' });
    expect(link).toHaveAttribute('href', 'https://patitas.org');
  });

  it('hides website when not provided', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.queryByText('Sitio web')).not.toBeInTheDocument();
  });

  it('renders link to view shelter animals', () => {
    setupMock({ loading: false, shelter: mockShelter });
    render(<ShelterDetailPage />);
    expect(screen.getByText('Ver animales de este refugio')).toBeInTheDocument();
  });

  it('calls fetchShelter on mount', () => {
    const state = setupMock();
    render(<ShelterDetailPage />);
    expect(state.fetchShelter).toHaveBeenCalledWith(1);
  });
});
