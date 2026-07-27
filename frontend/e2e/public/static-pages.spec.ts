import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { PUBLIC_ABOUT, PUBLIC_STRATEGIC_ALLIES, PUBLIC_TERMS, PUBLIC_WORK_WITH_US } from '../helpers/flow-tags';

test.describe('About Page', () => {
  test('should display about page with hero heading', { tag: [...PUBLIC_ABOUT, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (authenticated display test: loginAndNavigate is API-based by design; content is asserted with concrete values)
    await page.goto('/about');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*about/);
    await expect(page.getByRole('heading', { name: /Conectamos corazones/i })).toBeVisible();
  });
});

test.describe('Terms Page', () => {
  test('should display terms and conditions page', { tag: [...PUBLIC_TERMS, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (authenticated display test: loginAndNavigate is API-based by design; content is asserted with concrete values)
    await page.goto('/terms');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*terms/);
    await expect(page.getByRole('heading', { name: /Términos y Condiciones/i })).toBeVisible();
  });
});

test.describe('Strategic Allies Page', () => {
  test('should display strategic allies page', { tag: [...PUBLIC_STRATEGIC_ALLIES, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (public static-page render, no session/API required; display outcome)
    await page.goto('/strategic-allies');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*strategic-allies/);
    await expect(page.getByRole('heading', { name: /Aliados Estratégicos/i })).toBeVisible();
  });
});

test.describe('Work With Us Page', () => {
  test('should display work with us page', { tag: [...PUBLIC_WORK_WITH_US] }, async ({ page }) => {
    await page.goto('/work-with-us');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*work-with-us/);
    await expect(page.getByRole('heading', { name: /Trabaja con Nosotros/i })).toBeVisible();
  });
});
