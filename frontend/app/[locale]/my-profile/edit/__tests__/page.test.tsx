import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

jest.mock('@/components/ui/ShelterAdminProfileSection', () => ({
  __esModule: true,
  default: () => <div data-testid="shelter-admin-section" />,
}));

jest.mock('@/components/ui/AdminProfileSection', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-section" />,
}));

import EditProfilePage from '../page';

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApiGet = api.get as jest.Mock;

const baseUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Carlos',
  last_name: 'Pérez',
  phone: '3001234567',
  city: 'Bogotá',
  role: 'adopter',
  date_joined: '2025-06-01T10:00:00Z',
};

const mockUpdateProfile = jest.fn();
const mockFetchProfileStats = jest.fn();

function setupMocks(overrides: Record<string, unknown> = {}) {
  const state = {
    user: baseUser,
    profileStats: null,
    updateProfile: mockUpdateProfile,
    fetchProfileStats: mockFetchProfileStats,
    ...overrides,
  };
  mockUseAuthStore.mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  mockApiGet.mockResolvedValue({ data: {} });
}

describe('EditProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading skeleton when user is null', () => {
    setupMocks({ user: null });
    render(<EditProfilePage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders page title when user loads', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByText('Editar perfil')).toBeInTheDocument();
  });

  it('renders subtitle for adopter role', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByText('Actualiza tu información personal y preferencias de adopción')).toBeInTheDocument();
  });

  it('renders subtitle for non-adopter role', () => {
    setupMocks({ user: { ...baseUser, role: 'shelter_admin' } });
    render(<EditProfilePage />);
    expect(screen.getByText('Actualiza tu información personal')).toBeInTheDocument();
  });

  it('populates form fields from user data', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Carlos');
    expect(screen.getByLabelText(/Apellido/)).toHaveValue('Pérez');
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('3001234567');
    expect(screen.getByLabelText(/Ciudad/)).toHaveValue('Bogotá');
  });

  it('shows avatar with initials when user has name', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByText('CP')).toBeInTheDocument();
  });

  it('shows error when submitting whitespace-only first name', async () => {
    setupMocks({ user: { ...baseUser, first_name: '  ', last_name: '  ' } });
    render(<EditProfilePage />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const saveBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(saveBtn);

    expect(screen.getByText('Nombre y apellido son obligatorios')).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('calls updateProfile on valid form submission', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    setupMocks();
    render(<EditProfilePage />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(mockUpdateProfile).toHaveBeenCalledWith({
      first_name: 'Carlos',
      last_name: 'Pérez',
      phone: '3001234567',
      city: 'Bogotá',
    });
  });

  it('shows success message after successful save', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    setupMocks();
    render(<EditProfilePage />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados correctamente')).toBeInTheDocument();
    });
  });

  it('clears success message after 4 seconds', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    setupMocks();
    render(<EditProfilePage />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados correctamente')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(4100);

    await waitFor(() => {
      expect(screen.queryByText('Cambios guardados correctamente')).not.toBeInTheDocument();
    });
  });

  it('shows error message when updateProfile fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('fail'));
    setupMocks();
    render(<EditProfilePage />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Error al guardar. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('renders completeness bar at correct percentage', () => {
    setupMocks();
    render(<EditProfilePage />);
    // User has name+email+phone+city = 15+15+20+20 = 70%
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders completeness checklist items', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByText('Intención de adopción')).toBeInTheDocument();
    // "Email", "Teléfono", "Ciudad" appear in both form labels and checklist
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Teléfono').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Ciudad').length).toBeGreaterThanOrEqual(2);
  });

  it('renders intent CTA for adopter without intent', () => {
    setupMocks({ profileStats: {} });
    render(<EditProfilePage />);
    expect(screen.getByText('Comparte lo que buscas')).toBeInTheDocument();
    expect(screen.getByText('Crear intención')).toBeInTheDocument();
  });

  it('renders intent section for adopter with existing intent', () => {
    setupMocks({
      profileStats: {
        adopter_intent: { status: 'active', visibility: 'public' },
      },
    });
    render(<EditProfilePage />);
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByText('Editar intención')).toBeInTheDocument();
  });

  it('renders intent status badge with paused status', () => {
    setupMocks({
      profileStats: {
        adopter_intent: { status: 'paused', visibility: 'private' },
      },
    });
    render(<EditProfilePage />);
    expect(screen.getByText('paused')).toBeInTheDocument();
    expect(screen.getByText('Privado')).toBeInTheDocument();
  });

  it('renders ShelterAdminProfileSection for shelter_admin role', () => {
    setupMocks({ user: { ...baseUser, role: 'shelter_admin' } });
    mockApiGet.mockResolvedValue({ data: { shelter: { name: 'Test' } } });
    render(<EditProfilePage />);
    expect(screen.getByTestId('shelter-admin-section')).toBeInTheDocument();
  });

  it('renders AdminProfileSection for admin role', () => {
    setupMocks({ user: { ...baseUser, role: 'admin' } });
    mockApiGet.mockResolvedValue({ data: { admin_stats: {} } });
    render(<EditProfilePage />);
    expect(screen.getByTestId('admin-section')).toBeInTheDocument();
  });

  it('hides intent section for non-adopter role', () => {
    setupMocks({ user: { ...baseUser, role: 'shelter_admin' } });
    render(<EditProfilePage />);
    expect(screen.queryByText('Mi intención de adopción')).not.toBeInTheDocument();
  });

  it('renders account info section with email and role', () => {
    setupMocks();
    render(<EditProfilePage />);
    expect(screen.getByText('Información de cuenta')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
