import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <svg {...props} />,
}));
jest.mock('@/lib/services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import ShelterUpdateCreatePage from '../page';
import { api } from '@/lib/services/http';

const mockApiGet = api.get as jest.Mock;
const mockApiPost = api.post as jest.Mock;

const SHELTER_DATA = [{ id: 1, name: 'Test Shelter' }];
const CAMPAIGNS_DATA = { results: [{ id: 1, title: 'Campaign 1' }] };
const ANIMALS_DATA = { results: [{ id: 1, name: 'Rex' }] };

function setupDataMocks() {
  let callCount = 0;
  mockApiGet.mockImplementation(() => {
    callCount += 1;
    if (callCount === 1) return Promise.resolve({ data: SHELTER_DATA });
    if (callCount === 2) return Promise.resolve({ data: CAMPAIGNS_DATA });
    return Promise.resolve({ data: ANIMALS_DATA });
  });
}

describe('ShelterUpdateCreatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Return pending promise so data-fetch effects don't resolve during tests
    mockApiGet.mockReturnValue(new Promise(() => {}));
  });

  it('renders page title', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Publicar actualización');
  });

  it('renders Spanish title field', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Título (Español)')).toBeInTheDocument();
  });

  it('renders English title field', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Título (Inglés)')).toBeInTheDocument();
  });

  it('renders Spanish content field', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Contenido (Español)')).toBeInTheDocument();
  });

  it('renders English content field', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Contenido (Inglés)')).toBeInTheDocument();
  });

  it('renders campaign selector', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Campaña relacionada')).toBeInTheDocument();
  });

  it('renders animal selector', () => {
    render(<ShelterUpdateCreatePage />);
    expect(screen.getByText('Animal relacionado')).toBeInTheDocument();
  });

  it('submit button is disabled when required fields are empty', () => {
    render(<ShelterUpdateCreatePage />);
    const submitButton = screen.getByRole('button', { name: 'Publicar actualización' });
    expect(submitButton).toBeDisabled();
  });

  it('loads shelter data on mount and populates state', async () => {
    setupDataMocks();
    render(<ShelterUpdateCreatePage />);
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(3);
    });
    expect(mockApiGet).toHaveBeenNthCalledWith(1, expect.stringContaining('/shelters'), expect.anything());
    expect(mockApiGet).toHaveBeenNthCalledWith(2, expect.stringContaining('/campaigns'), expect.anything());
    expect(mockApiGet).toHaveBeenNthCalledWith(3, expect.stringContaining('/animals'), expect.anything());
  });

  it('renders campaign options after data loads', async () => {
    setupDataMocks();
    render(<ShelterUpdateCreatePage />);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Campaign 1' })).toBeInTheDocument();
    });
  });

  it('renders animal options after data loads', async () => {
    setupDataMocks();
    render(<ShelterUpdateCreatePage />);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Rex' })).toBeInTheDocument();
    });
  });

  it('submit button becomes enabled when required fields are filled', async () => {
    setupDataMocks();
    const user = userEvent.setup();
    render(<ShelterUpdateCreatePage />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(3);
    });

    // inputs[0] = title_es (required), inputs[1] = title_en (optional)
    const titleEsInput = screen.getAllByRole('textbox').filter((el) => el.tagName === 'INPUT')[0];
    await user.type(titleEsInput, 'Mi título');

    // textareas[0] = content_es (required), textareas[1] = content_en (optional)
    const contentEsTextarea = screen.getAllByRole('textbox').filter((el) => el.tagName === 'TEXTAREA')[0];
    await user.type(contentEsTextarea, 'Contenido de prueba');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Publicar actualización' })).not.toBeDisabled();
    });
  });

  it('calls api.post with correct payload on form submission', async () => {
    setupDataMocks();
    mockApiPost.mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<ShelterUpdateCreatePage />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(3);
    });

    const titleEsInput = screen.getAllByRole('textbox').filter((el) => el.tagName === 'INPUT')[0];
    await user.type(titleEsInput, 'Mi título');

    const contentEsTextarea = screen.getAllByRole('textbox').filter((el) => el.tagName === 'TEXTAREA')[0];
    await user.type(contentEsTextarea, 'Contenido de prueba');

    const submitButton = screen.getByRole('button', { name: 'Publicar actualización' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        expect.stringContaining('/updates/create'),
        expect.objectContaining({
          shelter: 1,
          title_es: 'Mi título',
          content_es: 'Contenido de prueba',
        })
      );
    });
  });

  it('shows error message on submission failure', async () => {
    setupDataMocks();
    mockApiPost.mockRejectedValue({
      response: { data: { detail: 'Error del servidor' } },
    });
    const user = userEvent.setup();
    render(<ShelterUpdateCreatePage />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(3);
    });

    const titleEsInput = screen.getAllByRole('textbox').filter((el) => el.tagName === 'INPUT')[0];
    await user.type(titleEsInput, 'Mi título');

    const contentEsTextarea = screen.getAllByRole('textbox').filter((el) => el.tagName === 'TEXTAREA')[0];
    await user.type(contentEsTextarea, 'Contenido de prueba');

    const submitButton = screen.getByRole('button', { name: 'Publicar actualización' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    });
  });
});
