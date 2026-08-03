import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';
import { PUBLIC_ABOUT, PUBLIC_STRATEGIC_ALLIES, PUBLIC_TERMS, PUBLIC_WORK_WITH_US } from '../helpers/flow-tags';

test.describe('About Page', () => {
  test('should display about page with hero heading', { tag: [...PUBLIC_ABOUT, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: the footer's "Nosotros" link losing its route or its locale prefix
    // (Footer.tsx:30 → ROUTES.ABOUT). The footer is the only in-app path to this page,
    // so a deep-linked test would stay green while nobody could reach it.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Nosotros', exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: /Conectamos corazones/i })).toBeVisible();
  });
});

test.describe('Terms Page', () => {
  test('should display terms and conditions page', { tag: [...PUBLIC_TERMS, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: the footer's "Términos y Condiciones" link losing its route or its
    // locale prefix (Footer.tsx:36 → ROUTES.TERMS) — the only in-app path to the page.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Términos y Condiciones', exact: true }).click();

    await expect(page).toHaveURL(/\/terms$/);
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
