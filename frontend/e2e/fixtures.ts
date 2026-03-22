/**
 * E2E Test Fixtures and Helpers
 * 
 * Este archivo contiene fixtures y funciones auxiliares para las pruebas E2E
 */

export const testAdopter = {
  email: 'adopter-e2e@example.com',
  password: 'testpass123',
  first_name: 'Carlos',
  last_name: 'Pérez',
  role: 'adopter' as const,
};

export const testShelterAdmin = {
  email: 'shelter-e2e@example.com',
  password: 'testpass123',
  first_name: 'María',
  last_name: 'López',
  role: 'shelter_admin' as const,
};

export const testPlatformAdmin = {
  email: 'admin@mihuella.com',
  password: 'admin123456',
  role: 'admin' as const,
};

export const testDonationData = {
  amount: '50000',
  shelter_id: 1,
  campaign_id: 1,
};

export const testSponsorshipData = {
  amount: '30000',
  animal_id: 1,
  frequency: 'monthly' as const,
};

/**
 * Wait for the page to finish loading
 * Using 'load' which waits for DOM and all resources (images, scripts)
 * but doesn't wait for network to be idle
 */
export async function waitForPageLoad(page: any) {
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: any, url: string) {
  return page.waitForResponse((response: any) => 
    response.url().includes(url) && response.status() === 200
  );
}
