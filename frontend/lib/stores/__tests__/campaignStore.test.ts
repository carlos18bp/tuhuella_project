import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useCampaignStore } from '../campaignStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const CAMPAIGN_FIXTURE = {
  id: 1,
  title: 'Medical Fund',
  description: 'Help us cover medical costs',
  goal_amount: '500000.00',
  raised_amount: '0.00',
  status: 'active',
};

describe('campaignStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCampaignStore.setState({
      campaigns: [],
      campaign: null,
      loading: false,
      error: null,
    });
  });

  it('fetches campaigns list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [CAMPAIGN_FIXTURE] });

    await act(async () => {
      await useCampaignStore.getState().fetchCampaigns();
    });

    const state = useCampaignStore.getState();
    expect(state.campaigns).toHaveLength(1);
    expect(state.campaigns[0].title).toBe('Medical Fund');
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchCampaigns fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useCampaignStore.getState().fetchCampaigns();
    });

    expect(useCampaignStore.getState().error).toBe('Network error');
    expect(useCampaignStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchCampaigns rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useCampaignStore.getState().fetchCampaigns();
    });

    expect(useCampaignStore.getState().error).toBe('Failed to fetch campaigns');
    expect(useCampaignStore.getState().loading).toBe(false);
  });

  it('sets error when fetchCampaign fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Not found'));

    await act(async () => {
      await useCampaignStore.getState().fetchCampaign(999);
    });

    expect(useCampaignStore.getState().error).toBe('Not found');
    expect(useCampaignStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchCampaign rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useCampaignStore.getState().fetchCampaign(1);
    });

    expect(useCampaignStore.getState().error).toBe('Failed to fetch campaign');
    expect(useCampaignStore.getState().loading).toBe(false);
  });

  it('fetches a single campaign detail', async () => {
    mockApi.get.mockResolvedValueOnce({ data: CAMPAIGN_FIXTURE });

    await act(async () => {
      await useCampaignStore.getState().fetchCampaign(1);
    });

    expect(useCampaignStore.getState().campaign?.title).toBe('Medical Fund');
  });
});
