import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useShelterApplicationStore } from '../shelterApplicationStore';
import { api } from '../../services/http';
import { API_ENDPOINTS } from '../../constants';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const APPLICATION_FIXTURE = {
  id: 7,
  shelter_name: 'Refugio Esperanza',
  description_es: 'Rescate y adopción responsable.',
  city: 'Bogotá',
  address: 'Carrera 10 #45-67',
  phone: '3001234567',
  email: 'contacto@esperanza.org',
  website: '',
  legal_name: 'Refugio Esperanza Foundation',
  tax_id: '9001234-1',
  legal_representative_name: 'Ana Ruiz',
  legal_representative_id: '1012345678',
  motivation: 'Llevamos años rescatando animales.',
  previous_experience: 'Albergues informales durante 3 años.',
  capacity_estimate: 30,
  status: 'submitted' as const,
  submitted_at: '2026-01-01T00:00:00Z',
  reviewed_at: null,
  rejection_reason: '',
  created_shelter_id: null,
  document_urls: [],
};

const VALID_PAYLOAD = {
  shelter_name: 'Refugio Esperanza',
  description_es: 'Rescate y adopción responsable.',
  city: 'Bogotá',
  phone: '3001234567',
  legal_name: 'Refugio Esperanza Foundation',
  tax_id: '9001234-1',
  legal_representative_name: 'Ana Ruiz',
  legal_representative_id: '1012345678',
  motivation: 'Llevamos años rescatando animales.',
};

describe('shelterApplicationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useShelterApplicationStore.setState({
      application: null,
      loading: false,
      submitting: false,
      error: null,
    });
  });

  it('stores the application returned by fetchMine', async () => {
    mockApi.get.mockResolvedValueOnce({ data: APPLICATION_FIXTURE });

    await act(async () => {
      await useShelterApplicationStore.getState().fetchMine();
    });

    const state = useShelterApplicationStore.getState();
    expect(state.application?.id).toBe(7);
    expect(state.loading).toBe(false);
    expect(mockApi.get).toHaveBeenCalledWith(API_ENDPOINTS.SHELTER_APPLICATION_MINE);
  });

  it('treats a 404 from fetchMine as no application without an error', async () => {
    mockApi.get.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });

    await act(async () => {
      await useShelterApplicationStore.getState().fetchMine();
    });

    const state = useShelterApplicationStore.getState();
    expect(state.application).toBeNull();
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('records the error message when fetchMine fails with a non-404 error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network down'));

    await act(async () => {
      await useShelterApplicationStore.getState().fetchMine();
    });

    const state = useShelterApplicationStore.getState();
    expect(state.error).toBe('Network down');
    expect(state.loading).toBe(false);
  });

  it('stores the created application and returns it from submit', async () => {
    mockApi.post.mockResolvedValueOnce({ data: APPLICATION_FIXTURE });

    let returned;
    await act(async () => {
      returned = await useShelterApplicationStore.getState().submit(VALID_PAYLOAD);
    });

    expect(returned).toEqual(APPLICATION_FIXTURE);
    expect(useShelterApplicationStore.getState().application?.id).toBe(7);
    expect(useShelterApplicationStore.getState().submitting).toBe(false);
    expect(mockApi.post).toHaveBeenCalledWith(API_ENDPOINTS.SHELTER_APPLICATIONS, VALID_PAYLOAD);
  });

  it('serializes the response body into the error when submit is rejected by the API', async () => {
    const responseData = { tax_id: ['Ya existe una solicitud.'] };
    mockApi.post.mockRejectedValueOnce({ isAxiosError: true, response: { data: responseData } });

    await act(async () => {
      await expect(
        useShelterApplicationStore.getState().submit(VALID_PAYLOAD),
      ).rejects.toBeDefined();
    });

    const state = useShelterApplicationStore.getState();
    expect(state.error).toBe(JSON.stringify(responseData));
    expect(state.submitting).toBe(false);
  });

  it('rethrows and records the message when submit fails with a generic error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Timeout'));

    await act(async () => {
      await expect(
        useShelterApplicationStore.getState().submit(VALID_PAYLOAD),
      ).rejects.toThrow('Timeout');
    });

    expect(useShelterApplicationStore.getState().error).toBe('Timeout');
  });

  it('clears application and flags when reset is called', () => {
    useShelterApplicationStore.setState({
      application: APPLICATION_FIXTURE,
      loading: true,
      submitting: true,
      error: 'boom',
    });

    act(() => {
      useShelterApplicationStore.getState().reset();
    });

    const state = useShelterApplicationStore.getState();
    expect(state.application).toBeNull();
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.submitting).toBe(false);
  });
});
