import { describe, it, expect } from '@jest/globals';

import { API_ENDPOINTS, COOKIE_KEYS, PAGINATION, ROUTES } from '../constants';

describe('constants', () => {
  describe('API_ENDPOINTS', () => {
    it('ANIMAL_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ANIMAL_DETAIL(42)).toBe('/animals/42/');
    });

    it('SHELTER_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SHELTER_DETAIL(7)).toBe('/shelters/7/');
    });

    it('CAMPAIGN_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.CAMPAIGN_DETAIL(3)).toBe('/campaigns/3/');
    });
  });

  describe('ROUTES', () => {
    it('exposes HOME route as "/"', () => {
      expect(ROUTES.HOME).toBe('/');
    });

    it('exposes SIGN_IN route', () => {
      expect(ROUTES.SIGN_IN).toBe('/sign-in');
    });

    it('exposes ANIMALS route', () => {
      expect(ROUTES.ANIMALS).toBe('/animales');
    });

    it('exposes SHELTERS route', () => {
      expect(ROUTES.SHELTERS).toBe('/refugios');
    });

    it('exposes CAMPAIGNS route', () => {
      expect(ROUTES.CAMPAIGNS).toBe('/campanas');
    });
  });

  describe('COOKIE_KEYS', () => {
    it('exposes ACCESS_TOKEN key', () => {
      expect(COOKIE_KEYS.ACCESS_TOKEN).toBe('access_token');
    });

    it('exposes REFRESH_TOKEN key', () => {
      expect(COOKIE_KEYS.REFRESH_TOKEN).toBe('refresh_token');
    });
  });

  describe('PAGINATION', () => {
    it('exposes DEFAULT_PAGE_SIZE as 20', () => {
      expect(PAGINATION.DEFAULT_PAGE_SIZE).toBe(20);
    });
  });
});
