import React from 'react';
import { render, screen, act } from '@testing-library/react';

import WebManagerProfileSection from '../WebManagerProfileSection';

const mockGet = jest.fn();

jest.mock('@/lib/services/http', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}));

const resolveWith = (pending: number, submitted: number, pendingCampaigns: number) => {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('shelters')) return Promise.resolve({ data: { count: pending } });
    if (url.includes('applications')) return Promise.resolve({ data: { count: submitted } });
    if (url.includes('campaigns')) return Promise.resolve({ data: { count: pendingCampaigns } });
    return Promise.reject(new Error('unknown endpoint'));
  });
};

describe('WebManagerProfileSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders overview heading', async () => {
    resolveWith(0, 0, 0);
    await act(async () => render(<WebManagerProfileSection />));
    expect(screen.getByText('Resumen del web manager')).toBeInTheDocument();
  });

  it('shows em-dash before counts resolve', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<WebManagerProfileSection />);
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBe(3);
  });

  it('displays fetched counts after resolution', async () => {
    resolveWith(4, 7, 2);
    await act(async () => render(<WebManagerProfileSection />));
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders stat labels', async () => {
    resolveWith(0, 0, 0);
    await act(async () => render(<WebManagerProfileSection />));
    expect(screen.getByText('Refugios por verificar')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes nuevas')).toBeInTheDocument();
    expect(screen.getByText('Campañas por revisar')).toBeInTheDocument();
  });

  it('falls back to em-dash when a fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    await act(async () => render(<WebManagerProfileSection />));
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBe(3);
  });

  it('renders quick actions heading', async () => {
    resolveWith(0, 0, 0);
    await act(async () => render(<WebManagerProfileSection />));
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument();
  });

  it('renders four quick action links', async () => {
    resolveWith(0, 0, 0);
    await act(async () => render(<WebManagerProfileSection />));
    expect(screen.getByText('Refugios')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes de adopción')).toBeInTheDocument();
    expect(screen.getByText('Campañas')).toBeInTheDocument();
    expect(screen.getByText('Nueva campaña')).toBeInTheDocument();
  });

  it('makes exactly 3 API calls on mount', async () => {
    resolveWith(0, 0, 0);
    await act(async () => render(<WebManagerProfileSection />));
    expect(mockGet).toHaveBeenCalledTimes(3);
  });
});
