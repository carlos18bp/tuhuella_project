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
  first_name: 'Admin',
  last_name: 'Test',
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

/**
 * Build a mock user object for route interception responses.
 */
function mockUserForRole(role: 'adopter' | 'shelter_admin' | 'admin') {
  const users = { adopter: testAdopter, shelter_admin: testShelterAdmin, admin: testPlatformAdmin };
  const user = users[role];
  return {
    id: 1,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_staff: role === 'admin' || role === 'shelter_admin',
    is_active: true,
  };
}

/**
 * Login as a specific role (adopter, shelter_admin, or admin).
 * Disables reCAPTCHA and mocks sign-in API to ensure login succeeds
 * even when test users are not seeded in the backend database.
 */
export async function loginAs(page: any, role: 'adopter' | 'shelter_admin' | 'admin') {
  const users = { adopter: testAdopter, shelter_admin: testShelterAdmin, admin: testPlatformAdmin };
  const user = users[role];
  await page.route('**/google-captcha/site-key/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_key: '' }) }),
  );
  // Mock sign-in API so login succeeds without real test users in DB
  await page.route('**/api/auth/sign_in/**', (route: any) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'e2e-mock-access-token',
        refresh: 'e2e-mock-refresh-token',
        user: mockUserForRole(role),
      }),
    }),
  );
  // Mock token refresh to prevent 401 → clearTokens → redirect loop
  await page.route('**/api/token/refresh/**', (route: any) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access: 'e2e-mock-access-token', refresh: 'e2e-mock-refresh-token' }),
    }),
  );
  await page.goto('/sign-in');
  await waitForPageLoad(page);
  await page.getByLabel(/correo/i).fill(user.email);
  await page.getByLabel(/contraseña/i).fill(user.password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL((url: URL) => !url.pathname.includes('sign-in'), { timeout: 10_000 });
  await page.waitForLoadState('domcontentloaded');
  // Dismiss Next.js dev-mode hydration error overlay if present
  await dismissErrorOverlay(page);
}

/**
 * Login via API and set auth cookies directly, then navigate to target page.
 * This avoids the useRequireAuth race condition that occurs with full page reloads.
 * Use this for pages that use useRequireAuth (shelter panel, adoption, checkout, etc.)
 */
export async function loginAndNavigate(page: any, role: 'adopter' | 'shelter_admin' | 'admin', targetUrl: string) {
  const users = { adopter: testAdopter, shelter_admin: testShelterAdmin, admin: testPlatformAdmin };
  const user = users[role];

  let accessToken = 'e2e-mock-access-token';
  let refreshToken = 'e2e-mock-refresh-token';

  // Try real login API; fall back to mock tokens if backend is unavailable or user doesn't exist
  try {
    const response = await page.request.post('http://localhost:8000/api/auth/sign_in/', {
      data: { email: user.email, password: user.password },
    });
    if (response.ok()) {
      const data = await response.json();
      if (data.access && data.refresh) {
        accessToken = data.access;
        refreshToken = data.refresh;
      }
    }
  } catch {
    // Backend unavailable — use mock tokens
  }

  // Set auth cookies in the browser context
  await page.context().addCookies([
    { name: 'access_token', value: accessToken, domain: 'localhost', path: '/' },
    { name: 'refresh_token', value: refreshToken, domain: 'localhost', path: '/' },
  ]);

  // Mock token refresh to prevent 401 → clearTokens → redirect loop with mock tokens
  await page.route('**/api/token/refresh/**', (route: any) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access: accessToken, refresh: refreshToken }),
    }),
  );

  // Navigate with commit-level wait (avoids ERR_ABORTED from useRequireAuth redirect race)
  await page.goto(targetUrl, { waitUntil: 'commit' });
  // Wait for page to stabilize — may have initial redirect then settle
  await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
  // Dismiss Next.js dev-mode hydration error overlay if present
  await dismissErrorOverlay(page);
}

/**
 * Dismiss the Next.js dev-mode error overlay dialog if present.
 * Hydration mismatches between SSR (no cookies) and client (auth cookies)
 * trigger a "Recoverable Error" dialog that blocks page interaction.
 */
export async function dismissErrorOverlay(page: any) {
  const dialog = page.locator('dialog');
  if (await dialog.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 2_000 }).catch(() => {});
  }
}

/**
 * Fill the adoption form wizard fields with default test data.
 * Expects the wizard to already be visible on the page.
 */
export async function fillAdoptionForm(page: any) {
  // Section 1: Basic info — fill only if empty (may be pre-filled from user profile)
  const fullNameInput = page.getByLabel(/Nombre completo/i);
  if (!(await fullNameInput.inputValue())) await fullNameInput.fill('Carlos Pérez');
  const phoneInput = page.getByLabel(/Teléfono/i);
  if (!(await phoneInput.inputValue())) await phoneInput.fill('+57 300 123 4567');
  const emailInput = page.getByLabel(/Correo electrónico/i);
  if (!(await emailInput.inputValue())) await emailInput.fill('adopter-e2e@example.com');
  const cityInput = page.getByLabel(/Ciudad/i);
  if (!(await cityInput.inputValue())) await cityInput.fill('Bogotá');

  // Section 2: Home & context
  await page.getByLabel(/tipo de vivienda/i).selectOption('apartment');
  await page.getByLabel(/patio o jardín/i).selectOption('no');
  await page.getByLabel(/horas al día/i).selectOption('2to4');

  // Section 3: Experience
  await page.getByLabel(/mascotas anteriormente/i).selectOption('dogs');
  await page.getByLabel(/mascotas actualmente/i).selectOption('none');
  await page.getByLabel(/nivel de experiencia/i).selectOption('moderate');

  // Section 4: Compatibility
  await page.getByLabel(/niños en el hogar/i).selectOption('no');
  await page.getByLabel(/gatos en el hogar/i).selectOption('no');
  await page.getByLabel(/otros perros en el hogar/i).selectOption('no');

  // Section 5: Commitment
  await page.getByLabel(/vacunas del animal/i).check();
  await page.getByLabel(/esterilizar al animal/i).check();
  await page.getByLabel(/seguimiento post-adopción/i).check();

  // Section 6: Logistics
  await page.getByLabel(/recibir al animal/i).fill('Inmediatamente');
  await page.getByLabel(/transporte para recoger/i).selectOption('yes');
  await page.getByLabel(/Preferencia de entrega/i).selectOption('flexible');
  await page.getByLabel(/deseas adoptar/i).fill('Quiero darle un hogar a este animal.');
}
