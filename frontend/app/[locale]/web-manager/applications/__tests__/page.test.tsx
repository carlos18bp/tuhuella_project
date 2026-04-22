import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WebManagerApplicationsPage from '../page';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('@/lib/stores/webManagerStore', () => ({ useWebManagerStore: jest.fn() }));

jest.mock('@/components/web-manager/AdminApplicationsTable', () => ({
  __esModule: true,
  default: ({ items, loading, showShelter }: any) => (
    <div data-testid="admin-applications-table">
      {loading ? 'Loading...' : `${items.length} applications`}
      {showShelter && ' (shelter visible)'}
    </div>
  ),
}));

const mockUseWebManagerStore = useWebManagerStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    applications: [],
    applicationsMeta: null,
    applicationsLoading: false,
    fetchApplications: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  return state;
};

const mockApplications = [
  { id: 1, animal_name: 'Luna', status: 'submitted' },
  { id: 2, animal_name: 'Rocky', status: 'approved' },
];

describe('WebManagerApplicationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<WebManagerApplicationsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Solicitudes de adopción',
    );
  });

  it('renders subtitle', () => {
    setupMock();
    render(<WebManagerApplicationsPage />);
    expect(
      screen.getByText('Solicitudes recibidas por todos los refugios.'),
    ).toBeInTheDocument();
  });

  it('renders applications table with showShelter=true', () => {
    setupMock({ applications: mockApplications });
    render(<WebManagerApplicationsPage />);
    const table = screen.getByTestId('admin-applications-table');
    expect(table).toHaveTextContent('2 applications');
    expect(table).toHaveTextContent('(shelter visible)');
  });

  it('passes loading state to table', () => {
    setupMock({ applicationsLoading: true });
    render(<WebManagerApplicationsPage />);
    expect(screen.getByTestId('admin-applications-table')).toHaveTextContent('Loading...');
  });

  it('renders results count when meta is available', () => {
    setupMock({
      applications: mockApplications,
      applicationsMeta: { count: 2, page: 1, total_pages: 1 },
    });
    render(<WebManagerApplicationsPage />);
    expect(screen.getByText('2 resultado(s)')).toBeInTheDocument();
  });

  it('does not render results count when meta is null', () => {
    setupMock();
    render(<WebManagerApplicationsPage />);
    expect(screen.queryByText(/resultado/)).not.toBeInTheDocument();
  });

  it('renders filter buttons for all status options', () => {
    setupMock();
    render(<WebManagerApplicationsPage />);
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Enviada')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
  });

  it('calls fetchApplications on mount', () => {
    const state = setupMock();
    render(<WebManagerApplicationsPage />);
    expect(state.fetchApplications).toHaveBeenCalled();
  });
});
