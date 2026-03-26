import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdminBlogListPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';
import { mockBlogPosts } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

// A post scheduled in the future (not yet published)
const scheduledPost = {
  id: 99,
  title: 'Post Programado',
  slug: 'post-programado',
  is_published: false,
  published_at: '2099-01-01T10:00:00Z',
  created_at: '2026-03-01T08:00:00Z',
};

// A draft post (not published, no future date)
const draftPost = {
  id: 98,
  title: 'Post Borrador',
  slug: 'post-borrador',
  is_published: false,
  published_at: null,
  created_at: '2026-03-01T08:00:00Z',
};

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    posts: [],
    adminPagination: { count: 0, page: 1, pageSize: 15, totalPages: 1 },
    loading: false,
    fetchAdminPosts: jest.fn(),
    deletePost: jest.fn(),
    duplicatePost: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseBlogStore.mockImplementation((selectorOrUndef?: unknown) => {
    if (typeof selectorOrUndef === 'function') return selectorOrUndef(state);
    return state;
  });
  return state;
};

describe('AdminBlogListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<AdminBlogListPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog Posts');
  });

  it('renders loading spinner when loading', () => {
    setupMock({ loading: true });
    render(<AdminBlogListPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders empty state when no posts exist', () => {
    setupMock({ posts: [], loading: false });
    render(<AdminBlogListPage />);
    expect(screen.getByText(/No hay posts aún/)).toBeInTheDocument();
  });

  it('renders post titles when posts are loaded', () => {
    setupMock({ posts: mockBlogPosts, loading: false });
    render(<AdminBlogListPage />);
    expect(screen.getAllByText('Guía de adopción responsable').length).toBeGreaterThan(0);
  });

  it('calls fetchAdminPosts on mount', () => {
    const state = setupMock();
    render(<AdminBlogListPage />);
    expect(state.fetchAdminPosts).toHaveBeenCalled();
  });

  it('renders Nuevo Post link', () => {
    setupMock();
    render(<AdminBlogListPage />);
    expect(screen.getByText('Nuevo Post')).toBeInTheDocument();
  });

  it('renders Calendario link', () => {
    setupMock();
    render(<AdminBlogListPage />);
    expect(screen.getByText('Calendario')).toBeInTheDocument();
  });

  it('renders "Borrador" status badge for draft post', () => {
    setupMock({ posts: [draftPost], loading: false });
    render(<AdminBlogListPage />);
    expect(screen.getAllByText('Borrador').length).toBeGreaterThan(0);
  });

  it('renders "Programado" status badge for scheduled post', () => {
    setupMock({ posts: [scheduledPost], loading: false });
    render(<AdminBlogListPage />);
    expect(screen.getAllByText(/Programado/).length).toBeGreaterThan(0);
  });

  it('renders "Publicado" status badge for published post', () => {
    setupMock({ posts: [mockBlogPosts[0]], loading: false });
    render(<AdminBlogListPage />);
    expect(screen.getAllByText('Publicado').length).toBeGreaterThan(0);
  });

  it('opens delete confirm modal and calls deletePost on confirm', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    const mockFetch = jest.fn().mockResolvedValue(undefined);
    setupMock({ posts: [mockBlogPosts[0]], loading: false, deletePost: mockDelete, fetchAdminPosts: mockFetch });
    render(<AdminBlogListPage />);

    // Click the first "Eliminar" button to trigger the modal
    const deleteButtons = screen.getAllByText('Eliminar');
    await userEvent.click(deleteButtons[0]);

    // Modal should be open showing the confirm heading
    await waitFor(() => {
      expect(screen.getByText('Eliminar post')).toBeInTheDocument();
    });

    // Find the confirm button inside the modal dialog
    const modal = screen.getByRole('dialog');
    const confirmBtn = within(modal).getByRole('button', { name: 'Eliminar' });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(mockBlogPosts[0].id);
    });
  });

  it('opens duplicate confirm modal and calls duplicatePost on confirm', async () => {
    const mockDuplicate = jest.fn().mockResolvedValue(undefined);
    const mockFetch = jest.fn().mockResolvedValue(undefined);
    setupMock({ posts: [mockBlogPosts[0]], loading: false, duplicatePost: mockDuplicate, fetchAdminPosts: mockFetch });
    render(<AdminBlogListPage />);

    const duplicateButtons = screen.getAllByText('Duplicar');
    await userEvent.click(duplicateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Duplicar post')).toBeInTheDocument();
    });

    // Find the confirm button inside the modal dialog
    const modal = screen.getByRole('dialog');
    const confirmBtn = within(modal).getByRole('button', { name: 'Duplicar' });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDuplicate).toHaveBeenCalledWith(mockBlogPosts[0].id);
    });
  });

  it('closes confirm modal when Cancelar is clicked', async () => {
    setupMock({ posts: [mockBlogPosts[0]], loading: false });
    render(<AdminBlogListPage />);

    const deleteButtons = screen.getAllByText('Eliminar');
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText('Eliminar post')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Eliminar post')).not.toBeInTheDocument();
  });

  it('renders pagination when totalPages > 1', () => {
    setupMock({
      posts: mockBlogPosts,
      loading: false,
      adminPagination: { count: 30, page: 1, pageSize: 15, totalPages: 2 },
    });
    render(<AdminBlogListPage />);
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeInTheDocument();
  });

  it('navigates to next page when Siguiente is clicked', async () => {
    const state = setupMock({
      posts: mockBlogPosts,
      loading: false,
      adminPagination: { count: 30, page: 1, pageSize: 15, totalPages: 2 },
    });
    render(<AdminBlogListPage />);
    const nextBtn = screen.getByRole('button', { name: /Siguiente/ });
    await userEvent.click(nextBtn);
    expect(state.fetchAdminPosts).toHaveBeenCalledWith(2);
  });

  it('does not navigate past the last page', async () => {
    const state = setupMock({
      posts: mockBlogPosts,
      loading: false,
      adminPagination: { count: 30, page: 2, pageSize: 15, totalPages: 2 },
    });
    render(<AdminBlogListPage />);
    const nextBtn = screen.getByRole('button', { name: /Siguiente/ });
    expect(nextBtn).toBeDisabled();
    // Attempting direct call — button is disabled, click won't fire handler
    expect(state.fetchAdminPosts).toHaveBeenCalledTimes(1); // only initial load
  });

  it('does not navigate before the first page', async () => {
    const state = setupMock({
      posts: mockBlogPosts,
      loading: false,
      adminPagination: { count: 30, page: 1, pageSize: 15, totalPages: 2 },
    });
    render(<AdminBlogListPage />);
    const prevBtn = screen.getByRole('button', { name: /Anterior/ });
    expect(prevBtn).toBeDisabled();
    expect(state.fetchAdminPosts).toHaveBeenCalledTimes(1); // only initial load
  });
});
