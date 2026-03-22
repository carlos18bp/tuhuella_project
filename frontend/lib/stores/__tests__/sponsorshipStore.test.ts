import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useSponsorshipStore } from '../sponsorshipStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const SPONSORSHIP_FIXTURE = {
  id: 1,
  animal: 1,
  amount: '30000.00',
  frequency: 'monthly',
  status: 'active',
};

describe('sponsorshipStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSponsorshipStore.setState({
      sponsorships: [],
      loading: false,
      error: null,
    });
  });

  it('fetches sponsorships list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [SPONSORSHIP_FIXTURE] });

    await act(async () => {
      await useSponsorshipStore.getState().fetchSponsorships();
    });

    const state = useSponsorshipStore.getState();
    expect(state.sponsorships).toHaveLength(1);
    expect(state.sponsorships[0].frequency).toBe('monthly');
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchSponsorships fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useSponsorshipStore.getState().fetchSponsorships();
    });

    expect(useSponsorshipStore.getState().error).toBe('Network error');
    expect(useSponsorshipStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchSponsorships rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useSponsorshipStore.getState().fetchSponsorships();
    });

    expect(useSponsorshipStore.getState().error).toBe('Failed to fetch sponsorships');
    expect(useSponsorshipStore.getState().loading).toBe(false);
  });

  it('creates a sponsorship via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: SPONSORSHIP_FIXTURE });

    const result = await useSponsorshipStore.getState().createSponsorship({
      animal: 1,
      amount: 30000,
      frequency: 'monthly',
    });

    expect(result.frequency).toBe('monthly');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });
});
