import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AdminBlogListPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';
import { mockBlogPosts } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/stores/blogStore', () => ({
  useBlogStore: jest.fn(),
}));

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

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
    const { container } = render(<AdminBlogListPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
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
});
