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
});
