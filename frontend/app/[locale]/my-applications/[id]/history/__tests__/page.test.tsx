import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import MyApplicationHistoryPage from '../page';
import { useClinicalHistoryStore } from '@/lib/stores/clinicalHistoryStore';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '5' }),
}));

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/clinicalHistoryStore', () => ({ useClinicalHistoryStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));
jest.mock('@/components/veterinarian/ClinicalHistoryTimeline', () => ({
  __esModule: true,
  default: () => <div data-testid="clinical-timeline" />,
}));

const mockUseClinicalHistoryStore = useClinicalHistoryStore as unknown as jest.Mock;

describe('MyApplicationHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClinicalHistoryStore.mockImplementation((sel: any) =>
      sel({ entries: [], fetchForAnimal: jest.fn() }),
    );
  });

  it('renders back link', () => {
    render(<MyApplicationHistoryPage />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders loading text when application is not loaded', () => {
    render(<MyApplicationHistoryPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders clinical history timeline', () => {
    render(<MyApplicationHistoryPage />);
    expect(screen.getByTestId('clinical-timeline')).toBeInTheDocument();
  });

  it('renders clinical history section heading', () => {
    render(<MyApplicationHistoryPage />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
