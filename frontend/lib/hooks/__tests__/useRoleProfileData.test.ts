import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import { useRoleProfileData } from '../useRoleProfileData';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApiGet = api.get as jest.Mock;

function mockRole(role: string | null) {
  mockUseAuthStore.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ user: role ? { role } : null }),
  );
}

describe('useRoleProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not call api.get when the user is an adopter', () => {
    mockRole('adopter');
    renderHook(() => useRoleProfileData());
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('does not call api.get when the user is not loaded', () => {
    mockRole(null);
    renderHook(() => useRoleProfileData());
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('loads shelter payload for shelter_admin', async () => {
    mockRole('shelter_admin');
    mockApiGet.mockResolvedValue({
      data: {
        shelter: { name: 'Refugio Uno', verification_status: 'verified' },
        shelter_stats: { animals_count: 3, pending_applications: 2, active_campaigns: 1 },
      },
    });

    const { result } = renderHook(() => useRoleProfileData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.shelter).toEqual({ name: 'Refugio Uno', verification_status: 'verified' });
    expect(result.current.shelterStats).toEqual({
      animals_count: 3,
      pending_applications: 2,
      active_campaigns: 1,
    });
    expect(result.current.adminStats).toBeNull();
  });

  it('loads admin stats for admin', async () => {
    mockRole('admin');
    mockApiGet.mockResolvedValue({
      data: {
        admin_stats: {
          total_users: 10,
          total_shelters: 5,
          total_animals: 20,
          pending_verifications: 1,
        },
      },
    });

    const { result } = renderHook(() => useRoleProfileData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.adminStats).toEqual({
      total_users: 10,
      total_shelters: 5,
      total_animals: 20,
      pending_verifications: 1,
    });
    expect(result.current.shelter).toBeNull();
  });

  it('silently resets on request failure', async () => {
    mockRole('admin');
    mockApiGet.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useRoleProfileData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.shelter).toBeNull();
    expect(result.current.shelterStats).toBeNull();
    expect(result.current.adminStats).toBeNull();
  });
});
