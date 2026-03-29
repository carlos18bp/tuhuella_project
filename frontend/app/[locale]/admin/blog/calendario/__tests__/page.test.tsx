import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/stores/blogStore', () => ({ useBlogStore: jest.fn() }));

import AdminBlogCalendarPage from '../page';
import { useBlogStore } from '@/lib/stores/blogStore';

const mockUseBlogStore = useBlogStore as unknown as jest.Mock;

function setupMock(overrides: Record<string, unknown> = {}) {
  const state = {
    calendarPosts: [
      {
        id: 1,
        title_es: 'Post programado',
        date: '2026-03-15',
        calendar_status: 'published',
      },
    ],
    loading: false,
    fetchCalendarPosts: jest.fn(),
    ...overrides,
  };
  mockUseBlogStore.mockReturnValue(state);
  return state;
}

describe('AdminBlogCalendarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Calendario del Blog" heading', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Calendario del Blog');
  });

  it('renders day-of-week header for "Dom"', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('renders day-of-week header for "Lun"', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Lun')).toBeInTheDocument();
  });

  it('renders day-of-week header for "Sáb"', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Sáb')).toBeInTheDocument();
  });

  it('renders "← Anterior" navigation button', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByRole('button', { name: '← Anterior' })).toBeInTheDocument();
  });

  it('renders "Siguiente →" navigation button', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeInTheDocument();
  });

  it('renders "Publicado" status legend label', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Publicado')).toBeInTheDocument();
  });

  it('renders "Programado" status legend label', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Programado')).toBeInTheDocument();
  });

  it('renders "Borrador" status legend label', () => {
    setupMock();
    render(<AdminBlogCalendarPage />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('navigates to previous month when "Anterior" is clicked', async () => {
    const state = setupMock();
    render(<AdminBlogCalendarPage />);

    const prevBtn = screen.getByRole('button', { name: '← Anterior' });
    await userEvent.click(prevBtn);

    // fetchCalendarPosts should be called again with the previous month range
    expect(state.fetchCalendarPosts.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('navigates to next month when "Siguiente" is clicked', async () => {
    const state = setupMock();
    render(<AdminBlogCalendarPage />);

    const nextBtn = screen.getByRole('button', { name: 'Siguiente →' });
    await userEvent.click(nextBtn);

    expect(state.fetchCalendarPosts.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
