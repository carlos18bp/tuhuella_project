import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <svg {...props} />,
  Trash2: (props: any) => <svg data-testid="trash-icon" {...props} />,
}));
jest.mock('@/lib/services/http', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

import ShelterUpdatesPage from '../page';
import { api } from '@/lib/services/http';

const mockApiGet = api.get as jest.Mock;

const mockUpdates = [
  {
    id: 1,
    title: 'Actualización de salud de Rex',
    shelter: 1,
    shelter_name: 'Patitas Felices',
    campaign: null,
    animal: null,
    image_url: null,
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Nuevo animal rescatado',
    shelter: 1,
    shelter_name: 'Patitas Felices',
    campaign: 1,
    animal: 2,
    image_url: null,
    created_at: '2026-03-20T14:00:00Z',
  },
];

describe('ShelterUpdatesPage — initial render', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate pending promise so loading state persists for these tests
    mockApiGet.mockReturnValue(new Promise(() => {}));
  });

  it('renders page title', () => {
    render(<ShelterUpdatesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis actualizaciones');
  });

  it('renders create new update link', () => {
    render(<ShelterUpdatesPage />);
    expect(screen.getByText(/Nueva actualización/)).toBeInTheDocument();
  });

  it('shows loading skeletons initially', () => {
    render(<ShelterUpdatesPage />);
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument();
  });
});

describe('ShelterUpdatesPage — after fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: mockUpdates });
  });

  it('renders updates after fetch', async () => {
    render(<ShelterUpdatesPage />);
    await waitFor(() => {
      expect(screen.getByText('Actualización de salud de Rex')).toBeInTheDocument();
    });
  });

  it('renders second update title after fetch', async () => {
    render(<ShelterUpdatesPage />);
    await waitFor(() => {
      expect(screen.getByText('Nuevo animal rescatado')).toBeInTheDocument();
    });
  });

  it('renders delete buttons for each update', async () => {
    render(<ShelterUpdatesPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId('trash-icon').length).toBe(2);
    });
  });

});

describe('ShelterUpdatesPage — image and empty states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders update with image when image_url is provided', async () => {
    const updateWithImage = { ...mockUpdates[0], image_url: 'http://example.com/photo.jpg' };
    mockApiGet
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: [updateWithImage] });
    render(<ShelterUpdatesPage />);
    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'Actualización de salud de Rex' });
      expect(img).toHaveAttribute('src', 'http://example.com/photo.jpg');
    });
  });

  it('renders no-updates message when shelter has no updates', async () => {
    mockApiGet
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: [] });
    render(<ShelterUpdatesPage />);
    await waitFor(() => {
      expect(screen.getByText('No has publicado actualizaciones aún.')).toBeInTheDocument();
    });
  });
});
