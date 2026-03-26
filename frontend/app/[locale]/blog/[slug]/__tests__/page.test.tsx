import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({ useParams: () => ({ slug: 'test-post' }) }));
jest.mock('@/components/blog/BlogContentRenderer', () => ({
  __esModule: true,
  default: () => <div data-testid="blog-content" />,
}));
jest.mock('@/components/blog/ReadingProgressBar', () => ({
  __esModule: true,
  default: () => <div data-testid="reading-progress" />,
}));

jest.mock('@/lib/stores/blogStore', () => ({ useBlogStore: jest.fn() }));

import BlogDetailPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

const mockPost = {
  id: 1,
  title: 'Guía de adopción responsable',
  slug: 'test-post',
  author: 'tuhuella-team',
  category: 'adopcion',
  excerpt: 'Todo lo que necesitas saber para adoptar.',
  cover_image: null,
  cover_image_credit: '',
  cover_image_credit_url: '',
  read_time_minutes: 5,
  published_at: '2026-03-01T10:00:00Z',
  is_featured: true,
  is_published: true,
  content: '<p>Contenido</p>',
  content_json: {},
  sources: [],
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  updated_at: '2026-03-01T10:00:00Z',
  created_at: '2026-03-01T08:00:00Z',
};

function setupLoaded(overrides: Record<string, unknown> = {}) {
  const state = {
    post: mockPost,
    loading: false,
    error: null,
    fetchPost: jest.fn(),
    clearPost: jest.fn(),
    ...overrides,
  };
  mockUseBlogStore.mockReturnValue(state);
  return state;
}

describe('BlogDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post title when loaded', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Guía de adopción responsable'
    );
  });

  it('renders author name', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByText('Mi Huella Team')).toBeInTheDocument();
  });

  it('renders back to blog link', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('renders reading progress bar', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByTestId('reading-progress')).toBeInTheDocument();
  });

  it('renders blog content renderer', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByTestId('blog-content')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    setupLoaded({ loading: true, post: null });
    render(<BlogDetailPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    setupLoaded({ post: null, error: 'Error al cargar el artículo' });
    render(<BlogDetailPage />);
    expect(screen.getByText('Error al cargar el artículo')).toBeInTheDocument();
  });

  it('shows fallback message when post is null and no error', () => {
    setupLoaded({ post: null, error: null });
    render(<BlogDetailPage />);
    expect(screen.getByText('Artículo no encontrado.')).toBeInTheDocument();
  });

  it('renders "Ver todos los artículos" link when post is loaded', () => {
    setupLoaded();
    render(<BlogDetailPage />);
    expect(screen.getByText('Ver todos los artículos →')).toBeInTheDocument();
  });
});
