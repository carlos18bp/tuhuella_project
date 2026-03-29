import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import AdminMetricasPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const mockMetrics = {
  donations: { total_amount: '500000', total_count: 30 },
  sponsorships: { total_amount: '200000', total_count: 15 },
  adoption_rate: { total_published: 100, total_adopted: 40 },
};

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = { user: { role: 'admin', is_staff: true } };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
};

describe('AdminMetricasPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminMetricasPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders access denied for non-admin', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock({ user: { role: 'adopter', is_staff: false } });
    render(<AdminMetricasPage />);
    expect(screen.getByText('Acceso denegado.')).toBeInTheDocument();
  });

  it('renders page heading', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminMetricasPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Métricas');
  });

  it('renders donation metrics when loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockMetrics });
    setupMock();
    render(<AdminMetricasPage />);
    await waitFor(() => {
      expect(screen.getByText(/Total donaciones recaudadas/)).toBeInTheDocument();
      expect(screen.getByText(/30 donaciones pagadas/)).toBeInTheDocument();
    });
  });

  it('renders sponsorship metrics', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockMetrics });
    setupMock();
    render(<AdminMetricasPage />);
    await waitFor(() => {
      expect(screen.getByText(/Total apadrinamientos activos/)).toBeInTheDocument();
      expect(screen.getByText(/15 apadrinamientos/)).toBeInTheDocument();
    });
  });

  it('renders adoption rate percentage', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockMetrics });
    setupMock();
    render(<AdminMetricasPage />);
    await waitFor(() => {
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('Tasa de adopción')).toBeInTheDocument();
    });
  });

  it('renders 0% adoption rate when no published animals', async () => {
    const zeroMetrics = { ...mockMetrics, adoption_rate: { total_published: 0, total_adopted: 0 } };
    mockApi.get.mockResolvedValueOnce({ data: zeroMetrics });
    setupMock();
    render(<AdminMetricasPage />);
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('renders error message when metrics fail', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('err'));
    setupMock();
    render(<AdminMetricasPage />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar/)).toBeInTheDocument();
    });
  });
});
