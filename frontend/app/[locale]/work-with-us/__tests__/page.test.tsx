import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  Camera: () => <span data-testid="icon-camera" />,
  Heart: () => <span data-testid="icon-heart" />,
  Truck: () => <span data-testid="icon-truck" />,
  Stethoscope: () => <span data-testid="icon-stethoscope" />,
  Share2: () => <span data-testid="icon-share2" />,
  CalendarCheck: () => <span data-testid="icon-calendarcheck" />,
  Home: () => <span data-testid="icon-home" />,
  HandCoins: () => <span data-testid="icon-handcoins" />,
  ArrowRight: () => <span data-testid="icon-arrowright" />,
}));

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

import { api } from '@/lib/services/http';
import WorkWithUsPage from '../page';

const mockApi = api as jest.Mocked<typeof api>;

const mockPosition = {
  id: 1,
  title: 'Voluntario Fotógrafo',
  description: 'Toma fotos de animales para adopción.',
  category: 'photographer',
  requirements: 'Cámara propia',
};

const mockAlly = {
  id: 1,
  name: 'Entre Especies',
  description: 'Veterinaria aliada',
  logo_url: null,
  ally_type: 'veterinary',
  website: null,
};

describe('WorkWithUsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    render(<WorkWithUsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trabaja con Nosotros');
  });

  it('shows loading skeletons initially', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    render(<WorkWithUsPage />);
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument();
  });

  it('renders volunteer positions after fetch', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [mockPosition] })
      .mockResolvedValueOnce({ data: [] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.getByText('Voluntario Fotógrafo')).toBeInTheDocument();
    });
  });

  it('shows "no positions" text when empty positions returned', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay posiciones disponibles en este momento.')).toBeInTheDocument();
    });
  });

  it('renders allies section heading when allies exist', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [mockAlly] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.getByText('Aliados Estratégicos')).toBeInTheDocument();
    });
  });

  it('renders ally name inside allies section', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [mockAlly] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.getByText('Entre Especies')).toBeInTheDocument();
    });
  });

  it('does not render allies section when allies list is empty', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.queryByText('Ver todos los aliados')).not.toBeInTheDocument();
    });
  });

  it('renders position requirements when present', async () => {
    mockApi.get
      .mockResolvedValueOnce({ data: [mockPosition] })
      .mockResolvedValueOnce({ data: [] });
    render(<WorkWithUsPage />);
    await waitFor(() => {
      expect(screen.getByText('Cámara propia')).toBeInTheDocument();
    });
  });
});
