import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import AdminModeracionPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { mockAnimals, mockShelter } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = { user: { role: 'admin', is_staff: true } };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
};

describe('AdminModeracionPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    setupMock();
    const { container } = render(<AdminModeracionPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders access denied for non-admin', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    setupMock({ user: { role: 'adopter', is_staff: false } });
    render(<AdminModeracionPage />);
    expect(screen.getByText('Acceso denegado.')).toBeInTheDocument();
  });

  it('renders page heading', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    setupMock();
    render(<AdminModeracionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Moderación');
  });

  it('renders animals and shelters sections when loaded', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: mockAnimals })
      .mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<AdminModeracionPage />);

    await waitFor(() => {
      expect(screen.getByText('Animales publicados recientes')).toBeInTheDocument();
      expect(screen.getByText('Refugios registrados')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
    });
  });

  it('renders empty animals message', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [mockShelter] });
    setupMock();
    render(<AdminModeracionPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay animales publicados.')).toBeInTheDocument();
    });
  });

  it('renders empty shelters message', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: mockAnimals })
      .mockResolvedValueOnce({ data: [] });
    setupMock();
    render(<AdminModeracionPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay refugios registrados.')).toBeInTheDocument();
    });
  });

  it('renders species labels for animals', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [mockAnimals[0], mockAnimals[1]] })
      .mockResolvedValueOnce({ data: [] });
    setupMock();
    render(<AdminModeracionPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Perro/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Gato/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders shelter verification status badges', async () => {
    const pendingShelter = { ...mockShelter, id: 2, verification_status: 'pending' };
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [mockShelter, pendingShelter] });
    setupMock();
    render(<AdminModeracionPage />);

    await waitFor(() => {
      expect(screen.getByText('Verificado')).toBeInTheDocument();
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });
  });
});
