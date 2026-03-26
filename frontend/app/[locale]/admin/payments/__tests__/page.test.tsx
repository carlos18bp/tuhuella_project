import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import AdminPagosPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const mockPayments = [
  {
    id: 1,
    provider: 'wompi',
    provider_reference: 'REF-123',
    amount: '50000',
    status: 'approved',
    donation: 1,
    sponsorship: null,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 2,
    provider: 'wompi',
    provider_reference: null,
    amount: '30000',
    status: 'pending',
    donation: null,
    sponsorship: 1,
    created_at: '2026-01-21T10:00:00Z',
  },
  {
    id: 3,
    provider: 'wompi',
    provider_reference: null,
    amount: '10000',
    status: 'custom_status',
    donation: null,
    sponsorship: null,
    created_at: '2026-01-22T10:00:00Z',
  },
];

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = { user: { role: 'admin', is_staff: true } };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
};

describe('AdminPagosPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminPagosPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders access denied for non-admin', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock({ user: { role: 'adopter', is_staff: false } });
    render(<AdminPagosPage />);
    expect(screen.getByText('Acceso denegado.')).toBeInTheDocument();
  });

  it('renders page heading', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminPagosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Auditoría de Pagos');
  });

  it('renders empty message when no payments', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay transacciones registradas.')).toBeInTheDocument();
    });
  });

  it('renders payment table when payments loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPayments });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getByText('Aprobado')).toBeInTheDocument();
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('REF-123')).toBeInTheDocument();
    });
  });

  it('renders donation type for donation payment', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPayments[0]] });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getByText('Donación')).toBeInTheDocument();
    });
  });

  it('renders sponsorship type for sponsorship payment', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPayments[1]] });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getByText('Apadrinamiento')).toBeInTheDocument();
    });
  });

  it('renders dash for payment without donation or sponsorship', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPayments[2]] });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders fallback status label for unknown status', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPayments[2]] });
    setupMock();
    render(<AdminPagosPage />);
    await waitFor(() => {
      expect(screen.getByText('custom_status')).toBeInTheDocument();
    });
  });
});
