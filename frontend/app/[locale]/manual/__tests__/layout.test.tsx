import { render, screen } from '@testing-library/react';

import ManualLayout from '../layout';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/lib/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(),
}));

type TestUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  role: 'adopter' | 'shelter_admin' | 'veterinarian' | 'web_manager' | 'admin';
  is_staff: boolean;
  date_joined: string;
};

const resetAuth = () => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isAuthReady: true,
  });
};

const setUser = (user: TestUser) => {
  useAuthStore.setState({
    user: user as unknown as ReturnType<typeof useAuthStore.getState>['user'],
    isAuthenticated: true,
    isAuthReady: true,
  });
};

const baseUser = {
  id: 1,
  email: 'u@test.com',
  first_name: 'U',
  last_name: 'T',
  phone: '',
  city: '',
  is_staff: false,
  date_joined: '2026-01-01',
};

describe('ManualLayout', () => {
  beforeEach(resetAuth);
  afterAll(resetAuth);

  it('denies access for adopter role', () => {
    setUser({ ...baseUser, role: 'adopter' });
    render(
      <ManualLayout>
        <p>visible content</p>
      </ManualLayout>,
    );
    expect(screen.getByText(/Acceso denegado/i)).toBeInTheDocument();
    expect(screen.queryByText('visible content')).not.toBeInTheDocument();
  });

  it('renders children for web_manager role', () => {
    setUser({ ...baseUser, role: 'web_manager' });
    render(
      <ManualLayout>
        <p>visible content</p>
      </ManualLayout>,
    );
    expect(screen.getByText('visible content')).toBeInTheDocument();
  });

  it('renders children for admin role', () => {
    setUser({ ...baseUser, role: 'admin' });
    render(
      <ManualLayout>
        <p>visible content</p>
      </ManualLayout>,
    );
    expect(screen.getByText('visible content')).toBeInTheDocument();
  });

  it('renders children for staff flag even without web_manager/admin role', () => {
    setUser({ ...baseUser, role: 'adopter', is_staff: true });
    render(
      <ManualLayout>
        <p>visible content</p>
      </ManualLayout>,
    );
    expect(screen.getByText('visible content')).toBeInTheDocument();
  });
});
