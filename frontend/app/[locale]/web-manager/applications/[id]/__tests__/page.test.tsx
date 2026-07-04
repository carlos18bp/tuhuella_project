import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WebManagerApplicationDetailPage from '../page';
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
jest.mock('@/components/adoption/AdoptionEventTimeline', () => ({
  __esModule: true,
  default: ({ canCreate }: { canCreate: boolean }) => (
    <div data-testid="event-timeline" data-cancreate={String(canCreate)} />
  ),
}));

const mockUseAdoptionStore = useAdoptionStore as unknown as jest.Mock;

const buildApplication = (overrides: Record<string, unknown> = {}) => ({
  id: 5,
  animal_name: 'Luna',
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  user_email: 'adopter@example.com',
  status: 'interview',
  next_follow_up_due_at: '2099-01-01T00:00:00Z',
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
    createEvent: jest.fn().mockResolvedValue(undefined),
    applicationsById: application ? { [application.id]: application } : {},
  };
  mockUseAdoptionStore.mockImplementation((sel: (s: typeof state) => unknown) => sel(state));
  return { fetchApplication };
};

describe('WebManagerApplicationDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading text while the application is being fetched', () => {
    setupMocks({ application: null, fetchApplication: jest.fn(pending) });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByText('Cargando solicitud...')).toBeInTheDocument();
  });

  it('renders the not-found message when the application is absent', async () => {
    setupMocks({ application: null, fetchApplication: jest.fn().mockResolvedValue(undefined) });
    render(<WebManagerApplicationDetailPage />);
    expect(await screen.findByText('No encontramos la solicitud.')).toBeInTheDocument();
  });

  it('renders the animal name as the heading when loaded', () => {
    setupMocks({ application: buildApplication() });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luna');
  });

  it('shows the applicant email', () => {
    setupMocks({ application: buildApplication() });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByText(/adopter@example\.com/)).toBeInTheDocument();
  });

  it('shows the follow-up reminder for an interview application with a due date', () => {
    setupMocks({ application: buildApplication({ status: 'interview' }) });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByText('Próximo recordatorio de seguimiento')).toBeInTheDocument();
  });

  it('hides the follow-up reminder for a non-interview application', () => {
    setupMocks({ application: buildApplication({ status: 'submitted' }) });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.queryByText('Próximo recordatorio de seguimiento')).not.toBeInTheDocument();
  });

  it('enables event creation for an interview application', () => {
    setupMocks({ application: buildApplication({ status: 'interview' }) });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByTestId('event-timeline')).toHaveAttribute('data-cancreate', 'true');
  });

  it('disables event creation for a rejected application', () => {
    setupMocks({ application: buildApplication({ status: 'rejected' }) });
    render(<WebManagerApplicationDetailPage />);
    expect(screen.getByTestId('event-timeline')).toHaveAttribute('data-cancreate', 'false');
  });

  it('fetches the application by id on mount', () => {
    const { fetchApplication } = setupMocks({ application: buildApplication() });
    render(<WebManagerApplicationDetailPage />);
    expect(fetchApplication).toHaveBeenCalledWith(5);
  });
});
