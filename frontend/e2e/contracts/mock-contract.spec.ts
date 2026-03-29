/**
 * Mock–Backend Contract Tests
 *
 * Validates that shared mock data conforms to backend serializer schemas.
 * Catches schema drift between frontend mocks and backend API responses
 * BEFORE E2E tests run against real APIs.
 *
 * Run: npx playwright test e2e/contracts/mock-contract.spec.ts
 */

import { test, expect } from '../test-with-coverage';
import { validateMock, validateMockArray, formatErrors } from '../helpers/contract-validate';
import {
  volunteerPositionSchema,
  favoriteSchema,
  pendingShelterSchema,
  paymentListSchema,
  adminMetricsSchema,
  campaignListSchema,
  donationListSchema,
} from '../helpers/contract-schemas';
import {
  mockVolunteerPositions,
  mockFavorites,
  mockPendingShelters,
  mockPayments,
  mockMetrics,
  mockShelterCampaigns,
  mockShelterDonations,
} from '../helpers/mock-data';

test.describe('Mock–Backend Contract Validation', () => {
  test('volunteer positions mock matches VolunteerPositionSerializer', async () => {
    const errors = validateMockArray(mockVolunteerPositions, volunteerPositionSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('favorites mock matches FavoriteSerializer', async () => {
    const errors = validateMockArray(mockFavorites, favoriteSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('pending shelters mock matches admin pending_shelters response', async () => {
    const errors = validateMockArray(mockPendingShelters, pendingShelterSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('payments mock matches PaymentListSerializer', async () => {
    const errors = validateMockArray(mockPayments, paymentListSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('admin metrics mock matches admin_metrics response', async () => {
    const errors = validateMock(mockMetrics, adminMetricsSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('shelter campaigns mock matches CampaignListSerializer', async () => {
    const errors = validateMockArray(mockShelterCampaigns, campaignListSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });

  test('shelter donations mock matches DonationListSerializer', async () => {
    const errors = validateMockArray(mockShelterDonations, donationListSchema);
    expect(errors, formatErrors(errors)).toEqual([]);
  });
});
