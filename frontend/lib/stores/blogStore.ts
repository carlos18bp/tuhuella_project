'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { BlogPost, BlogPostDetail, BlogPostAdmin } from '@/lib/types';

type Pagination = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type CalendarPost = {
  id: number;
  title_es: string;
  title_en: string;
  slug: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  calendar_status: 'published' | 'scheduled' | 'draft';
  date: string;
};

type BlogState = {
  posts: BlogPost[];
  post: BlogPostDetail | null;
  adminPost: BlogPostAdmin | null;
  calendarPosts: CalendarPost[];
  pagination: Pagination;
  adminPagination: Pagination;
  loading: boolean;
  error: string | null;

  fetchPosts: (params?: { page?: number; page_size?: number; lang?: string }) => Promise<void>;
  fetchPost: (slug: string, lang?: string) => Promise<void>;
  fetchAdminPosts: (page?: number, pageSize?: number) => Promise<void>;
  fetchAdminPost: (id: number) => Promise<void>;
  createPost: (data: Partial<BlogPostAdmin>) => Promise<BlogPostAdmin>;
  updatePost: (id: number, data: Partial<BlogPostAdmin>) => Promise<BlogPostAdmin>;
  deletePost: (id: number) => Promise<void>;
  duplicatePost: (id: number) => Promise<BlogPostAdmin>;
  uploadCoverImage: (id: number, file: File) => Promise<BlogPostAdmin>;
  createPostFromJSON: (data: Record<string, unknown>) => Promise<BlogPostAdmin>;
  fetchCalendarPosts: (start: string, end: string) => Promise<void>;
  fetchJsonTemplate: () => Promise<Record<string, unknown>>;
  clearPost: () => void;
};

const defaultPagination: Pagination = {
  count: 0,
  page: 1,
  pageSize: 6,
  totalPages: 1,
};

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  post: null,
  adminPost: null,
  calendarPosts: [],
  pagination: { ...defaultPagination },
  adminPagination: { ...defaultPagination, pageSize: 15 },
  loading: false,
  error: null,

  fetchPosts: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.BLOG_LIST, { params });
      const data = response.data;
      set({
        posts: data.results,
        pagination: {
          count: data.count,
          page: data.page,
          pageSize: data.page_size,
          totalPages: data.total_pages,
        },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch blog posts';
      set({ error: message, loading: false });
    }
  },

  fetchPost: async (slug, lang = 'es') => {
    set({ loading: true, error: null, post: null });
    try {
      const response = await api.get(API_ENDPOINTS.BLOG_DETAIL(slug), { params: { lang } });
      set({ post: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch blog post';
      set({ error: message, loading: false });
    }
  },

  fetchAdminPosts: async (page = 1, pageSize = 15) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.BLOG_ADMIN_LIST, {
        params: { page, page_size: pageSize },
      });
      const data = response.data;
      set({
        posts: data.results,
        adminPagination: {
          count: data.count,
          page: data.page,
          pageSize: data.page_size,
          totalPages: data.total_pages,
        },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch admin blog posts';
      set({ error: message, loading: false });
    }
  },

  fetchAdminPost: async (id) => {
    set({ loading: true, error: null, adminPost: null });
    try {
      const response = await api.get(API_ENDPOINTS.BLOG_ADMIN_DETAIL(id));
      set({ adminPost: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch blog post';
      set({ error: message, loading: false });
    }
  },

  createPost: async (data) => {
    const response = await api.post(API_ENDPOINTS.BLOG_ADMIN_CREATE, data);
    return response.data;
  },

  updatePost: async (id, data) => {
    const response = await api.patch(API_ENDPOINTS.BLOG_ADMIN_UPDATE(id), data);
    return response.data;
  },

  deletePost: async (id) => {
    await api.delete(API_ENDPOINTS.BLOG_ADMIN_DELETE(id));
  },

  duplicatePost: async (id) => {
    const response = await api.post(API_ENDPOINTS.BLOG_ADMIN_DUPLICATE(id));
    return response.data;
  },

  uploadCoverImage: async (id, file) => {
    const formData = new FormData();
    formData.append('cover_image', file);
    const response = await api.post(API_ENDPOINTS.BLOG_ADMIN_UPLOAD_COVER(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  createPostFromJSON: async (data) => {
    const response = await api.post(API_ENDPOINTS.BLOG_ADMIN_CREATE_FROM_JSON, data);
    return response.data;
  },

  fetchCalendarPosts: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.BLOG_ADMIN_CALENDAR, {
        params: { start, end },
      });
      set({ calendarPosts: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar posts';
      set({ error: message, loading: false });
    }
  },

  fetchJsonTemplate: async () => {
    const response = await api.get(API_ENDPOINTS.BLOG_ADMIN_JSON_TEMPLATE);
    return response.data;
  },

  clearPost: () => set({ post: null, adminPost: null }),
}));
