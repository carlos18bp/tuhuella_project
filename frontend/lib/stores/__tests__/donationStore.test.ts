import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useDonationStore } from '../donationStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const DONATION_FIXTURE = {
  id: 1,
  user: 1,
  user_email: 'u@example.com',
  destination: 'shelter' as const,
  shelter: 1,
  shelter_name: 'R1',
  shelter_city: 'Bogotá',
  campaign: null,
  campaign_title: null,
  amount: '50000.00',
  status: 'pending',
  message: 'Keep going',
  paid_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('donationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDonationStore.setState({
      donations: [],
      loading: false,
      error: null,
    });
  });

  it('fetches donations list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [DONATION_FIXTURE] });

    await act(async () => {
      await useDonationStore.getState().fetchDonations();
    });

    const state = useDonationStore.getState();
    expect(state.donations).toHaveLength(1);
    expect(state.donations[0].amount).toBe('50000.00');
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchDonations fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useDonationStore.getState().fetchDonations();
    });

    expect(useDonationStore.getState().error).toBe('Network error');
    expect(useDonationStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchDonations rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useDonationStore.getState().fetchDonations();
    });

    expect(useDonationStore.getState().error).toBe('Failed to fetch donations');
    expect(useDonationStore.getState().loading).toBe(false);
  });

  it('creates a donation via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: DONATION_FIXTURE });

    const payload = {
      destination: 'shelter' as const,
      shelter: 1,
      amount: 50000,
      message: 'Keep going',
    };
    const result = await useDonationStore.getState().createDonation(payload);

    expect(result.amount).toBe('50000.00');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
    expect(mockApi.post).toHaveBeenCalledWith(
      expect.any(String),
      payload,
    );
  });
});
