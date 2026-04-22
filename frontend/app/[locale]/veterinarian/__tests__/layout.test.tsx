import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import VeterinarianLayout from '../layout';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/components/ui/AdminAccessDenied', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="access-denied">{children}</div>,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('VeterinarianLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for veterinarian role', () => {
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: { role: 'veterinarian', is_staff: false } }));
    render(<VeterinarianLayout><p>Content</p></VeterinarianLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children for admin role', () => {
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: { role: 'admin', is_staff: false } }));
    render(<VeterinarianLayout><p>Content</p></VeterinarianLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children for is_staff user', () => {
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: { role: 'adopter', is_staff: true } }));
    render(<VeterinarianLayout><p>Content</p></VeterinarianLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders access denied for adopter without staff', () => {
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: { role: 'adopter', is_staff: false } }));
    render(<VeterinarianLayout><p>Content</p></VeterinarianLayout>);
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
  });

  it('renders children when user is null', () => {
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: null }));
    render(<VeterinarianLayout><p>Content</p></VeterinarianLayout>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
