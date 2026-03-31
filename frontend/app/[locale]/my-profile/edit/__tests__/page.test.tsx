import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';
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

function setupMocks(overrides: Record<string, unknown> = {}, apiGetData: Record<string, unknown> = {}) {
  const state = {
    user: baseUser,
    profileStats: null,
    updateProfile: mockUpdateProfile,
    fetchProfileStats: mockFetchProfileStats,
    ...overrides,
  };
  mockUseAuthStore.mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  mockApiGet.mockResolvedValue({ data: apiGetData });
}

/** Drain microtasks and await api.get promises so setRoleData runs inside act. */
async function flushEditProfileEffects() {
  await act(async () => {
    await Promise.resolve();
  });
  const results = mockApiGet.mock.results;
  for (let i = 0; i < results.length; i++) {
    const r = results[i] as { type: string; value?: Promise<unknown> };
    if (r.type === 'return' && r.value != null && typeof r.value.then === 'function') {
      await act(async () => {
        await r.value;
      });
    }
  }
  await act(async () => {
    await Promise.resolve();
  });
}

async function renderEditProfile(
  overrides: Record<string, unknown> = {},
  apiGetData: Record<string, unknown> = {},
) {
  setupMocks(overrides, apiGetData);
  const view = render(<EditProfilePage />);
  await flushEditProfileEffects();
  return view;
}

describe('EditProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading skeleton when user is null', async () => {
    setupMocks({ user: null });
    render(<EditProfilePage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    await flushEditProfileEffects();
  });

  it('renders page title when user loads', async () => {
    await renderEditProfile();
    expect(screen.getByText('Editar perfil')).toBeInTheDocument();
  });

  it('renders subtitle for adopter role', async () => {
    await renderEditProfile();
    expect(screen.getByText('Actualiza tu información personal y preferencias de adopción')).toBeInTheDocument();
  });

  it('renders subtitle for non-adopter role', async () => {
    await renderEditProfile({ user: { ...baseUser, role: 'shelter_admin' } });
    expect(screen.getByText('Actualiza tu información personal')).toBeInTheDocument();
  });

  it('populates form fields from user data', async () => {
    await renderEditProfile();
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Carlos');
    expect(screen.getByLabelText(/Apellido/)).toHaveValue('Pérez');
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('3001234567');
    expect(screen.getByLabelText(/Ciudad/)).toHaveValue('Bogotá');
  });

  it('shows avatar with initials when user has name', async () => {
    await renderEditProfile();
    expect(screen.getByText('CP')).toBeInTheDocument();
  });

  it('shows error when submitting whitespace-only first name', async () => {
    await renderEditProfile({ user: { ...baseUser, first_name: '  ', last_name: '  ' } });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const saveBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(saveBtn);

    expect(screen.getByText('Nombre y apellido son obligatorios')).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('calls updateProfile on valid form submission', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    await renderEditProfile();

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
    await renderEditProfile();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados correctamente')).toBeInTheDocument();
    });
  });

  it('clears success message after 4 seconds', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    await renderEditProfile();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados correctamente')).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(4100);
    });

    await waitFor(() => {
      expect(screen.queryByText('Cambios guardados correctamente')).not.toBeInTheDocument();
    });
  });

  it('shows error message when updateProfile fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('fail'));
    await renderEditProfile();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Error al guardar. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('renders completeness bar at correct percentage', async () => {
    await renderEditProfile();
    // User has name+email+phone+city = 15+15+20+20 = 70%
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders completeness checklist items', async () => {
    await renderEditProfile();
    expect(screen.getByText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByText('Intención de adopción')).toBeInTheDocument();
    // "Email", "Teléfono", "Ciudad" appear in both form labels and checklist
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Teléfono').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Ciudad').length).toBeGreaterThanOrEqual(2);
  });

  it('renders intent CTA for adopter without intent', async () => {
    await renderEditProfile({ profileStats: {} });
    expect(screen.getByText('Comparte lo que buscas')).toBeInTheDocument();
    expect(screen.getByText('Crear intención')).toBeInTheDocument();
  });

  it('renders intent section for adopter with existing intent', async () => {
    await renderEditProfile({
      profileStats: {
        adopter_intent: { status: 'active', visibility: 'public' },
      },
    });
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Público')).toBeInTheDocument();
    expect(screen.getByText('Editar intención')).toBeInTheDocument();
  });

  it('renders intent status badge with paused status', async () => {
    await renderEditProfile({
      profileStats: {
        adopter_intent: { status: 'paused', visibility: 'private' },
      },
    });
    expect(screen.getByText('paused')).toBeInTheDocument();
    expect(screen.getByText('Privado')).toBeInTheDocument();
  });

  it('renders ShelterAdminProfileSection for shelter_admin role', async () => {
    await renderEditProfile({ user: { ...baseUser, role: 'shelter_admin' } }, { shelter: { name: 'Test' } });
    expect(screen.getByTestId('shelter-admin-section')).toBeInTheDocument();
  });

  it('renders AdminProfileSection for admin role', async () => {
    await renderEditProfile({ user: { ...baseUser, role: 'admin' } }, { admin_stats: {} });
    expect(screen.getByTestId('admin-section')).toBeInTheDocument();
  });

  it('hides intent section for non-adopter role', async () => {
    await renderEditProfile({ user: { ...baseUser, role: 'shelter_admin' } });
    expect(screen.queryByText('Mi intención de adopción')).not.toBeInTheDocument();
  });

  it('renders account info section with email and role', async () => {
    await renderEditProfile();
    expect(screen.getByText('Información de cuenta')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
