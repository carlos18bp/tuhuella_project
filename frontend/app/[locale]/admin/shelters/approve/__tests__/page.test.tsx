import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdminApproveSheltarsPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const mockPendingShelters = [
  { id: 1, name: 'Refugio Nuevo', legal_name: 'Refugio S.A.S.', city: 'Bogotá', owner_email: 'owner@test.com', created_at: '2026-01-20T10:00:00Z' },
  { id: 2, name: 'Otro Refugio', legal_name: '', city: 'Medellín', owner_email: 'otro@test.com', created_at: '2026-01-21T10:00:00Z' },
];

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = { user: { role: 'admin', is_staff: true } };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
};

describe('AdminApproveSheltarsPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminApproveSheltarsPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders access denied for non-admin', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock({ user: { role: 'adopter', is_staff: false } });
    render(<AdminApproveSheltarsPage />);
    expect(screen.getByText('Acceso denegado.')).toBeInTheDocument();
  });

  it('renders page heading', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    render(<AdminApproveSheltarsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aprobar Refugios');
  });

  it('renders empty message when no pending shelters', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    setupMock();
    render(<AdminApproveSheltarsPage />);
    await waitFor(() => {
      expect(screen.getByText(/No hay refugios pendientes/)).toBeInTheDocument();
    });
  });

  it('renders pending shelter details', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockPendingShelters });
    setupMock();
    render(<AdminApproveSheltarsPage />);
    await waitFor(() => {
      expect(screen.getByText('Refugio Nuevo')).toBeInTheDocument();
      expect(screen.getByText('Refugio S.A.S.')).toBeInTheDocument();
      expect(screen.getByText(/Bogotá/)).toBeInTheDocument();
      expect(screen.getByText(/owner@test.com/)).toBeInTheDocument();
    });
  });

  it('renders Aprobar and Rechazar buttons for each shelter', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPendingShelters[0]] });
    setupMock();
    render(<AdminApproveSheltarsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument();
    });
  });

  it('removes shelter from list after approval', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPendingShelters[0]] });
    mockApi.post.mockResolvedValueOnce({ data: {} });
    setupMock();
    render(<AdminApproveSheltarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Refugio Nuevo')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => {
      expect(screen.queryByText('Refugio Nuevo')).not.toBeInTheDocument();
    });
  });

  it('removes shelter from list after rejection', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPendingShelters[0]] });
    mockApi.post.mockResolvedValueOnce({ data: {} });
    setupMock();
    render(<AdminApproveSheltarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Refugio Nuevo')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => {
      expect(screen.queryByText('Refugio Nuevo')).not.toBeInTheDocument();
    });
  });

  it('hides legal name when empty', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockPendingShelters[1]] });
    setupMock();
    render(<AdminApproveSheltarsPage />);
    await waitFor(() => {
      expect(screen.getByText('Otro Refugio')).toBeInTheDocument();
      expect(screen.queryByText('Refugio S.A.S.')).not.toBeInTheDocument();
    });
  });
});
