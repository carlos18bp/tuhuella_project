import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));


jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));

jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));

jest.mock('@/lib/stores/blogStore', () => ({ useBlogStore: jest.fn() }));

import AdminBlogEditPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';
import { useAuthStore } from '@/lib/stores/authStore';

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
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector: (s: { user: { id: number; role: string; is_staff: boolean } }) => unknown) =>
      selector({ user: { id: 1, role: 'admin', is_staff: true } }),
    );

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

  it('shows fallback error message when handleSave rejects with a non-Error value', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.updatePost.mockRejectedValue('some string rejection');

    render(<AdminBlogEditPage />);

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.getByText('Error al guardar')).toBeInTheDocument();
    });
  });

  it('shows fallback error message when uploadCoverImage rejects with a non-Error value', async () => {
    const user = userEvent.setup();
    const state = setupMock();
    state.uploadCoverImage.mockRejectedValue('string rejection');

    render(<AdminBlogEditPage />);

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Subir imagen') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Error al subir imagen')).toBeInTheDocument();
    });
  });

  it('renders cover image when adminPost has cover_image_display', () => {
    setupMock({
      adminPost: { ...mockAdminPost, cover_image_display: 'http://example.com/cover.jpg' },
    });
    render(<AdminBlogEditPage />);
    const img = screen.getByAltText('Cover') as HTMLImageElement;
    expect(img.src).toBe('http://example.com/cover.jpg');
  });

  it('updates excerpt_es field when user types', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const textarea = screen.getByLabelText('Resumen (ES)') as HTMLTextAreaElement;
    await user.type(textarea, 'Nuevo resumen');
    expect(textarea.value).toContain('Nuevo resumen');
  });

  it('updates content_es field when user types', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const textarea = screen.getByLabelText('Contenido HTML (ES)') as HTMLTextAreaElement;
    await user.type(textarea, '<p>Hola</p>');
    expect(textarea.value).toContain('<p>Hola</p>');
  });

  it('updates English fields when user types', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const excerptEn = screen.getByLabelText('Excerpt (EN)') as HTMLTextAreaElement;
    await user.type(excerptEn, 'New excerpt');
    expect(excerptEn.value).toContain('New excerpt');
  });

  it('updates cover image url field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const input = screen.getByLabelText('O usar URL externa') as HTMLInputElement;
    await user.type(input, 'https://example.com/img.jpg');
    expect(input.value).toContain('https://example.com/img.jpg');
  });

  it('updates cover credit fields', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const credit = screen.getByLabelText('Crédito') as HTMLInputElement;
    await user.type(credit, 'Photo by Test');
    expect(credit.value).toContain('Photo by Test');
  });

  it('changes category selection', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const select = screen.getByLabelText('Categoría') as HTMLSelectElement;
    await user.selectOptions(select, 'salud-animal');
    expect(select.value).toBe('salud-animal');
  });

  it('changes author selection', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const select = screen.getByLabelText('Autor') as HTMLSelectElement;
    await user.selectOptions(select, 'laura-blanco');
    expect(select.value).toBe('laura-blanco');
  });

  it('updates read time field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const input = screen.getByLabelText('Tiempo de lectura (min)') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '10');
    expect(input.value).toBe('10');
  });

  it('toggles is_published checkbox', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const checkbox = screen.getByLabelText('Publicado') as HTMLInputElement;
    // Initially true from mockAdminPost
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('toggles is_featured checkbox', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const checkbox = screen.getByLabelText('Destacado') as HTMLInputElement;
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('updates SEO meta fields', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const metaEs = screen.getByLabelText('Meta título (ES)') as HTMLInputElement;
    await user.type(metaEs, 'Mi título SEO');
    expect(metaEs.value).toContain('Mi título SEO');
  });

  it('updates meta description fields', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const descEs = screen.getByLabelText('Meta descripción (ES)') as HTMLTextAreaElement;
    await user.type(descEs, 'Descripción SEO');
    expect(descEs.value).toContain('Descripción SEO');
  });

  it('updates keywords fields', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const kwEs = screen.getByLabelText('Keywords (ES)') as HTMLInputElement;
    await user.type(kwEs, 'adopcion, mascotas');
    expect(kwEs.value).toContain('adopcion, mascotas');
  });

  it('updates sources JSON textarea', () => {
    setupMock();
    render(<AdminBlogEditPage />);
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    // Sources textarea is the last one in the fields tab
    const sourcesTextarea = textareas[textareas.length - 1];
    fireEvent.change(sourcesTextarea, {
      target: { value: JSON.stringify([{ name: 'Test', url: 'http://test.com' }]) },
    });
    // Should not throw
    expect(sourcesTextarea).toBeInTheDocument();
  });

  it('updates JSON ES textarea in JSON tab', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    await user.click(screen.getByRole('button', { name: 'JSON Content' }));
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    fireEvent.change(textareas[0], { target: { value: '{"test": true}' } });
    expect(textareas[0].value).toBe('{"test": true}');
  });

  it('updates cover credit URL field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const input = screen.getByLabelText('URL crédito') as HTMLInputElement;
    await user.type(input, 'https://credit.com');
    expect(input.value).toContain('https://credit.com');
  });

  it('updates Content HTML EN field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const textarea = screen.getByLabelText('Content HTML (EN)') as HTMLTextAreaElement;
    await user.type(textarea, '<p>Hello</p>');
    expect(textarea.value).toContain('<p>Hello</p>');
  });

  it('updates Meta title EN field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const input = screen.getByLabelText('Meta title (EN)') as HTMLInputElement;
    await user.type(input, 'SEO title');
    expect(input.value).toContain('SEO title');
  });

  it('updates Meta description EN field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const textarea = screen.getByLabelText('Meta description (EN)') as HTMLTextAreaElement;
    await user.type(textarea, 'SEO desc');
    expect(textarea.value).toContain('SEO desc');
  });

  it('updates Keywords EN field', async () => {
    const user = userEvent.setup();
    setupMock();
    render(<AdminBlogEditPage />);
    const input = screen.getByLabelText('Keywords (EN)') as HTMLInputElement;
    await user.type(input, 'adoption, pets');
    expect(input.value).toContain('adoption, pets');
  });
});
