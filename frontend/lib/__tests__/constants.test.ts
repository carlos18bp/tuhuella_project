import { describe, it, expect } from '@jest/globals';

import { API_ENDPOINTS, COOKIE_KEYS, PAGINATION, ROUTES } from '../constants';

describe('constants', () => {
  describe('API_ENDPOINTS', () => {
    it('ANIMAL_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ANIMAL_DETAIL(42)).toBe('/animals/42/');
    });

    it('ANIMAL_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ANIMAL_UPDATE(5)).toBe('/animals/5/update/');
    });

    it('ANIMAL_DELETE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ANIMAL_DELETE(9)).toBe('/animals/9/delete/');
    });

    it('SHELTER_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SHELTER_DETAIL(7)).toBe('/shelters/7/');
    });

    it('SHELTER_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SHELTER_UPDATE(3)).toBe('/shelters/3/update/');
    });

    it('CAMPAIGN_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.CAMPAIGN_DETAIL(3)).toBe('/campaigns/3/');
    });

    it('CAMPAIGN_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.CAMPAIGN_UPDATE(8)).toBe('/campaigns/8/update/');
    });

    it('ADOPTION_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ADOPTION_DETAIL(11)).toBe('/adoptions/11/');
    });

    it('ADOPTION_UPDATE_STATUS returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ADOPTION_UPDATE_STATUS(4)).toBe('/adoptions/4/status/');
    });

    it('DONATION_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.DONATION_DETAIL(6)).toBe('/donations/6/');
    });

    it('SPONSORSHIP_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SPONSORSHIP_DETAIL(2)).toBe('/sponsorships/2/');
    });

    it('SPONSORSHIP_UPDATE_STATUS returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SPONSORSHIP_UPDATE_STATUS(10)).toBe('/sponsorships/10/status/');
    });

    it('PAYMENT_STATUS returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.PAYMENT_STATUS(15)).toBe('/payments/15/status/');
    });

    it('UPDATE_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.UPDATE_DETAIL(20)).toBe('/updates/20/');
    });

    it('SHELTER_INVITE_RESPOND returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.SHELTER_INVITE_RESPOND(7)).toBe('/shelter-invites/7/respond/');
    });

    it('ADMIN_APPROVE_SHELTER returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ADMIN_APPROVE_SHELTER(12)).toBe('/admin/shelters/approve/12/');
    });

    it('ANIMAL_SIMILAR returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.ANIMAL_SIMILAR(5)).toBe('/animals/5/similar/');
    });

    it('UPDATE_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.UPDATE_UPDATE(3)).toBe('/updates/3/update/');
    });

    it('UPDATE_DELETE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.UPDATE_DELETE(4)).toBe('/updates/4/delete/');
    });

    it('BLOG_DETAIL returns the correct API path for a given slug', () => {
      expect(API_ENDPOINTS.BLOG_DETAIL('my-post')).toBe('/blog/my-post/');
    });

    it('BLOG_ADMIN_DETAIL returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_ADMIN_DETAIL(10)).toBe('/blog/admin/10/detail/');
    });

    it('BLOG_ADMIN_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_ADMIN_UPDATE(10)).toBe('/blog/admin/10/update/');
    });

    it('BLOG_ADMIN_DELETE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_ADMIN_DELETE(10)).toBe('/blog/admin/10/delete/');
    });

    it('BLOG_ADMIN_DUPLICATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_ADMIN_DUPLICATE(10)).toBe('/blog/admin/10/duplicate/');
    });

    it('BLOG_ADMIN_UPLOAD_COVER returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.BLOG_ADMIN_UPLOAD_COVER(10)).toBe('/blog/admin/10/upload-cover/');
    });

    it('NOTIFICATION_LOG_READ returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.NOTIFICATION_LOG_READ(7)).toBe('/notifications/logs/7/read/');
    });

    it('FAQS_BY_TOPIC returns the correct API path for a given slug', () => {
      expect(API_ENDPOINTS.FAQS_BY_TOPIC('adopcion')).toBe('/faqs/adopcion/');
    });

    it('FAVORITE_UPDATE returns the correct API path for a given id', () => {
      expect(API_ENDPOINTS.FAVORITE_UPDATE(3)).toBe('/favorites/3/');
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
      expect(ROUTES.ANIMALS).toBe('/animals');
    });

    it('ANIMAL_DETAIL returns the correct route for a given id', () => {
      expect(ROUTES.ANIMAL_DETAIL(5)).toBe('/animals/5');
    });

    it('ANIMAL_DETAIL accepts string id', () => {
      expect(ROUTES.ANIMAL_DETAIL('abc')).toBe('/animals/abc');
    });

    it('exposes SHELTERS route', () => {
      expect(ROUTES.SHELTERS).toBe('/shelters');
    });

    it('SHELTER_DETAIL returns the correct route for a given id', () => {
      expect(ROUTES.SHELTER_DETAIL(3)).toBe('/shelters/3');
    });

    it('exposes CAMPAIGNS route', () => {
      expect(ROUTES.CAMPAIGNS).toBe('/campaigns');
    });

    it('CAMPAIGN_DETAIL returns the correct route for a given id', () => {
      expect(ROUTES.CAMPAIGN_DETAIL(7)).toBe('/campaigns/7');
    });

    it('BLOG_DETAIL returns the correct route for a given slug', () => {
      expect(ROUTES.BLOG_DETAIL('my-slug')).toBe('/blog/my-slug');
    });

    it('ADMIN_BLOG_EDIT returns the correct route for a given id', () => {
      expect(ROUTES.ADMIN_BLOG_EDIT(5)).toBe('/admin/blog/5/editar');
    });

    it('ADOPT returns the correct route for a given id', () => {
      expect(ROUTES.ADOPT(9)).toBe('/adopt/9');
    });

    it('VOLUNTEER_APPLY returns the correct route for a given positionId', () => {
      expect(ROUTES.VOLUNTEER_APPLY(2)).toBe('/work-with-us/apply/2');
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
