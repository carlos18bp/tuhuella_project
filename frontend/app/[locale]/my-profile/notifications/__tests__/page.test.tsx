import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="icon-arrowleft" />,
  Bell: () => <span data-testid="icon-bell" />,
}));

jest.mock('@/lib/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(),
}));

jest.mock('@/lib/stores/notificationStore', () => ({
  useNotificationStore: (selector: any) => {
    const state = {
      preferences: [
        { id: 1, event_key: 'adoption_submitted', channel: 'email', enabled: true },
        { id: 2, event_key: 'adoption_submitted', channel: 'in_app', enabled: false },
      ],
      initPreferences: jest.fn(),
      updatePreference: jest.fn(),
    };
    return selector(state);
  },
}));

import NotificationPreferencesPage from '../page';

describe('NotificationPreferencesPage', () => {
  it('renders page title from t("preferencesTitle")', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Preferencias de notificación');
  });

  it('renders back to profile link', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByRole('link', { name: /Volver a mi perfil/ })).toBeInTheDocument();
  });

  it('renders Adopción event group heading', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByText('Adopción')).toBeInTheDocument();
  });

  it('renders Refugio event group heading', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByText('Refugio')).toBeInTheDocument();
  });

  it('renders Donaciones y apadrinamientos event group heading', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByText('Donaciones y apadrinamientos')).toBeInTheDocument();
  });

  it('renders Campañas event group heading', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getByText('Campañas')).toBeInTheDocument();
  });

  it('renders toggle buttons for each event+channel combination', () => {
    render(<NotificationPreferencesPage />);
    const toggles = screen.getAllByRole('button');
    // 4 groups × varying events × 2 channels = many toggles; at minimum check some exist
    expect(toggles.length).toBeGreaterThan(0);
  });

  it('renders toggle for adoption_submitted email channel', () => {
    render(<NotificationPreferencesPage />);
    expect(
      screen.getByRole('button', { name: /Solicitud de adopción enviada.*Email/i })
    ).toBeInTheDocument();
  });

  it('renders toggle for adoption_submitted in_app channel', () => {
    render(<NotificationPreferencesPage />);
    expect(
      screen.getByRole('button', { name: /Solicitud de adopción enviada.*App/i })
    ).toBeInTheDocument();
  });

  it('renders event column header', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getAllByText('Evento').length).toBeGreaterThan(0);
  });

  it('renders Email channel column header', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
  });

  it('renders App channel column header', () => {
    render(<NotificationPreferencesPage />);
    expect(screen.getAllByText('App').length).toBeGreaterThan(0);
  });
});

describe('NotificationPreferencesPage — toggle interaction', () => {
  const mockUpdatePreference = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.mock('@/lib/stores/notificationStore', () => ({
    useNotificationStore: (selector: any) => {
      const updatePref = jest.fn();
      const state = {
        preferences: [
          { id: 1, event_key: 'adoption_submitted', channel: 'email', enabled: true },
          { id: 2, event_key: 'adoption_submitted', channel: 'in_app', enabled: false },
        ],
        initPreferences: jest.fn(),
        updatePreference: updatePref,
      };
      return selector(state);
    },
  }));

  it('renders enabled toggle with teal background for enabled preference', () => {
    render(<NotificationPreferencesPage />);
    const toggle = screen.getByTestId('toggle-adoption_submitted-email');
    expect(toggle.className).toContain('bg-teal-500');
  });

  it('renders disabled toggle with stone background for disabled preference', () => {
    render(<NotificationPreferencesPage />);
    const toggle = screen.getByTestId('toggle-adoption_submitted-in_app');
    expect(toggle.className).toContain('bg-stone-200');
  });
});
