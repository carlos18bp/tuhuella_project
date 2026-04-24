import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AdminLoginPage from '../page';

const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock('@/lib/services/tokens', () => ({
  setTokens: jest.fn(),
}));

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: Object.assign(jest.fn(() => null), {
    getState: () => ({ syncFromCookies: jest.fn() }),
  }),
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to sign-in when access token is missing', () => {
    mockGet.mockReturnValue(null);
    render(<AdminLoginPage />);
    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('renders signing in text', () => {
    mockGet.mockReturnValue(null);
    render(<AdminLoginPage />);
    expect(screen.getByText(/Iniciando sesión/i)).toBeInTheDocument();
  });

  it('sets tokens and redirects when access and refresh are provided', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'access') return 'test-access';
      if (key === 'refresh') return 'test-refresh';
      if (key === 'redirect') return '/dashboard';
      return null;
    });
    render(<AdminLoginPage />);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to / when redirect param is not provided', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'access') return 'test-access';
      if (key === 'refresh') return 'test-refresh';
      return null;
    });
    render(<AdminLoginPage />);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
