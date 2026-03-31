import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BlogListingPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';
import { mockBlogPosts } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    posts: [],
    pagination: { count: 0, page: 1, pageSize: 6, totalPages: 1 },
    loading: false,
    error: null,
    fetchPosts: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseBlogStore.mockImplementation((selectorOrUndef?: unknown) => {
    if (typeof selectorOrUndef === 'function') return selectorOrUndef(state);
    return state;
  });
  return state;
};

describe('BlogListingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<BlogListingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog Mi Huella');
  });

  it('renders loading spinner when loading', () => {
    setupMock({ loading: true });
    render(<BlogListingPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error message when error occurs', () => {
    setupMock({ error: 'Error de red' });
    render(<BlogListingPage />);
    expect(screen.getByText('Error de red')).toBeInTheDocument();
  });

  it('renders empty state when no posts match', () => {
    setupMock({ posts: [], loading: false });
    render(<BlogListingPage />);
    expect(screen.getByText('No se encontraron artículos.')).toBeInTheDocument();
  });

  it('renders blog post cards when posts are loaded', () => {
    setupMock({ posts: mockBlogPosts, loading: false });
    render(<BlogListingPage />);
    expect(screen.getByText('Cuidados básicos para tu mascota')).toBeInTheDocument();
  });

  it('renders featured post when available', () => {
    setupMock({ posts: mockBlogPosts, loading: false });
    render(<BlogListingPage />);
    expect(screen.getByText(/Guía de adopción responsable/)).toBeInTheDocument();
  });

  it('calls fetchPosts on mount', async () => {
    const state = setupMock();
    render(<BlogListingPage />);
    await waitFor(() => {
      expect(state.fetchPosts).toHaveBeenCalled();
    });
  });

  it('renders category filter buttons', () => {
    setupMock();
    render(<BlogListingPage />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Adopción')).toBeInTheDocument();
    expect(screen.getByText('Cuidado Animal')).toBeInTheDocument();
  });

  it('renders search input', () => {
    setupMock();
    render(<BlogListingPage />);
    expect(screen.getByPlaceholderText('Buscar artículos...')).toBeInTheDocument();
  });

  it('calls fetchPosts with category when a category button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();
    const state = setupMock();
    render(<BlogListingPage />);

    await user.click(screen.getByText('Adopción'));

    jest.advanceTimersByTime(0);
    await waitFor(() => {
      const calls = (state.fetchPosts as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toMatchObject({ category: 'adopcion' });
    });

    jest.useRealTimers();
  });

  it('calls fetchPosts with search term after typing in search input', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.useFakeTimers();
    const state = setupMock();
    render(<BlogListingPage />);

    await user.type(screen.getByPlaceholderText('Buscar artículos...'), 'gato');

    jest.advanceTimersByTime(300);
    await waitFor(() => {
      const calls = (state.fetchPosts as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toMatchObject({ search: 'gato' });
    });

    jest.useRealTimers();
  });

  it('renders pagination when totalPages is greater than 1', () => {
    setupMock({
      posts: mockBlogPosts,
      pagination: { count: 14, page: 1, pageSize: 7, totalPages: 2 },
    });
    render(<BlogListingPage />);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    setupMock({
      posts: mockBlogPosts,
      pagination: { count: 14, page: 1, pageSize: 7, totalPages: 2 },
    });
    render(<BlogListingPage />);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    setupMock({
      posts: mockBlogPosts,
      pagination: { count: 14, page: 2, pageSize: 7, totalPages: 2 },
    });
    render(<BlogListingPage />);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('calls fetchPosts for next page when next button is clicked', async () => {
    const user = userEvent.setup();
    const state = setupMock({
      posts: mockBlogPosts,
      pagination: { count: 14, page: 1, pageSize: 7, totalPages: 2 },
    });
    render(<BlogListingPage />);

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(state.fetchPosts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('renders PostCard without cover image when cover_image is falsy', () => {
    const featuredPost = mockBlogPosts[0]; // is_featured: true -> becomes hero
    const noCoverPost = { ...mockBlogPosts[1], cover_image: '', id: 99 };
    setupMock({ posts: [featuredPost, noCoverPost], loading: false });
    render(<BlogListingPage />);
    const cards = screen.getAllByTestId('post-card');
    expect(within(cards[0]).queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not render pagination when totalPages is 1', () => {
    setupMock({
      posts: mockBlogPosts,
      pagination: { count: 2, page: 1, pageSize: 7, totalPages: 1 },
    });
    render(<BlogListingPage />);
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
  });
});
