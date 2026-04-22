import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import VeterinarianFollowUpDetailPage from '../page';
import { useFollowUpStore } from '@/lib/stores/followUpStore';
import { useClinicalHistoryStore } from '@/lib/stores/clinicalHistoryStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

jest.mock('@/lib/stores/followUpStore', () => ({ useFollowUpStore: jest.fn() }));
jest.mock('@/lib/stores/clinicalHistoryStore', () => ({ useClinicalHistoryStore: jest.fn() }));
jest.mock('@/components/veterinarian/ClinicalEntryForm', () => ({
  __esModule: true,
  default: () => <div data-testid="clinical-entry-form" />,
}));
jest.mock('@/components/veterinarian/ClinicalHistoryTimeline', () => ({
  __esModule: true,
  default: () => <div data-testid="clinical-timeline" />,
}));

const mockUseFollowUpStore = useFollowUpStore as unknown as jest.Mock;
const mockUseClinicalHistoryStore = useClinicalHistoryStore as unknown as jest.Mock;

const mockDetail = {
  id: 1,
  animal: 7,
  animal_name: 'Luna',
  scheduled_date: '2026-05-01',
  status: 'pending',
  clinical_entries: [],
};

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const followUpDefaults: Record<string, unknown> = {
    detail: mockDetail,
    loading: false,
    fetchDetail: jest.fn(),
    markComplete: jest.fn(),
  };
  const clinicalDefaults: Record<string, unknown> = {
    entries: [],
    addEntry: jest.fn(),
    setEntries: jest.fn(),
  };
  const followUpState = { ...followUpDefaults, ...overrides };
  mockUseFollowUpStore.mockImplementation((sel: any) => sel(followUpState));
  mockUseClinicalHistoryStore.mockImplementation((sel: any) => sel(clinicalDefaults));
  return followUpState;
};

describe('VeterinarianFollowUpDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when detail is null', () => {
    setupMock({ detail: null, loading: true });
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByText(/Cargando/)).toBeInTheDocument();
  });

  it('renders animal name in heading', () => {
    setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luna');
  });

  it('renders back link', () => {
    setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders mark complete button for non-completed status', () => {
    setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides mark complete button for completed status', () => {
    setupMock({ detail: { ...mockDetail, status: 'completed' } });
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders clinical history timeline', () => {
    setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByTestId('clinical-timeline')).toBeInTheDocument();
  });

  it('renders clinical entry form', () => {
    setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(screen.getByTestId('clinical-entry-form')).toBeInTheDocument();
  });

  it('calls fetchDetail on mount', () => {
    const state = setupMock();
    render(<VeterinarianFollowUpDetailPage />);
    expect(state.fetchDetail).toHaveBeenCalledWith(1);
  });
});
