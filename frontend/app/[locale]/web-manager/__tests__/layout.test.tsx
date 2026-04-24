import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WebManagerLayout from '../layout';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/components/ui/AdminAccessDenied', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="access-denied">{children}</div>
  ),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const setupMock = (user: Record<string, unknown> | null) => {
  mockUseAuthStore.mockImplementation((sel: any) => sel({ user }));
};

describe('WebManagerLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for web_manager role', () => {
    setupMock({ role: 'web_manager', is_staff: false });
    render(
      <WebManagerLayout>
        <p>child content</p>
      </WebManagerLayout>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders children for admin role', () => {
    setupMock({ role: 'admin', is_staff: false });
    render(
      <WebManagerLayout>
        <p>admin content</p>
      </WebManagerLayout>,
    );
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('renders children for staff users', () => {
    setupMock({ role: 'shelter_admin', is_staff: true });
    render(
      <WebManagerLayout>
        <p>staff content</p>
      </WebManagerLayout>,
    );
    expect(screen.getByText('staff content')).toBeInTheDocument();
  });

  it('renders access denied for non-authorized user', () => {
    setupMock({ role: 'adopter', is_staff: false });
    render(
      <WebManagerLayout>
        <p>hidden content</p>
      </WebManagerLayout>,
    );
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  it('renders access denied message from translations', () => {
    setupMock({ role: 'adopter', is_staff: false });
    render(
      <WebManagerLayout>
        <p>hidden</p>
      </WebManagerLayout>,
    );
    expect(
      screen.getByText(
        'Acceso denegado. Solo web managers y administradores pueden acceder a este panel.',
      ),
    ).toBeInTheDocument();
  });

  it('renders children when user is null (auth guard handles redirect)', () => {
    setupMock(null);
    render(
      <WebManagerLayout>
        <p>loading content</p>
      </WebManagerLayout>,
    );
    expect(screen.getByText('loading content')).toBeInTheDocument();
  });
});
