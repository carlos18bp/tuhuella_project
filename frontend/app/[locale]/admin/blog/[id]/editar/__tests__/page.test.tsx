import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

jest.mock('@/lib/stores/blogStore', () => ({ useBlogStore: jest.fn() }));

import AdminBlogEditPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const mockAdminPost = {
  id: 1,
  title_es: 'Test Post',
  title_en: 'Test Post EN',
  slug: 'test-post',
  category: 'adopcion',
  author: 'tuhuella-team',
  content_es: '',
  content_en: '',
  excerpt_es: '',
  excerpt_en: '',
  read_time_minutes: 5,
  is_published: true,
  is_featured: false,
  content_json_es: {},
  content_json_en: {},
  cover_image_display: null,
  cover_image_url: '',
  cover_image_credit: '',
  cover_image_credit_url: '',
  meta_title_es: '',
  meta_title_en: '',
  meta_description_es: '',
  meta_description_en: '',
  meta_keywords_es: '',
  meta_keywords_en: '',
  sources: [],
};

function setupMock(overrides: Record<string, unknown> = {}) {
  const state = {
    adminPost: mockAdminPost,
    loading: false,
    fetchAdminPost: jest.fn(),
    updatePost: jest.fn(),
    uploadCoverImage: jest.fn(),
    ...overrides,
  };
  // The component destructures directly (not via selector), so mock as plain return
  mockUseBlogStore.mockReturnValue(state);
  return state;
}

describe('AdminBlogEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Editar Post" heading', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Editar Post');
  });

  it('renders form field for title in Spanish', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByLabelText('Título (ES)')).toBeInTheDocument();
  });

  it('renders form field for title in English', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByLabelText('Title (EN)')).toBeInTheDocument();
  });

  it('renders slug field in metadata section', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
  });

  it('renders save button', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  it('renders cancel link', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('shows loading spinner when loading=true and adminPost=null', () => {
    setupMock({ adminPost: null, loading: true });
    render(<AdminBlogEditPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows "Post no encontrado" when no post and not loading', () => {
    setupMock({ adminPost: null, loading: false });
    render(<AdminBlogEditPage />);
    expect(screen.getByText(/Post no encontrado/)).toBeInTheDocument();
  });

  it('updates title_es field value when user types', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogEditPage />);

    const input = screen.getByLabelText('Título (ES)') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Nuevo título editado');

    expect(input.value).toBe('Nuevo título editado');
  });

  it('calls updatePost with post data when save button is clicked', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.updatePost.mockResolvedValue({});

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(state.updatePost).toHaveBeenCalledTimes(1);
    });

    expect(state.updatePost.mock.calls[0][0]).toBe(1);
  });

  it('shows success message after successful save', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.updatePost.mockResolvedValue({});

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Post guardado correctamente.')).toBeInTheDocument();
    });
  });

  it('shows error message when updatePost throws', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.updatePost.mockRejectedValue(new Error('Update failed'));

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('calls uploadCoverImage when a file is selected via file input', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.uploadCoverImage.mockResolvedValue({});

    render(<AdminBlogEditPage />);

    const file = new File(['(image content)'], 'cover.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('Subir imagen') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(state.uploadCoverImage).toHaveBeenCalledTimes(1);
    });

    expect(state.uploadCoverImage.mock.calls[0][0]).toBe(1);
    expect(state.uploadCoverImage.mock.calls[0][1]).toBe(file);
  });

  it('shows error message when uploadCoverImage throws', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.uploadCoverImage.mockRejectedValue(new Error('Upload error'));

    render(<AdminBlogEditPage />);

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Subir imagen') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Upload error')).toBeInTheDocument();
    });
  });

  it('switches to JSON Content tab when clicked', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'JSON Content' }));

    expect(screen.getByText('Contenido JSON (ES)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Título (ES)')).not.toBeInTheDocument();
  });

  it('switches back to Campos tab from JSON tab', async () => {
    const user = userEvent.setup();
    setupMock();

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'JSON Content' }));
    await user.click(screen.getByRole('button', { name: 'Campos' }));

    expect(screen.getByLabelText('Título (ES)')).toBeInTheDocument();
  });

  it('calls updatePost with parsed JSON content when saving in JSON tab', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.updatePost.mockResolvedValue({});

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'JSON Content' }));

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(state.updatePost).toHaveBeenCalledTimes(1);
    });
  });

  it('shows JSON parse error when saving invalid JSON content in JSON tab', async () => {
    const user = userEvent.setup();
    const state = setupMock();

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'JSON Content' }));

    // Get the first JSON textarea (ES content) and replace with invalid JSON
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    // Find the one in the JSON fieldset (the first one visible in json tab)
    const jsonEsTextarea = textareas[0];
    fireEvent.change(jsonEsTextarea, { target: { value: 'not: valid: json: content' } });

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('JSON inválido. Revisa el formato.')).toBeInTheDocument();
    });

    expect(state.updatePost).not.toHaveBeenCalled();
  });

  it('populates form fields with adminPost data on mount', () => {
    setupMock();
    render(<AdminBlogEditPage />);

    const titleEs = screen.getByLabelText('Título (ES)') as HTMLInputElement;
    expect(titleEs.value).toBe('Test Post');

    const titleEn = screen.getByLabelText('Title (EN)') as HTMLInputElement;
    expect(titleEn.value).toBe('Test Post EN');
  });

  it('calls fetchAdminPost on mount with the post id', () => {
    const state = setupMock();
    render(<AdminBlogEditPage />);
    expect(state.fetchAdminPost).toHaveBeenCalledWith(1);
  });
});
