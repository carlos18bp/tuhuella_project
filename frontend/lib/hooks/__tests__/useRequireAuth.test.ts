import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import { useRequireAuth } from '../useRequireAuth';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from '@/i18n/navigation';

jest.mock('@/i18n/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseRouter = useRouter as unknown as jest.Mock;

describe('useRequireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('syncs cookies and redirects when unauthenticated and auth is ready', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });

    const syncFromCookies = jest.fn();
    const state = { isAuthenticated: false, isAuthReady: true, syncFromCookies };
    mockUseAuthStore.mockImplementation((selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state
    );

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(syncFromCookies).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('does not redirect before auth is ready', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });

    const syncFromCookies = jest.fn();
    const state = { isAuthenticated: false, isAuthReady: false, syncFromCookies };
    mockUseAuthStore.mockImplementation((selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state
    );

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(syncFromCookies).toHaveBeenCalledTimes(1);
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not redirect when authenticated', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });

    const syncFromCookies = jest.fn();
    const state = { isAuthenticated: true, isAuthReady: true, syncFromCookies };
    mockUseAuthStore.mockImplementation((selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state
    );

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(syncFromCookies).toHaveBeenCalledTimes(1);
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
