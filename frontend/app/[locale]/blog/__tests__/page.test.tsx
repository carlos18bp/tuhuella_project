import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

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
});
