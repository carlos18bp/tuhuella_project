import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import MyApplicationDetailPage from '../page';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '5' }),
}));

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/adoptionStore', () => ({ useAdoptionStore: jest.fn() }));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
jest.mock('@/components/ui/ApplicationStatusBadge', () => ({
  __esModule: true,
  default: () => <span data-testid="status-badge" />,
}));
jest.mock('@/components/ui/ApplicationTimeline', () => ({
  __esModule: true,
  default: () => <div data-testid="app-timeline" />,
}));
jest.mock('@/components/adoption/WhatsAppContactCard', () => ({
  __esModule: true,
  default: () => <div data-testid="whatsapp-card" />,
}));
jest.mock('@/components/adoption/AdoptionEventTimeline', () => ({
  __esModule: true,
  default: () => <div data-testid="event-timeline" />,
}));

const mockUseAdoptionStore = useAdoptionStore as unknown as jest.Mock;

const buildApplication = (overrides: Record<string, unknown> = {}) => ({
  id: 5,
  animal_name: 'Luna',
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  shelter_whatsapp: '',
  status: 'interview',
  created_at: '2026-01-10T00:00:00Z',
  events: [],
  ...overrides,
});

const pending = () => new Promise<void>(() => {});

const setupMocks = ({
  application = null as ReturnType<typeof buildApplication> | null,
  fetchApplication = jest.fn(pending),
}: {
  application?: ReturnType<typeof buildApplication> | null;
  fetchApplication?: jest.Mock;
} = {}) => {
  const state = {
    fetchApplication,
    applicationsById: application ? { [application.id]: application } : {},
  };
  mockUseAdoptionStore.mockImplementation((sel: (s: typeof state) => unknown) => sel(state));
  return { fetchApplication };
};

describe('MyApplicationDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading text while the application is being fetched', () => {
    setupMocks({ application: null, fetchApplication: jest.fn(pending) });
    render(<MyApplicationDetailPage />);
    expect(screen.getByText('Cargando solicitud...')).toBeInTheDocument();
  });

  it('renders the not-found message when the application is absent', async () => {
    setupMocks({ application: null, fetchApplication: jest.fn().mockResolvedValue(undefined) });
    render(<MyApplicationDetailPage />);
    expect(
      await screen.findByText('No encontramos la solicitud o no tienes acceso.'),
    ).toBeInTheDocument();
  });

  it('renders the animal name as the heading when loaded', () => {
    setupMocks({ application: buildApplication() });
    render(<MyApplicationDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luna');
  });

  it('shows the WhatsApp contact card when the shelter has a WhatsApp number', () => {
    setupMocks({ application: buildApplication({ shelter_whatsapp: '3001234567' }) });
    render(<MyApplicationDetailPage />);
    expect(screen.getByTestId('whatsapp-card')).toBeInTheDocument();
  });

  it('hides the WhatsApp contact card when no WhatsApp number is set', () => {
    setupMocks({ application: buildApplication({ shelter_whatsapp: '' }) });
    render(<MyApplicationDetailPage />);
    expect(screen.queryByTestId('whatsapp-card')).not.toBeInTheDocument();
  });

  it('links to the clinical history when loaded', () => {
    setupMocks({ application: buildApplication() });
    render(<MyApplicationDetailPage />);
    expect(screen.getByText('Ver historia clínica')).toBeInTheDocument();
  });

  it('fetches the application by id on mount', () => {
    const { fetchApplication } = setupMocks({ application: buildApplication() });
    render(<MyApplicationDetailPage />);
    expect(fetchApplication).toHaveBeenCalledWith(5);
  });
});
