// qa: draft-unvalidated (2026-07-26 — app not running at authoring time)
import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { ANIMAL_BROWSE } from '../helpers/flow-tags';

test.describe('Animal browse — display via UI navigation', () => {
  // Bug it catches: the header route to the listing breaking (renamed route,
  // locale prefix regression) or the listing rendering without its data grid —
  // the deep-link junk spec this replaces could not see either.
  test('user reaches the animal listing from the home nav and sees the cards grid', { tag: [...ANIMAL_BROWSE, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.locator('header').getByRole('link', { name: 'Animales' }).click();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/animals/);
    await expect(page.getByRole('heading', { name: 'Animales en adopción' })).toHaveText('Animales en adopción');
    await expect(page.getByTestId('animal-card-link').first()).toBeVisible();
  });
});
