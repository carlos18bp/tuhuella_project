import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useBlogStore } from '../blogStore';
import { api } from '../../services/http';
import { mockBlogPosts, mockBlogPostDetail, mockBlogPostAdmin } from '../../__tests__/fixtures';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const PAGINATED_RESPONSE = {
  results: mockBlogPosts,
  count: 2,
  page: 1,
  page_size: 6,
  total_pages: 1,
};

describe('blogStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBlogStore.setState({
      posts: [],
      post: null,
      adminPost: null,
      calendarPosts: [],
      pagination: { count: 0, page: 1, pageSize: 6, totalPages: 1 },
      adminPagination: { count: 0, page: 1, pageSize: 15, totalPages: 1 },
      loading: false,
      error: null,
    });
  });

  it('fetches public posts and stores them with pagination', async () => {
    mockApi.get.mockResolvedValueOnce({ data: PAGINATED_RESPONSE });

    await act(async () => {
      await useBlogStore.getState().fetchPosts({ page: 1 });
    });

    const state = useBlogStore.getState();
    expect(state.posts).toHaveLength(2);
    expect(state.posts[0].title).toBe('Guía de adopción responsable');
    expect(state.pagination.count).toBe(2);
    expect(state.pagination.totalPages).toBe(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error when fetchPosts fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useBlogStore.getState().fetchPosts();
    });

    const state = useBlogStore.getState();
    expect(state.posts).toHaveLength(0);
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });

  it('sets fallback error when fetchPosts rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useBlogStore.getState().fetchPosts();
    });

    expect(useBlogStore.getState().error).toBe('Failed to fetch blog posts');
  });

  it('fetches a single post detail by slug', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockBlogPostDetail });

    await act(async () => {
      await useBlogStore.getState().fetchPost('guia-de-adopcion-responsable', 'es');
    });

    const state = useBlogStore.getState();
    expect(state.post?.title).toBe('Guía de adopción responsable');
    expect(state.post?.content_json).toBeDefined();
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchPost fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Not found'));

    await act(async () => {
      await useBlogStore.getState().fetchPost('nonexistent');
    });

    expect(useBlogStore.getState().error).toBe('Not found');
    expect(useBlogStore.getState().post).toBeNull();
  });

  it('fetches admin posts list with pagination', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { ...PAGINATED_RESPONSE, page_size: 15 },
    });

    await act(async () => {
      await useBlogStore.getState().fetchAdminPosts(1, 15);
    });

    const state = useBlogStore.getState();
    expect(state.posts).toHaveLength(2);
    expect(state.adminPagination.pageSize).toBe(15);
    expect(state.loading).toBe(false);
  });

  it('fetches a single admin post by id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockBlogPostAdmin });

    await act(async () => {
      await useBlogStore.getState().fetchAdminPost(1);
    });

    expect(useBlogStore.getState().adminPost?.title_es).toBe('Guía de adopción responsable');
    expect(useBlogStore.getState().adminPost?.title_en).toBe('Responsible Adoption Guide');
  });

  it('creates a post via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockBlogPostAdmin });

    const result = await useBlogStore.getState().createPost({
      title_es: 'Nuevo post',
      title_en: 'New post',
    });

    expect(result.title_es).toBe('Guía de adopción responsable');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('updates a post via API', async () => {
    const updated = { ...mockBlogPostAdmin, title_es: 'Título actualizado' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    const result = await useBlogStore.getState().updatePost(1, { title_es: 'Título actualizado' });

    expect(result.title_es).toBe('Título actualizado');
    expect(mockApi.patch).toHaveBeenCalledTimes(1);
  });

  it('deletes a post via API', async () => {
    mockApi.delete.mockResolvedValueOnce({});

    await useBlogStore.getState().deletePost(1);

    expect(mockApi.delete).toHaveBeenCalledTimes(1);
  });

  it('duplicates a post via API', async () => {
    const duplicated = { ...mockBlogPostAdmin, id: 2, title_es: 'Guía de adopción responsable (copia)' };
    mockApi.post.mockResolvedValueOnce({ data: duplicated });

    const result = await useBlogStore.getState().duplicatePost(1);

    expect(result.id).toBe(2);
    expect(result.title_es).toContain('(copia)');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('creates a post from JSON via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockBlogPostAdmin });

    const result = await useBlogStore.getState().createPostFromJSON({
      title_es: 'Post JSON',
      title_en: 'JSON Post',
    });

    expect(result.id).toBe(1);
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('fetches calendar posts within date range', async () => {
    const calendarData = [
      { id: 1, title_es: 'Post 1', title_en: 'Post 1', slug: 'post-1', category: 'adopcion', is_published: true, published_at: '2026-03-15', created_at: '2026-03-15', calendar_status: 'published', date: '2026-03-15' },
    ];
    mockApi.get.mockResolvedValueOnce({ data: calendarData });

    await act(async () => {
      await useBlogStore.getState().fetchCalendarPosts('2026-03-01', '2026-03-31');
    });

    expect(useBlogStore.getState().calendarPosts).toHaveLength(1);
    expect(useBlogStore.getState().calendarPosts[0].calendar_status).toBe('published');
  });

  it('fetches JSON template via API', async () => {
    const template = { title_es: '', title_en: '', _available_categories: [] };
    mockApi.get.mockResolvedValueOnce({ data: template });

    const result = await useBlogStore.getState().fetchJsonTemplate();

    expect(result).toHaveProperty('title_es');
    expect(result).toHaveProperty('_available_categories');
  });

  it('clears post and adminPost', () => {
    useBlogStore.setState({
      post: mockBlogPostDetail,
      adminPost: mockBlogPostAdmin,
    });

    act(() => {
      useBlogStore.getState().clearPost();
    });

    expect(useBlogStore.getState().post).toBeNull();
    expect(useBlogStore.getState().adminPost).toBeNull();
  });

  it('sets error when fetchAdminPosts fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Forbidden'));

    await act(async () => {
      await useBlogStore.getState().fetchAdminPosts();
    });

    expect(useBlogStore.getState().error).toBe('Forbidden');
    expect(useBlogStore.getState().loading).toBe(false);
  });

  it('sets error when fetchCalendarPosts fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Calendar error'));

    await act(async () => {
      await useBlogStore.getState().fetchCalendarPosts('2026-03-01', '2026-03-31');
    });

    expect(useBlogStore.getState().error).toBe('Calendar error');
    expect(useBlogStore.getState().loading).toBe(false);
  });
});
