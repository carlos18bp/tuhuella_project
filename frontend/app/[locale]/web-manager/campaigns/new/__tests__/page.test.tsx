import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import WebManagerCampaignNewPage from '../page';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';

jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/lib/stores/webManagerStore', () => ({ useWebManagerStore: jest.fn() }));

const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;
const mockUseWebManagerStore = useWebManagerStore as unknown as jest.Mock;

const mockShelters = [
  { id: 1, name: 'Patitas Felices' },
  { id: 2, name: 'Hogar Animal' },
];

const setupMocks = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    shelters: mockShelters,
    fetchShelters: jest.fn(),
    createCampaign: jest.fn().mockResolvedValue({ id: 99 }),
  };
  const state = { ...defaults, ...overrides };
  mockUseWebManagerStore.mockImplementation((sel: any) => sel(state));
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('WebManagerCampaignNewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nueva campaña');
  });

  it('renders subtitle about auto-approval', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(
      screen.getByText(/Las campañas creadas por el web manager se aprueban automáticamente/),
    ).toBeInTheDocument();
  });

  it('renders shelter select with options', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(screen.getByText('Refugio')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un refugio')).toBeInTheDocument();
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
    expect(screen.getByText('Hogar Animal')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(screen.getByText('Título (ES)')).toBeInTheDocument();
    expect(screen.getByText('Título (EN)')).toBeInTheDocument();
    expect(screen.getByText('Descripción (ES)')).toBeInTheDocument();
    expect(screen.getByText('Descripción (EN)')).toBeInTheDocument();
    expect(screen.getByText('Meta (COP)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(screen.getByRole('button', { name: 'Crear campaña' })).toBeInTheDocument();
  });

  it('calls fetchShelters on mount', () => {
    const state = setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(state.fetchShelters).toHaveBeenCalledWith({ page: 1, page_size: 200 });
  });

  it('renders empty select when no shelters are loaded', () => {
    setupMocks({ shelters: [] });
    render(<WebManagerCampaignNewPage />);
    const select = screen.getByRole('combobox');
    expect(select.children.length).toBe(1);
  });

  it('renders submit button enabled by default', () => {
    setupMocks();
    render(<WebManagerCampaignNewPage />);
    expect(screen.getByRole('button', { name: 'Crear campaña' })).not.toBeDisabled();
  });
});
