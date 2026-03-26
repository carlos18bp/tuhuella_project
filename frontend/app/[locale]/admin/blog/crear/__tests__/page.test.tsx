import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/stores/blogStore', () => ({ useBlogStore: jest.fn() }));

import AdminBlogCreatePage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

function setupMock() {
  const state = {
    createPost: jest.fn(),
    createPostFromJSON: jest.fn(),
    fetchJsonTemplate: jest.fn(),
  };
  mockUseBlogStore.mockReturnValue(state);
  return state;
}

describe('AdminBlogCreatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Nuevo Blog Post" heading', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nuevo Blog Post');
  });

  it('renders Manual mode tab button', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByRole('button', { name: 'Manual' })).toBeInTheDocument();
  });

  it('renders JSON import mode tab button', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByRole('button', { name: 'Importar JSON' })).toBeInTheDocument();
  });

  it('renders Spanish title field in manual mode', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByLabelText('Título (ES)')).toBeInTheDocument();
  });

  it('renders English title field in manual mode', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument();
  });

  it('renders cancel link', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('renders create post submit button in manual mode', () => {
    setupMock();
    render(<AdminBlogCreatePage />);
    expect(screen.getByRole('button', { name: 'Crear Post' })).toBeInTheDocument();
  });

  it('calls createPost with form data when manual form is submitted', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.createPost.mockResolvedValue({ id: 42 });

    render(<AdminBlogCreatePage />);

    await user.type(screen.getByLabelText('Título (ES)'), 'Mi título en español');
    await user.type(screen.getByLabelText('Title (EN)'), 'My English title');
    await user.type(screen.getByLabelText('Resumen (ES)'), 'Resumen breve');
    await user.type(screen.getByLabelText('Excerpt (EN)'), 'Brief summary');

    await user.click(screen.getByRole('button', { name: 'Crear Post' }));

    await waitFor(() => {
      expect(state.createPost).toHaveBeenCalledTimes(1);
    });

    const callArg = state.createPost.mock.calls[0][0];
    expect(callArg.title_es).toBe('Mi título en español');
    expect(callArg.title_en).toBe('My English title');
  });

  it('shows error message when createPost throws', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.createPost.mockRejectedValue(new Error('Server error'));

    render(<AdminBlogCreatePage />);

    await user.type(screen.getByLabelText('Título (ES)'), 'Título');
    await user.type(screen.getByLabelText('Title (EN)'), 'Title');
    await user.type(screen.getByLabelText('Resumen (ES)'), 'Resumen');
    await user.type(screen.getByLabelText('Excerpt (EN)'), 'Summary');

    await user.click(screen.getByRole('button', { name: 'Crear Post' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('switches to JSON mode when "Importar JSON" tab is clicked', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogCreatePage />);

    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));

    expect(screen.getByRole('button', { name: 'Crear desde JSON' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Título (ES)')).not.toBeInTheDocument();
  });

  it('calls createPostFromJSON when JSON form is submitted with valid JSON', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.createPostFromJSON.mockResolvedValue({ id: 99 });

    render(<AdminBlogCreatePage />);

    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));

    const jsonPayload = JSON.stringify({ title_es: 'Desde JSON', title_en: 'From JSON' });
    const textarea = screen.getByPlaceholderText(/title_es/);
    fireEvent.change(textarea, { target: { value: jsonPayload } });

    await user.click(screen.getByRole('button', { name: 'Crear desde JSON' }));

    await waitFor(() => {
      expect(state.createPostFromJSON).toHaveBeenCalledTimes(1);
    });

    expect(state.createPostFromJSON.mock.calls[0][0]).toEqual({
      title_es: 'Desde JSON',
      title_en: 'From JSON',
    });
  });

  it('shows JSON parse error when invalid JSON is submitted', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogCreatePage />);

    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));

    const textarea = screen.getByPlaceholderText(/title_es/);
    fireEvent.change(textarea, { target: { value: 'not: valid: json: at: all' } });

    await user.click(screen.getByRole('button', { name: 'Crear desde JSON' }));

    await waitFor(() => {
      expect(screen.getByText('JSON inválido. Revisa el formato.')).toBeInTheDocument();
    });
  });

  it('calls fetchJsonTemplate when download template button is clicked', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.fetchJsonTemplate.mockResolvedValue({ title_es: '' });

    // Mock browser APIs used inside handleDownloadTemplate
    const createObjectURL = jest.fn(() => 'blob:mock-url');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(window, 'URL', {
      value: { createObjectURL, revokeObjectURL },
      writable: true,
    });

    render(<AdminBlogCreatePage />);

    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));
    await user.click(screen.getByRole('button', { name: '↓ Descargar template' }));

    await waitFor(() => {
      expect(state.fetchJsonTemplate).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when fetchJsonTemplate throws during download', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.fetchJsonTemplate.mockRejectedValue(new Error('Network error'));

    render(<AdminBlogCreatePage />);

    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));
    await user.click(screen.getByRole('button', { name: '↓ Descargar template' }));

    await waitFor(() => {
      expect(screen.getByText('Error al descargar template')).toBeInTheDocument();
    });
  });

  it('updates title_es field value when user types', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogCreatePage />);

    const input = screen.getByLabelText('Título (ES)') as HTMLInputElement;
    await user.type(input, 'Nuevo título');

    expect(input.value).toBe('Nuevo título');
  });
});
