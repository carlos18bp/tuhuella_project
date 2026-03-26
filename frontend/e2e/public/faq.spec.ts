import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { PUBLIC_FAQ } from '../helpers/flow-tags';

test.describe('FAQ Page', () => {
  test('should display FAQ page with questions', { tag: [...PUBLIC_FAQ] }, async ({ page }) => {
    await page.goto('/faq');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*faq/);
    await expect(page.getByRole('heading', { name: /Preguntas Frecuentes/i })).toBeVisible();
    await expect(page.getByText(/Resolvemos tus dudas/i)).toBeVisible();
  });

  test('should show all FAQ items', { tag: [...PUBLIC_FAQ] }, async ({ page }) => {
    await page.goto('/faq');
    await waitForPageLoad(page);

    // Verify at least the first FAQ question is visible
    await expect(page.getByText(/¿Cómo funciona el proceso de adopción/i)).toBeVisible();
    await expect(page.getByText(/¿Puedo apadrinar en vez de adoptar/i)).toBeVisible();
    await expect(page.getByText(/¿Cómo sé si un refugio es confiable/i)).toBeVisible();
  });

  test('should display FAQ answers alongside questions', { tag: [...PUBLIC_FAQ] }, async ({ page }) => {
    await page.goto('/faq');
    await waitForPageLoad(page);

    // Verify answers are displayed (not collapsed)
    await expect(page.getByText(/Explora los animales disponibles/i)).toBeVisible();
    await expect(page.getByText(/Tu aporte mensual o único/i)).toBeVisible();
  });
});
