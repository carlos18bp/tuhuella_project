import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useAdoptionStore } from '../adoptionStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const APPLICATION_FIXTURE = {
  id: 1,
  animal: 1,
  user: 1,
  status: 'submitted',
  form_answers: { reason: 'Love animals' },
  notes: 'Please',
};

describe('adoptionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdoptionStore.setState({
      applications: [],
      applicationsById: {},
      loading: false,
      error: null,
    });
  });

  it('fetches applications list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [APPLICATION_FIXTURE] });

    await act(async () => {
      await useAdoptionStore.getState().fetchApplications();
    });

    const state = useAdoptionStore.getState();
    expect(state.applications).toHaveLength(1);
    expect(state.applications[0].status).toBe('submitted');
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchApplications fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useAdoptionStore.getState().fetchApplications();
    });

    expect(useAdoptionStore.getState().error).toBe('Network error');
    expect(useAdoptionStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchApplications rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useAdoptionStore.getState().fetchApplications();
    });

    expect(useAdoptionStore.getState().error).toBe('Failed to fetch applications');
    expect(useAdoptionStore.getState().loading).toBe(false);
  });

  it('creates an application via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: APPLICATION_FIXTURE });

    const result = await useAdoptionStore.getState().createApplication({
      animal: 1,
      form_answers: { reason: 'Love animals' },
      notes: 'Please',
    });

    expect(result.status).toBe('submitted');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('updates application status via API', async () => {
    const updated = { ...APPLICATION_FIXTURE, status: 'approved' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    const result = await useAdoptionStore.getState().updateStatus(1, 'approved' as never);

    expect(result.status).toBe('approved');
    expect(mockApi.patch).toHaveBeenCalledTimes(1);
  });

  it('creates an event, appends it to the cached application, and reschedules follow-up', async () => {
    const cached = {
      ...APPLICATION_FIXTURE,
      status: 'interview',
      events: [],
      next_follow_up_due_at: null,
    };
    useAdoptionStore.setState({ applicationsById: { 1: cached as never } });

    const newEvent = {
      id: 99,
      application: 1,
      event_date: '2026-05-04T10:00:00Z',
      description: 'Llamada inicial con el adoptante',
      created_by_name: 'Refugio Tuhuella',
      created_by_role: 'shelter_admin',
    };
    mockApi.post.mockResolvedValueOnce({ data: newEvent });

    const result = await useAdoptionStore.getState().createEvent(1, {
      event_date: '2026-05-04T10:00:00Z',
      description: 'Llamada inicial con el adoptante',
    });

    expect(result.id).toBe(99);
    expect(mockApi.post).toHaveBeenCalledWith('/adoptions/1/events/', {
      event_date: '2026-05-04T10:00:00Z',
      description: 'Llamada inicial con el adoptante',
    });

    const updatedCache = useAdoptionStore.getState().applicationsById[1];
    expect(updatedCache.events).toHaveLength(1);
    expect(updatedCache.events?.[0].id).toBe(99);
    expect(updatedCache.next_follow_up_due_at).toBeTruthy();
    expect(new Date(updatedCache.next_follow_up_due_at as string).getTime()).toBeGreaterThan(Date.now());
  });
});
