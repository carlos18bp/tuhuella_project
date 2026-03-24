import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterApplicationsPage from '../page';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';
import { mockAdoptionApplications } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/adoptionStore', () => ({ useAdoptionStore: jest.fn() }));

const mockUseAdoptionStore = useAdoptionStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    applications: [],
    loading: false,
    fetchApplications: jest.fn(),
    updateStatus: jest.fn().mockResolvedValue({}),
  };
  const state = { ...defaults, ...overrides };
  mockUseAdoptionStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterApplicationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<ShelterApplicationsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Solicitudes de Adopción');
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    const { container } = render(<ShelterApplicationsPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty message when no applications exist', () => {
    setupMock({ applications: [] });
    render(<ShelterApplicationsPage />);
    expect(screen.getByText('No hay solicitudes de adopción.')).toBeInTheDocument();
  });

  it('renders application details when applications are loaded', () => {
    setupMock({ applications: mockAdoptionApplications });
    render(<ShelterApplicationsPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText(/adopter@example.com/)).toBeInTheDocument();
  });

  it('renders submitted status badge', () => {
    setupMock({ applications: mockAdoptionApplications });
    render(<ShelterApplicationsPage />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renders notes when provided', () => {
    setupMock({ applications: mockAdoptionApplications });
    render(<ShelterApplicationsPage />);
    expect(screen.getByText('Tengo experiencia con perros')).toBeInTheDocument();
  });

  it('renders Revisar button for submitted applications', () => {
    setupMock({ applications: mockAdoptionApplications });
    render(<ShelterApplicationsPage />);
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeInTheDocument();
  });

  it('calls updateStatus when Revisar is clicked', async () => {
    const state = setupMock({ applications: mockAdoptionApplications });
    render(<ShelterApplicationsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }));

    await waitFor(() => {
      expect(state.updateStatus).toHaveBeenCalledWith(1, 'reviewing');
    });
  });

  it('renders Entrevista and Rechazar for reviewing applications', () => {
    const reviewingApp = { ...mockAdoptionApplications[0], status: 'reviewing' };
    setupMock({ applications: [reviewingApp] });
    render(<ShelterApplicationsPage />);
    expect(screen.getByRole('button', { name: 'Entrevista' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument();
  });

  it('renders Aprobar and Rechazar buttons for interview applications', () => {
    const interviewApp = { ...mockAdoptionApplications[0], status: 'interview' };
    setupMock({ applications: [interviewApp] });
    render(<ShelterApplicationsPage />);
    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument();
  });

  it('calls updateStatus with approved when Aprobar is clicked', async () => {
    const interviewApp = { ...mockAdoptionApplications[0], status: 'interview' };
    const state = setupMock({ applications: [interviewApp] });
    render(<ShelterApplicationsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => {
      expect(state.updateStatus).toHaveBeenCalledWith(1, 'approved');
    });
  });

  it('calls updateStatus with rejected when Rechazar is clicked', async () => {
    const interviewApp = { ...mockAdoptionApplications[0], status: 'interview' };
    const state = setupMock({ applications: [interviewApp] });
    render(<ShelterApplicationsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => {
      expect(state.updateStatus).toHaveBeenCalledWith(1, 'rejected');
    });
  });

  it('hides action buttons for approved applications', () => {
    const approvedApp = { ...mockAdoptionApplications[0], status: 'approved' };
    setupMock({ applications: [approvedApp] });
    render(<ShelterApplicationsPage />);
    expect(screen.queryByRole('button', { name: 'Revisar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
  });

  it('hides action buttons for rejected applications', () => {
    const rejectedApp = { ...mockAdoptionApplications[0], status: 'rejected' };
    setupMock({ applications: [rejectedApp] });
    render(<ShelterApplicationsPage />);
    expect(screen.queryByRole('button', { name: 'Revisar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rechazar' })).not.toBeInTheDocument();
  });

  it('calls fetchApplications on mount', () => {
    const state = setupMock();
    render(<ShelterApplicationsPage />);
    expect(state.fetchApplications).toHaveBeenCalled();
  });
});
