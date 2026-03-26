import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  ExternalLink: () => <span data-testid="icon-externallink" />,
}));

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

import { api } from '@/lib/services/http';
import StrategicAlliesPage from '../page';

const mockApi = api as jest.Mocked<typeof api>;

const allyWithLogo = {
  id: 1,
  name: 'Clínica Paws',
  description: 'Atención veterinaria integral.',
  logo_url: 'https://example.com/logo.png',
  ally_type: 'veterinary',
  website: 'https://clinicapaws.co',
};

const allyWithoutLogo = {
  id: 2,
  name: 'Zoonosis Bogotá',
  description: null,
  logo_url: null,
  ally_type: 'government',
  website: null,
};

describe('StrategicAlliesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    render(<StrategicAlliesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aliados Estratégicos');
  });

  it('shows loading skeletons initially', () => {
    mockApi.get.mockReturnValue(new Promise(() => {}));
    render(<StrategicAlliesPage />);
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument();
  });

  it('renders allies after fetch', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [allyWithLogo] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      expect(screen.getByText('Clínica Paws')).toBeInTheDocument();
    });
  });

  it('shows "no allies" message when empty', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay aliados registrados en este momento.')).toBeInTheDocument();
    });
  });

  it('renders ally logo img when logo_url is present', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [allyWithLogo] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'Clínica Paws' });
      expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
    });
  });

  it('renders ally initial when logo_url is absent', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [allyWithoutLogo] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      expect(screen.getByText('Z')).toBeInTheDocument();
    });
  });

  it('renders website link when ally has website', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [allyWithLogo] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Visitar sitio web/ })).toHaveAttribute('href', 'https://clinicapaws.co');
    });
  });

  it('does not render website link when ally has no website', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [allyWithoutLogo] });
    render(<StrategicAlliesPage />);
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Visitar sitio web/ })).not.toBeInTheDocument();
    });
  });
});
