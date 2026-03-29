import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import AdminDashboardPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const mockMetrics = {
  total_users: 150,
  total_shelters: 12,
  verified_shelters: 8,
  pending_shelters: 3,
  total_animals: 200,
  published_animals: 120,
  adopted_animals: 45,
  total_applications: 60,
  active_campaigns: 5,
  total_donations: 30,
  total_sponsorships: 15,
};

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    user: { role: 'admin', is_staff: true },
  };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
};

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminDashboardPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders access denied for non-admin users', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock({ user: { role: 'adopter', is_staff: false } });
    render(<AdminDashboardPage />);
    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument();
  });

  it('renders page heading for admin users', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminDashboardPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Panel de Administración');
  });

  it('renders metrics cards when loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockMetrics });
    setupMock();
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('Animales')).toBeInTheDocument();
    });
  });

  it('renders navigation links', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockMetrics });
    setupMock();
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar Refugios')).toBeInTheDocument();
      expect(screen.getByText('Moderación')).toBeInTheDocument();
      expect(screen.getByText('Auditoría de Pagos')).toBeInTheDocument();
      expect(screen.getByText('Métricas')).toBeInTheDocument();
    });
  });

  it('renders error message when metrics fail to load', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('err'));
    setupMock();
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar/)).toBeInTheDocument();
    });
  });

  it('allows staff users with non-admin role', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock({ user: { role: 'shelter_admin', is_staff: true } });
    render(<AdminDashboardPage />);
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
  });
});
