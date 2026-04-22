import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterCampaignNewPage from '../page';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/campaignStore', () => ({ useCampaignStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { get: jest.fn() } }));

const mockUseCampaignStore = useCampaignStore as unknown as jest.Mock;
const mockApiGet = api.get as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    createCampaign: jest.fn().mockResolvedValue({ id: 99 }),
  };
  const state = { ...defaults, ...overrides };
  mockUseCampaignStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterCampaignNewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: [{ id: 1 }] });
  });

  it('shows loading state initially', () => {
    mockApiGet.mockReturnValue(new Promise(() => {})); // never resolves
    setupMock();
    render(<ShelterCampaignNewPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders form heading after shelter loads', async () => {
    setupMock();
    render(<ShelterCampaignNewPage />);
    expect(await screen.findByText('Solicitar nueva campaña')).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    setupMock();
    render(<ShelterCampaignNewPage />);
    expect(await screen.findByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Meta (COP)')).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    setupMock();
    render(<ShelterCampaignNewPage />);
    expect(await screen.findByText('Enviar para revisión')).toBeInTheDocument();
  });
});
