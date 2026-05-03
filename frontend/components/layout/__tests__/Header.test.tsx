import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
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

const openAccountMenu = async () => {
  await userEvent.click(screen.getAllByRole('button', { name: 'Abrir menú de cuenta' })[0]);
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
    expect(screen.getAllByRole('link', { name: 'Animales' })[0]).toHaveAttribute('href', '/animals');
    expect(screen.getAllByRole('link', { name: 'Refugios' })[0]).toHaveAttribute('href', '/shelters');
    expect(screen.getAllByRole('link', { name: 'Campañas' })[0]).toHaveAttribute('href', '/campaigns');
    expect(screen.getAllByRole('link', { name: 'Busco Adoptar' })[0]).toHaveAttribute('href', '/looking-to-adopt');
  });

  it('renders sign-in and sign-up links when unauthenticated', () => {
    setupMock();
    render(<Header />);
    expect(screen.getAllByRole('link', { name: 'Iniciar sesión' })[0]).toHaveAttribute('href', '/sign-in');
    expect(screen.getAllByRole('link', { name: 'Registrarse' })[0]).toHaveAttribute('href', '/sign-up');
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

  it('exposes Favoritos and Mi Perfil inside the account menu when authenticated', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);

    await openAccountMenu();

    expect(screen.getByRole('menuitem', { name: /Favoritos/ })).toHaveAttribute('href', '/favorites');
    expect(screen.getByRole('menuitem', { name: /Mi Perfil/ })).toHaveAttribute('href', '/my-profile');
  });

  it.each(['adopter', 'shelter_admin'])(
    'exposes the Manual link in the account menu for %s',
    async (role) => {
      setupMock({ isAuthenticated: true, user: { role } });
      render(<Header />);

      await openAccountMenu();

      expect(screen.getByRole('menuitem', { name: /Manual/ })).toHaveAttribute('href', '/manual');
    },
  );

  it('shows the Manual link in the mobile menu for authenticated users', async () => {
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    expect(screen.getByRole('link', { name: /Manual/ })).toHaveAttribute('href', '/manual');
  });

  it('does not expose the Manual link when unauthenticated', async () => {
    setupMock();
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    expect(screen.queryByRole('link', { name: /Manual/ })).not.toBeInTheDocument();
  });

  it('hides the role panel button for adopters', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);
    expect(screen.queryByRole('button', { name: /Panel Refugio/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Panel Web Manager/ })).not.toBeInTheDocument();
  });

  it('opens a panel dropdown with all shelter sub-sections for shelter_admin', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'shelter_admin' },
    });
    render(<Header />);

    const panelButton = screen.getAllByRole('button', { name: /Panel Refugio/ })[0];
    await userEvent.click(panelButton);

    expect(screen.getByRole('menuitem', { name: /Dashboard/ })).toHaveAttribute('href', '/shelter/dashboard');
    expect(screen.getByRole('menuitem', { name: /Solicitudes/ })).toHaveAttribute('href', '/shelter/applications');
    expect(screen.getByRole('menuitem', { name: /Ajustes/ })).toHaveAttribute('href', '/shelter/settings');
  });

  it('opens a panel dropdown with web-manager sub-sections for web_manager', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'web_manager' },
    });
    render(<Header />);

    await userEvent.click(screen.getAllByRole('button', { name: /Gestión Web/ })[0]);

    expect(screen.getByRole('menuitem', { name: /Solicitudes/ })).toHaveAttribute('href', '/web-manager/applications');
    expect(screen.getByRole('menuitem', { name: /Refugios/ })).toHaveAttribute('href', '/web-manager/shelters');
    expect(screen.getByRole('menuitem', { name: /Campañas/ })).toHaveAttribute('href', '/web-manager/campaigns');
  });

  it('opens a panel dropdown with admin sub-sections for admin', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'admin' },
    });
    render(<Header />);

    await userEvent.click(screen.getAllByRole('button', { name: /Admin/ })[0]);

    expect(screen.getByRole('menuitem', { name: /Dashboard/ })).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.getByRole('menuitem', { name: /Aprobar refugios/ })).toHaveAttribute('href', '/admin/shelters/approve');
    expect(screen.getByRole('menuitem', { name: /Moderación/ })).toHaveAttribute('href', '/admin/moderation');
  });

  it('renders the veterinarian panel as a direct link (single sub-section)', () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'veterinarian' },
    });
    render(<Header />);
    expect(screen.getAllByRole('link', { name: /Panel Veterinario/ })[0]).toHaveAttribute('href', '/veterinarian/follow-ups');
  });

  it('places the sign-out button inside the account menu and triggers signOut', async () => {
    const mockSignOut = jest.fn();
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
      signOut: mockSignOut,
    });
    render(<Header />);

    await openAccountMenu();
    const signOutBtn = screen.getByRole('menuitem', { name: 'Salir' });
    await userEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders locale switcher', () => {
    setupMock();
    render(<Header />);
    expect(screen.getAllByTestId('locale-switcher')[0]).toBeInTheDocument();
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
    const mobileLink = mobileLinks[mobileLinks.length - 1];
    await userEvent.click(mobileLink);

    // quality: disable fragile_locator (animation class .animate-scale-out is only detectable via DOM query)
    const closingPanel = document.querySelector('.animate-scale-out');
    expect(closingPanel).not.toBeNull();
    fireEvent.animationEnd(closingPanel!);

    const remainingLinks = screen.getAllByRole('link', { name: 'Animales' });
    expect(remainingLinks).toHaveLength(2);
  });

  it('shows authenticated account links in mobile menu', async () => {
    setupMock({
      isAuthenticated: true,
      user: { role: 'adopter' },
    });
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    expect(screen.getByRole('link', { name: 'Favoritos' })).toHaveAttribute('href', '/favorites');
    expect(screen.getByRole('link', { name: 'Mi Perfil' })).toHaveAttribute('href', '/my-profile');
    expect(screen.getByRole('link', { name: 'Mis solicitudes' })).toHaveAttribute('href', '/my-applications');
  });

  it('calls signOut from the mobile menu sign-out button', async () => {
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

    expect(screen.getByRole('menuitem', { name: 'Quiénes Somos' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('menuitem', { name: 'Trabaja con Nosotros' })).toHaveAttribute('href', '/work-with-us');
    expect(screen.getByRole('menuitem', { name: 'Aliados Estratégicos' })).toHaveAttribute('href', '/strategic-allies');
  });

  it('closes about dropdown when clicking about sub-link', async () => {
    setupMock();
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: /Nosotros/ }));
    expect(screen.getByRole('menuitem', { name: 'Quiénes Somos' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Quiénes Somos' }));
    expect(screen.queryByRole('menuitem', { name: 'Trabaja con Nosotros' })).not.toBeInTheDocument();
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

    await userEvent.click(screen.getAllByRole('button', { name: 'Notificaciones' })[0]);

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

    const bellButton = screen.getAllByRole('button', { name: 'Notificaciones' })[0];
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

    await userEvent.click(screen.getAllByRole('button', { name: 'Notificaciones' })[0]);
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

    expect(screen.getAllByText('99+')).toHaveLength(3);
  });

  it('renders a mobile notification shortcut linking to /my-profile/notifications when authenticated', () => {
    setupMock({ isAuthenticated: true, user: { role: 'adopter' } });
    render(<Header />);

    const bellLinks = screen.getAllByRole('link', { name: 'Notificaciones' });
    expect(bellLinks[0]).toHaveAttribute('href', '/my-profile/notifications');
  });

  it('hides the mobile notification shortcut when unauthenticated', () => {
    setupMock();
    render(<Header />);
    expect(screen.queryByRole('link', { name: 'Notificaciones' })).not.toBeInTheDocument();
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

    await userEvent.click(screen.getAllByRole('button', { name: 'Notificaciones' })[0]);
    expect(screen.getByText('No tienes notificaciones.')).toBeInTheDocument();
  });
});
