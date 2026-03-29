import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from '../Header';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/stores/notificationStore', () => ({
  useNotificationStore: jest.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      unreadCount: 0,
      notifications: [],
      fetchUnreadCount: jest.fn(),
      fetchNotifications: jest.fn(),
      markAllAsRead: jest.fn(),
    }),
  ),
}));

jest.mock('../LocaleSwitcher', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'locale-switcher' }),
}));

jest.mock('../ThemeToggle', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'theme-toggle' }),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    isAuthenticated: false,
    isAuthReady: true,
    user: null,
    signOut: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) => selector(state));
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Tu Huella brand link', () => {
    setupMock();
    render(<Header />);
    const brandLink = screen.getByRole('link', { name: /tu\s*huella/i });
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('renders public navigation links', () => {
    setupMock();
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Animales' })).toHaveAttribute('href', '/animals');
    expect(screen.getByRole('link', { name: 'Refugios' })).toHaveAttribute('href', '/shelters');
    expect(screen.getByRole('link', { name: 'Campañas' })).toHaveAttribute('href', '/campaigns');
    expect(screen.getByRole('link', { name: 'Busco Adoptar' })).toHaveAttribute('href', '/looking-to-adopt');
  });

  it('renders sign-in and sign-up links when unauthenticated', () => {
    setupMock();
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/sign-up');
  });

  it('hides sign-in and sign-up links when authenticated', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Registrarse' })).not.toBeInTheDocument();
  });

  it('renders Favoritos and Mi Perfil links when authenticated', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Favoritos' })).toHaveAttribute('href', '/favorites');
    expect(screen.getByRole('link', { name: 'Mi Perfil' })).toHaveAttribute('href', '/my-profile');
  });

  it('renders shelter panel link for shelter_admin role', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'shelter_admin' },
    });
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Panel Refugio' })).toHaveAttribute('href', '/shelter/dashboard');
  });

  it('hides shelter panel link for non-shelter users', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    expect(screen.queryByRole('link', { name: 'Panel Refugio' })).not.toBeInTheDocument();
  });

  it('renders admin link for admin role', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'admin' },
    });
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/dashboard');
  });

  it('renders sign-out button when authenticated', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('renders locale switcher', () => {
    setupMock();
    render(<Header />);
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    setupMock();
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Toggle menu' })).toBeInTheDocument();
  });

  it('opens mobile menu when toggle button is clicked', async () => {
    setupMock();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });

    await userEvent.click(toggle);

    const mobileLinks = screen.getAllByRole('link', { name: 'Animales' });
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('closes mobile menu when a mobile nav link is clicked', async () => {
    setupMock();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });

    await userEvent.click(toggle);
    const mobileLinks = screen.getAllByRole('link', { name: 'Animales' });
    await userEvent.click(mobileLinks[mobileLinks.length - 1]);

    const remainingLinks = screen.getAllByRole('link', { name: 'Animales' });
    expect(remainingLinks).toHaveLength(1);
  });

  it('calls signOut when sign-out button is clicked', async () => {
    const mockSignOut = jest.fn();
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
      signOut: mockSignOut,
    });
    render(<Header />);
    const signOutBtn = screen.getByRole('button', { name: 'Salir' });

    await userEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows mobile authenticated links when authenticated and menu open', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });

    await userEvent.click(toggle);

    const favLinks = screen.getAllByRole('link', { name: 'Favoritos' });
    expect(favLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('calls signOut and closes mobile menu on mobile sign-out click', async () => {
    const mockSignOut = jest.fn();
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
      signOut: mockSignOut,
    });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    const salirButtons = screen.getAllByRole('button', { name: 'Salir' });
    await userEvent.click(salirButtons[salirButtons.length - 1]);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows sign-in and sign-up in mobile menu when unauthenticated', async () => {
    setupMock();
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    const signInLinks = screen.getAllByRole('link', { name: 'Iniciar sesión' });
    expect(signInLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renders Blog link in navigation', () => {
    setupMock();
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
  });

  it('renders loading skeleton when auth is not ready', () => {
    setupMock({ isAuthReady: false });
    render(<Header />);
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('opens about dropdown when button is clicked', async () => {
    setupMock();
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: /Nosotros/ }));

    expect(screen.getByRole('link', { name: 'Quiénes Somos' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Trabaja con Nosotros' })).toHaveAttribute('href', '/work-with-us');
    expect(screen.getByRole('link', { name: 'Aliados Estratégicos' })).toHaveAttribute('href', '/strategic-allies');
  });

  it('closes about dropdown when clicking about sub-link', async () => {
    setupMock();
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: /Nosotros/ }));
    expect(screen.getByRole('link', { name: 'Quiénes Somos' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Quiénes Somos' }));
    expect(screen.queryByRole('link', { name: 'Trabaja con Nosotros' })).not.toBeInTheDocument();
  });

  it('opens notification dropdown when bell is clicked', async () => {
    const mockFetchNotifications = jest.fn();
    jest.mocked(jest.requireMock('@/lib/stores/notificationStore') as any).useNotificationStore.mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          unreadCount: 3,
          notifications: [],
          fetchUnreadCount: jest.fn(),
          fetchNotifications: mockFetchNotifications,
          markAllAsRead: jest.fn(),
        }),
    );
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    expect(mockFetchNotifications).toHaveBeenCalledWith('in_app');
  });

  it('closes notification dropdown when bell is clicked again', async () => {
    jest.mocked(jest.requireMock('@/lib/stores/notificationStore') as any).useNotificationStore.mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          unreadCount: 0,
          notifications: [],
          fetchUnreadCount: jest.fn(),
          fetchNotifications: jest.fn(),
          markAllAsRead: jest.fn(),
        }),
    );
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    const bellButton = screen.getByRole('button', { name: 'Notificaciones' });
    await userEvent.click(bellButton);
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

    await userEvent.click(bellButton);
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('shows mark-all-read button when there are unread notifications', async () => {
    const mockMarkAllAsRead = jest.fn().mockResolvedValue(undefined);
    jest.mocked(jest.requireMock('@/lib/stores/notificationStore') as any).useNotificationStore.mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          unreadCount: 5,
          notifications: [],
          fetchUnreadCount: jest.fn(),
          fetchNotifications: jest.fn(),
          markAllAsRead: mockMarkAllAsRead,
        }),
    );
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    const markAllBtn = screen.getByRole('button', { name: /Marcar todo leído/ });
    await userEvent.click(markAllBtn);

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('displays 99+ when unread count exceeds 99', () => {
    jest.mocked(jest.requireMock('@/lib/stores/notificationStore') as any).useNotificationStore.mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          unreadCount: 150,
          notifications: [],
          fetchUnreadCount: jest.fn(),
          fetchNotifications: jest.fn(),
          markAllAsRead: jest.fn(),
        }),
    );
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows no-notifications message in empty dropdown', async () => {
    jest.mocked(jest.requireMock('@/lib/stores/notificationStore') as any).useNotificationStore.mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          unreadCount: 0,
          notifications: [],
          fetchUnreadCount: jest.fn(),
          fetchNotifications: jest.fn(),
          markAllAsRead: jest.fn(),
        }),
    );
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    expect(screen.getByText('No tienes notificaciones.')).toBeInTheDocument();
  });
});
