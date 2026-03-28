import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate, fillVolunteerForm } from '../fixtures';
import { VOLUNTEER_APPLY, PUBLIC_WORK_WITH_US } from '../helpers/flow-tags';
import { mockVolunteerPositions } from '../helpers/mock-data';

function setupVolunteerMocks(page: any) {
  return Promise.all([
    page.route('**/volunteer-positions/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockVolunteerPositions),
      }),
    ),
    page.route('**/google-captcha/site-key/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ site_key: '' }),
      }),
    ),
  ]);
}

test.describe('Volunteer Application', () => {
  test('should display volunteer positions on work-with-us page', { tag: [...PUBLIC_WORK_WITH_US] }, async ({ page }) => {
    await page.route('**/volunteer-positions/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockVolunteerPositions),
      }),
    );
    await page.route('**/strategic-allies/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );

    await page.goto('/work-with-us');
    await waitForPageLoad(page);

    await expect(page.getByText(/Fotógrafo de animales/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Paseador de perros/i)).toBeVisible();
  });

  test('should redirect unauthenticated user from volunteer apply', { tag: [...VOLUNTEER_APPLY] }, async ({ page }) => {
    await page.goto('/work-with-us/apply/1');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|apply/);
  });

  test('should display volunteer application form when authenticated', { tag: [...VOLUNTEER_APPLY] }, async ({ page }) => {
    await setupVolunteerMocks(page);
    const positionsLoaded = page.waitForResponse((res: any) => res.url().includes('volunteer-positions'));
    await loginAndNavigate(page, 'adopter', '/work-with-us/apply/1');
    await positionsLoaded;

    await expect(page.getByLabel(/Nombre/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/Apellido/i)).toBeVisible();
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/Teléfono/i)).toBeVisible();
    await expect(page.getByLabel(/Ciudad/i)).toBeVisible();
    await expect(page.getByLabel(/País/i)).toBeVisible();
    await expect(page.getByLabel(/voluntario/i)).toBeVisible();
  });

  test('should submit volunteer application successfully', { tag: [...VOLUNTEER_APPLY] }, async ({ page }) => {
    await setupVolunteerMocks(page);
    await page.route('**/volunteer-applications/**', (route: any) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Application submitted successfully', id: 42 }),
      }),
    );

    const positionsLoaded = page.waitForResponse((res: any) => res.url().includes('volunteer-positions'));
    await loginAndNavigate(page, 'adopter', '/work-with-us/apply/1');
    await positionsLoaded;

    await expect(page.getByLabel(/Nombre/i).first()).toBeVisible({ timeout: 15_000 });
    await fillVolunteerForm(page);
    await page.getByLabel(/voluntario/i).fill('Me encanta ayudar a los animales y quiero contribuir con mi tiempo y esfuerzo.');

    const termsCheckbox = page.getByRole('checkbox');
    if (await termsCheckbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await termsCheckbox.check();
    }

    await page.getByRole('button', { name: /Enviar|Submit/i }).click();

    await expect(page.getByText(/Application submitted successfully|enviada|éxito/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should show validation error for short motivation', { tag: [...VOLUNTEER_APPLY] }, async ({ page }) => {
    await setupVolunteerMocks(page);
    await page.route('**/volunteer-applications/**', (route: any) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          motivation: ['Please provide a more detailed motivation (at least 20 characters).'],
        }),
      }),
    );

    const positionsLoaded = page.waitForResponse((res: any) => res.url().includes('volunteer-positions'));
    await loginAndNavigate(page, 'adopter', '/work-with-us/apply/1');
    await positionsLoaded;

    await expect(page.getByLabel(/Nombre/i).first()).toBeVisible({ timeout: 15_000 });
    await fillVolunteerForm(page);
    await page.getByLabel(/voluntario/i).fill('Me gustan');

    const termsCheckbox = page.getByRole('checkbox');
    if (await termsCheckbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await termsCheckbox.check();
    }

    await page.getByRole('button', { name: /Enviar|Submit/i }).click();

    const errorMsg = page.getByText(/20 car|al menos|mínimo|motivación|motivation/i);
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  });

  test('should display motivation character counter', { tag: [...VOLUNTEER_APPLY] }, async ({ page }) => {
    await setupVolunteerMocks(page);
    const positionsLoaded = page.waitForResponse((res: any) => res.url().includes('volunteer-positions'));
    await loginAndNavigate(page, 'adopter', '/work-with-us/apply/1');
    await positionsLoaded;

    await expect(page.getByLabel(/voluntario/i)).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/voluntario/i).fill('Quiero ayudar a los animales.');

    const counter = page.getByText(/29.*\/.*1000|29.*1000/i);
    await expect(counter).toBeVisible({ timeout: 5_000 });
  });
});
