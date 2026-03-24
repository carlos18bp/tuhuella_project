import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import ShelterDashboardPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { mockShelter } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    user: { role: 'shelter_admin' },
  };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    const { container } = render(<ShelterDashboardPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders registration prompt when no shelter found', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar refugio')).toBeInTheDocument();
    });
  });

  it('renders shelter name when loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
    });
  });

  it('renders shelter city', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Bogotá')).toBeInTheDocument();
    });
  });

  it('renders verified badge for verified shelter', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Verificado')).toBeInTheDocument();
    });
  });

  it('renders pending badge for unverified shelter', async () => {
    const pending = { ...mockShelter, verification_status: 'pending', is_verified: false };
    mockApi.get.mockResolvedValueOnce({ data: [pending] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Pendiente de verificación')).toBeInTheDocument();
    });
  });

  it('renders rejected badge for rejected shelter', async () => {
    const rejected = { ...mockShelter, verification_status: 'rejected' };
    mockApi.get.mockResolvedValueOnce({ data: [rejected] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Rechazado')).toBeInTheDocument();
    });
  });

  it('renders navigation links to shelter sections', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Animales')).toBeInTheDocument();
      expect(screen.getByText('Solicitudes')).toBeInTheDocument();
      expect(screen.getByText('Campañas')).toBeInTheDocument();
      expect(screen.getByText('Donaciones')).toBeInTheDocument();
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
  });

  it('hides role warning for shelter_admin users', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock({ user: { role: 'shelter_admin' } });
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Tu rol actual/)).not.toBeInTheDocument();
  });

  it('shows role warning for non-shelter_admin users', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    setupMock({ user: { role: 'adopter' } });
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Tu rol actual/)).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));
    setupMock();
    render(<ShelterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Registrar refugio')).toBeInTheDocument();
    });
  });
});
