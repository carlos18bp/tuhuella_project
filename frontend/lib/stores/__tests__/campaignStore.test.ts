import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useCampaignStore } from '../campaignStore';
import { api } from '../../services/http';
import type { Campaign, CampaignMessage } from '@/lib/types';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

// Typed and complete: the store spreads API responses over these objects, so a
// partial fixture both fails the type and hides which fields a merge preserves.
const CAMPAIGN_FIXTURE: Campaign = {
  id: 1,
  title: 'Medical Fund',
  description: 'Help us cover medical costs',
  shelter: 1,
  shelter_name: 'Happy Paws',
  goal_amount: '500000.00',
  raised_amount: '0.00',
  progress_percentage: 0,
  status: 'active',
  approval_status: 'approved',
  created_at: '2026-04-18T10:00:00Z',
};

const message = (over: Partial<CampaignMessage> = {}): CampaignMessage => ({
  id: 1,
  campaign: 1,
  author: 5,
  author_name: 'Laura Gómez',
  author_role: 'web_manager',
  body: 'prev',
  is_system: false,
  created_at: '2026-04-18T10:00:00Z',
  ...over,
});

describe('campaignStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCampaignStore.setState({
      campaigns: [],
      campaign: null,
      messagesByCampaign: {},
      loading: false,
      messagesLoading: false,
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

  it('passes lang and status params to fetchCampaigns', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      await useCampaignStore.getState().fetchCampaigns('es', 'active');
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.any(String),
      { params: { lang: 'es', status: 'active' } },
    );
  });

  it('passes lang param to fetchCampaign', async () => {
    mockApi.get.mockResolvedValueOnce({ data: CAMPAIGN_FIXTURE });

    await act(async () => {
      await useCampaignStore.getState().fetchCampaign(1, 'en');
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.any(String),
      { params: { lang: 'en' } },
    );
  });

  it('loads my-campaigns into store', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [CAMPAIGN_FIXTURE] });

    await act(async () => {
      await useCampaignStore.getState().fetchMyCampaigns('es');
    });

    expect(useCampaignStore.getState().campaigns).toHaveLength(1);
  });

  it('sets error when fetchMyCampaigns fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Boom'));

    await act(async () => {
      await useCampaignStore.getState().fetchMyCampaigns();
    });

    expect(useCampaignStore.getState().error).toBe('Boom');
  });

  it('sets fallback error when fetchMyCampaigns rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce({ oops: true });

    await act(async () => {
      await useCampaignStore.getState().fetchMyCampaigns();
    });

    expect(useCampaignStore.getState().error).toBe('Failed to fetch campaigns');
  });

  it('prepends created campaign into list via createCampaign', async () => {
    useCampaignStore.setState({ campaigns: [CAMPAIGN_FIXTURE] });
    const created = { ...CAMPAIGN_FIXTURE, id: 2, title: 'New' };
    mockApi.post.mockResolvedValueOnce({ data: created });

    let result;
    await act(async () => {
      result = await useCampaignStore.getState().createCampaign({ title_es: 'New' }, 'es');
    });

    expect(result).toEqual(created);
    expect(useCampaignStore.getState().campaign).toEqual(created);
    expect(useCampaignStore.getState().campaigns[0].id).toBe(2);
  });

  it('creates campaign without lang param', async () => {
    const created = { ...CAMPAIGN_FIXTURE, id: 3 };
    mockApi.post.mockResolvedValueOnce({ data: created });

    await act(async () => {
      await useCampaignStore.getState().createCampaign({ title_es: 'Sin lang' });
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.any(String),
      { title_es: 'Sin lang' },
      { params: {} },
    );
  });

  it('replaces active campaign via updateCampaign', async () => {
    const updated = { ...CAMPAIGN_FIXTURE, title: 'Updated' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    let result;
    await act(async () => {
      result = await useCampaignStore.getState().updateCampaign(1, { title_es: 'Updated' });
    });

    expect(result).toEqual(updated);
    expect(useCampaignStore.getState().campaign).toEqual(updated);
  });

  it('passes lang param to updateCampaign', async () => {
    const updated = { ...CAMPAIGN_FIXTURE, title: 'Updated' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    await act(async () => {
      await useCampaignStore.getState().updateCampaign(1, { title_es: 'Updated' }, 'en');
    });

    expect(mockApi.patch).toHaveBeenCalledWith(
      expect.any(String),
      { title_es: 'Updated' },
      { params: { lang: 'en' } },
    );
  });

  it('sets campaign to submitted result after submitForApproval', async () => {
    const submitted = { ...CAMPAIGN_FIXTURE, approval_status: 'pending_review' };
    mockApi.post.mockResolvedValueOnce({ data: submitted });

    let result;
    await act(async () => {
      result = await useCampaignStore.getState().submitForApproval(1, 'es');
    });

    expect(result).toEqual(submitted);
    expect(useCampaignStore.getState().campaign).toEqual(submitted);
  });

  it('stores messages keyed by campaign id via fetchMessages', async () => {
    const messages = [{ id: 10, body: 'hola' }];
    mockApi.get.mockResolvedValueOnce({ data: messages });

    await act(async () => {
      await useCampaignStore.getState().fetchMessages(1);
    });

    expect(useCampaignStore.getState().messagesByCampaign[1]).toEqual(messages);
    expect(useCampaignStore.getState().messagesLoading).toBe(false);
  });

  it('passes lang param to fetchMessages', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      await useCampaignStore.getState().fetchMessages(1, 'en');
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.any(String),
      { params: { lang: 'en' } },
    );
  });

  it('submits for approval without lang param', async () => {
    const submitted = { ...CAMPAIGN_FIXTURE, approval_status: 'pending_review' };
    mockApi.post.mockResolvedValueOnce({ data: submitted });

    await act(async () => {
      await useCampaignStore.getState().submitForApproval(1);
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.any(String),
      {},
      { params: {} },
    );
  });

  it('sets error when fetchMessages fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('msg failure'));

    await act(async () => {
      await useCampaignStore.getState().fetchMessages(1);
    });

    expect(useCampaignStore.getState().error).toBe('msg failure');
    expect(useCampaignStore.getState().messagesLoading).toBe(false);
  });

  it('sets fallback error when fetchMessages rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce(null);

    await act(async () => {
      await useCampaignStore.getState().fetchMessages(1);
    });

    expect(useCampaignStore.getState().error).toBe('Failed to fetch messages');
  });

  it('appends new message to existing thread via sendMessage', async () => {
    useCampaignStore.setState({
      messagesByCampaign: { 1: [message()] },
    });
    const sent = { id: 2, body: 'hola' };
    mockApi.post.mockResolvedValueOnce({ data: sent });

    let result;
    await act(async () => {
      result = await useCampaignStore.getState().sendMessage(1, 'hola');
    });

    expect(result).toEqual(sent);
    expect(useCampaignStore.getState().messagesByCampaign[1]).toHaveLength(2);
  });

  it('creates a new thread with sent message when none exists', async () => {
    const sent = { id: 5, body: 'first' };
    mockApi.post.mockResolvedValueOnce({ data: sent });

    await act(async () => {
      await useCampaignStore.getState().sendMessage(7, 'first', 'en');
    });

    expect(useCampaignStore.getState().messagesByCampaign[7]).toEqual([sent]);
  });
});
