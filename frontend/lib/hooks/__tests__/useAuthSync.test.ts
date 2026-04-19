import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { useAuthSync } from '../useAuthSync';
import { useAuthStore } from '../../stores/authStore';

jest.mock('../../stores/authStore', () => ({
  useAuthStore: Object.assign(jest.fn(), { getState: jest.fn() }),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock & { getState: jest.Mock };

describe('useAuthSync', () => {
  const syncFromCookies = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.getState.mockReturnValue({ syncFromCookies });
  });

  it('calls syncFromCookies when isAuthReady is false', () => {
    mockUseAuthStore.mockImplementation((selector: (s: { isAuthReady: boolean }) => unknown) =>
      selector({ isAuthReady: false }),
    );

    renderHook(() => useAuthSync());

    expect(syncFromCookies).toHaveBeenCalledTimes(1);
  });

  it('does not call syncFromCookies when isAuthReady is already true', () => {
    mockUseAuthStore.mockImplementation((selector: (s: { isAuthReady: boolean }) => unknown) =>
      selector({ isAuthReady: true }),
    );

    renderHook(() => useAuthSync());

    expect(syncFromCookies).not.toHaveBeenCalled();
  });

  it('returns the current isAuthReady value', () => {
    mockUseAuthStore.mockImplementation((selector: (s: { isAuthReady: boolean }) => unknown) =>
      selector({ isAuthReady: true }),
    );

    const { result } = renderHook(() => useAuthSync());

    expect(result.current).toBe(true);
  });
});
