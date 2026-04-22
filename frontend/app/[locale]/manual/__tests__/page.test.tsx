import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ManualPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';

jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/manual/content', () => ({
  MANUAL_SECTIONS: [
    {
      id: 'test-section',
      title: { es: 'Sección de prueba', en: 'Test Section' },
      audiences: ['public'],
      highlight: false,
      icon: () => React.createElement('span', null, 'icon'),
      processes: [
        {
          id: 'test-process',
          title: { es: 'Proceso', en: 'Process' },
          summary: { es: 'Resumen', en: 'Summary' },
          audiences: ['public'],
          steps: [],
          keywords: [],
          route: null,
        },
      ],
    },
  ],
}));
jest.mock('@/lib/manual/filterByRole', () => ({
  filterManualSectionsForRole: (sections: any[]) => sections,
}));
jest.mock('@/components/manual/ManualSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="manual-sidebar" />,
}));
jest.mock('@/components/manual/ManualSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="manual-search" />,
}));
jest.mock('@/components/manual/ProcessCard', () => ({
  __esModule: true,
  default: ({ process }: any) => <div data-testid="process-card">{process.title.es}</div>,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('ManualPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation((sel: any) => sel({ user: null }));
  });

  it('renders page heading', () => {
    render(<ManualPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    render(<ManualPage />);
    expect(screen.getByTestId('manual-sidebar')).toBeInTheDocument();
  });

  it('renders search', () => {
    render(<ManualPage />);
    expect(screen.getByTestId('manual-search')).toBeInTheDocument();
  });

  it('renders process card', () => {
    render(<ManualPage />);
    expect(screen.getByTestId('process-card')).toBeInTheDocument();
    expect(screen.getByText('Proceso')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<ManualPage />);
    expect(screen.getByText('Sección de prueba')).toBeInTheDocument();
  });
});
