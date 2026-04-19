import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useWebManagerStore } from '../webManagerStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const SHELTER_FIXTURE = {
  id: 1,
  name: 'Happy Paws',
  city: 'Bogotá',
  verification_status: 'verified',
};

const APPLICATION_FIXTURE = {
  id: 10,
  animal: 3,
  user: 7,
  status: 'submitted',
  form_answers: {},
  notes: '',
};

const makePaginated = <T>(results: T[]) => ({
  results,
  count: results.length,
  page: 1,
  total_pages: 1,
});

describe('webManagerStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWebManagerStore.setState({
      shelters: [],
      sheltersMeta: null,
      sheltersLoading: false,
      applications: [],
      applicationsMeta: null,
      applicationsLoading: false,
      campaigns: [],
      campaignsMeta: null,
      campaignsLoading: false,
      error: null,
    });
  });

  describe('fetchShelters', () => {
    it('fetches shelters and stores results with meta', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([SHELTER_FIXTURE]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters();
      });

      const state = useWebManagerStore.getState();
      expect(state.shelters).toHaveLength(1);
      expect(state.shelters[0].name).toBe('Happy Paws');
      expect(state.sheltersMeta?.count).toBe(1);
      expect(state.sheltersLoading).toBe(false);
    });

    it('passes filter params as query string', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters({ city: 'Medellín', page: 2 });
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).toContain('city=Medell%C3%ADn');
      expect(calledUrl).toContain('page=2');
    });

    it('calls endpoint without query string when no filters are given', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters();
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).not.toContain('?');
    });

    it('omits undefined filter values from query string', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters({ city: undefined });
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).not.toContain('city');
    });

    it('sets error and clears loading when the API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters();
      });

      const state = useWebManagerStore.getState();
      expect(state.error).toBe('Unauthorized');
      expect(state.sheltersLoading).toBe(false);
    });
  });

  describe('fetchApplications', () => {
    it('fetches applications and stores results with meta', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([APPLICATION_FIXTURE]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchApplications();
      });

      const state = useWebManagerStore.getState();
      expect(state.applications).toHaveLength(1);
      expect(state.applicationsMeta?.count).toBe(1);
      expect(state.applicationsLoading).toBe(false);
    });

    it('passes filter params as query string', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchApplications({ status: 'approved', shelter: 2 });
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).toContain('status=approved');
      expect(calledUrl).toContain('shelter=2');
    });

    it('sets error and clears loading when the API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));

      await act(async () => {
        await useWebManagerStore.getState().fetchApplications();
      });

      const state = useWebManagerStore.getState();
      expect(state.error).toBe('Server error');
      expect(state.applicationsLoading).toBe(false);
    });
  });

  describe('fetchShelterApplications', () => {
    it('fetches applications for a specific shelter', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([APPLICATION_FIXTURE]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelterApplications(1);
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).toContain('/admin/shelters/1/applications/');
      expect(useWebManagerStore.getState().applications).toHaveLength(1);
    });

    it('appends filter params for shelter-specific applications', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchShelterApplications(1, { status: 'pending' });
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).toContain('status=pending');
    });

    it('sets error and clears loading when the API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Forbidden'));

      await act(async () => {
        await useWebManagerStore.getState().fetchShelterApplications(99);
      });

      const state = useWebManagerStore.getState();
      expect(state.error).toBe('Forbidden');
      expect(state.applicationsLoading).toBe(false);
    });
  });

  describe('fallback error messages', () => {
    it('uses default error when fetchShelters rejects with non-Error', async () => {
      mockApi.get.mockRejectedValueOnce('nope');

      await act(async () => {
        await useWebManagerStore.getState().fetchShelters();
      });

      expect(useWebManagerStore.getState().error).toBe('Error');
    });

    it('uses default error when fetchApplications rejects with non-Error', async () => {
      mockApi.get.mockRejectedValueOnce({ oops: true });

      await act(async () => {
        await useWebManagerStore.getState().fetchApplications();
      });

      expect(useWebManagerStore.getState().error).toBe('Error');
    });

    it('uses default error when fetchShelterApplications rejects with non-Error', async () => {
      mockApi.get.mockRejectedValueOnce(null);

      await act(async () => {
        await useWebManagerStore.getState().fetchShelterApplications(1);
      });

      expect(useWebManagerStore.getState().error).toBe('Error');
    });
  });

  describe('fetchCampaigns', () => {
    const CAMPAIGN_FIXTURE = { id: 5, title_es: 'Save them', approval_status: 'pending' };

    it('stores campaigns and meta on success', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([CAMPAIGN_FIXTURE]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchCampaigns();
      });

      const state = useWebManagerStore.getState();
      expect(state.campaigns).toHaveLength(1);
      expect(state.campaignsMeta?.count).toBe(1);
      expect(state.campaignsLoading).toBe(false);
    });

    it('passes filter params as query string', async () => {
      mockApi.get.mockResolvedValueOnce({ data: makePaginated([]) });

      await act(async () => {
        await useWebManagerStore.getState().fetchCampaigns({ approval_status: 'pending', page: 2 });
      });

      const [calledUrl] = mockApi.get.mock.calls[0];
      expect(calledUrl).toContain('approval_status=pending');
      expect(calledUrl).toContain('page=2');
    });

    it('sets error when fetchCampaigns fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));

      await act(async () => {
        await useWebManagerStore.getState().fetchCampaigns();
      });

      const state = useWebManagerStore.getState();
      expect(state.error).toBe('Server error');
      expect(state.campaignsLoading).toBe(false);
    });

    it('uses default error when fetchCampaigns rejects with non-Error', async () => {
      mockApi.get.mockRejectedValueOnce(42);

      await act(async () => {
        await useWebManagerStore.getState().fetchCampaigns();
      });

      expect(useWebManagerStore.getState().error).toBe('Error');
    });
  });

  describe('approveCampaign / rejectCampaign', () => {
    const CAMPAIGN_FIXTURE = { id: 5, title_es: 'Save them', approval_status: 'pending' };

    it('merges approved campaign into the existing list', async () => {
      useWebManagerStore.setState({ campaigns: [CAMPAIGN_FIXTURE] });
      const approved = { id: 5, approval_status: 'approved' };
      mockApi.post.mockResolvedValueOnce({ data: approved });

      let result;
      await act(async () => {
        result = await useWebManagerStore.getState().approveCampaign(5);
      });

      expect(result).toEqual(approved);
      expect(useWebManagerStore.getState().campaigns[0].approval_status).toBe('approved');
      expect(useWebManagerStore.getState().campaigns[0].title_es).toBe('Save them');
    });

    it('leaves other campaigns untouched when approving one', async () => {
      const another = { id: 9, title_es: 'Other', approval_status: 'approved' };
      useWebManagerStore.setState({ campaigns: [CAMPAIGN_FIXTURE, another] });
      mockApi.post.mockResolvedValueOnce({ data: { id: 5, approval_status: 'approved' } });

      await act(async () => {
        await useWebManagerStore.getState().approveCampaign(5);
      });

      const state = useWebManagerStore.getState();
      expect(state.campaigns.find((c) => c.id === 9)).toEqual(another);
    });

    it('merges rejected campaign and passes reason to API', async () => {
      useWebManagerStore.setState({ campaigns: [CAMPAIGN_FIXTURE] });
      const rejected = { id: 5, approval_status: 'rejected' };
      mockApi.post.mockResolvedValueOnce({ data: rejected });

      let result;
      await act(async () => {
        result = await useWebManagerStore.getState().rejectCampaign(5, 'missing docs');
      });

      expect(result).toEqual(rejected);
      const [, payload] = mockApi.post.mock.calls[0];
      expect(payload).toEqual({ reason: 'missing docs' });
      expect(useWebManagerStore.getState().campaigns[0].approval_status).toBe('rejected');
    });
  });
});
