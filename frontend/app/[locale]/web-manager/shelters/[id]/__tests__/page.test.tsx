import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WebManagerShelterDetailPage from '../page';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

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

const mockShelter = {
  id: 1,
  name: 'Patitas Felices',
  city: 'Bogota',
  verification_status: 'verified',
  owner_email: 'owner@test.com',
  description: 'Un refugio dedicado a rescatar animales.',
};

const mockApplications = [
  { id: 10, animal_name: 'Luna', status: 'submitted' },
  { id: 11, animal_name: 'Rocky', status: 'approved' },
];

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    shelters: [mockShelter],
    fetchShelters: jest.fn(),
    applications: [],
    applicationsLoading: false,
    fetchShelterApplications: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('WebManagerShelterDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders shelter name in heading', () => {
    setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Patitas Felices');
  });

  it('renders back to shelters link', () => {
    setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByText('Volver a refugios')).toBeInTheDocument();
  });

  it('renders shelter city and verification status', () => {
    setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByText(/Bogota/)).toBeInTheDocument();
  });

  it('renders loading text when shelter not found', () => {
    setupMock({ shelters: [] });
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cargando...');
  });

  it('renders tab buttons', () => {
    setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByText('Información')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes')).toBeInTheDocument();
  });

  it('renders applications tab by default', () => {
    setupMock({ applications: mockApplications });
    render(<WebManagerShelterDetailPage />);
    expect(screen.getByTestId('admin-applications-table')).toBeInTheDocument();
  });

  it('switches to info tab and shows shelter details', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<WebManagerShelterDetailPage />);

    await user.click(screen.getByText('Información'));
    expect(screen.getByText('owner@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bogota')).toBeInTheDocument();
  });

  it('renders shelter description on info tab', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<WebManagerShelterDetailPage />);

    await user.click(screen.getByText('Información'));
    expect(screen.getByText('Un refugio dedicado a rescatar animales.')).toBeInTheDocument();
  });

  it('calls fetchShelterApplications on mount', () => {
    const state = setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(state.fetchShelterApplications).toHaveBeenCalledWith(1, { page: 1, page_size: 50 });
  });

  it('does not fetch shelters when shelters array is populated', () => {
    const state = setupMock();
    render(<WebManagerShelterDetailPage />);
    expect(state.fetchShelters).not.toHaveBeenCalled();
  });

  it('fetches shelters when shelters array is empty', () => {
    const state = setupMock({ shelters: [] });
    render(<WebManagerShelterDetailPage />);
    expect(state.fetchShelters).toHaveBeenCalledWith({ page_size: 100 });
  });
});
