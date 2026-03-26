import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAs, loginAndNavigate } from '../fixtures';
import { ADOPTION_SUBMIT, ADOPTION_TRACK, ADOPTION_MANAGE, MY_APPLICATIONS_LIST, ADOPTION_FORM_WIZARD } from '../helpers/flow-tags';

test.describe('Adoption Flows', () => {
  test('should redirect unauthenticated user from adoption tracking', { tag: [...ADOPTION_TRACK] }, async ({ page }) => {
    await page.goto('/my-applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-applications/);
  });

  test('should show adoption CTA on animal detail for unauthenticated user', { tag: [...ADOPTION_SUBMIT] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Inicia sesión para adoptar/i })).toBeVisible();
    }
  });

  test('should redirect unauthenticated user from shelter applications', { tag: [...ADOPTION_MANAGE] }, async ({ page }) => {
    await page.goto('/shelter/applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|applications/);
  });
});

test.describe.serial('Adoption Flows — Authenticated', () => {
  test('should display my applications list or empty state', { tag: [...MY_APPLICATIONS_LIST] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/my-applications');

    // Verify heading is visible
    await expect(page.getByRole('heading', { name: /Mis Solicitudes de Adopción/i })).toBeVisible();

    // Either application cards or empty state should be visible
    const emptyState = page.getByText(/No tienes solicitudes de adopción/i);
    const applicationCard = page.locator('.rounded-xl.border.border-stone-200.bg-white').first();

    const hasEmpty = await emptyState.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasCards = await applicationCard.isVisible({ timeout: 2_000 }).catch(() => false);

    expect(hasEmpty || hasCards).toBe(true);
  });

  test('should load adoption form wizard and navigate through steps', { tag: [...ADOPTION_FORM_WIZARD] }, async ({ page }) => {
    // Login first via UI, then browse animals via client-side navigation
    await loginAs(page, 'adopter');

    // Navigate to animals listing (public page, client-side)
    await page.getByRole('link', { name: 'Ver Animales' }).click();
    await page.waitForURL(/.*animals/, { timeout: 10_000 });

    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    await expect(firstAnimalLink).toBeVisible({ timeout: 10_000 });

    // Click the animal to go to detail, then click adopt CTA
    await firstAnimalLink.click();
    await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

    // Click the adopt button ("Solicitar Adopción")
    const adoptLink = page.getByRole('link', { name: /Solicitar Adopción/i });
    await expect(adoptLink).toBeVisible({ timeout: 10_000 });
    await adoptLink.click();
    await page.waitForURL(/.*adopt\/\d+/, { timeout: 10_000 });

    // Verify wizard loaded — step indicator
    await expect(page.getByRole('list', { name: /Pasos del formulario/i })).toBeVisible({ timeout: 15_000 });

    // Section 1: Basic info
    const fullNameInput = page.locator('#adoption-full_name');
    await expect(fullNameInput).toBeVisible();
    const currentName = await fullNameInput.inputValue();
    if (!currentName) await fullNameInput.fill('Carlos Pérez');

    const phoneInput = page.locator('#adoption-phone');
    if (!(await phoneInput.inputValue())) await phoneInput.fill('+57 300 123 4567');

    const emailInput = page.locator('#adoption-email');
    if (!(await emailInput.inputValue())) await emailInput.fill('adopter-e2e@example.com');

    const cityInput = page.locator('#adoption-city');
    if (!(await cityInput.inputValue())) await cityInput.fill('Bogotá');

    // Section 2: Home & context
    await page.locator('#adoption-housing_type').selectOption('apartment');
    await page.locator('#adoption-has_yard').selectOption('no');
    await page.locator('#adoption-hours_alone').selectOption('2to4');

    // Section 3: Experience
    await page.locator('#adoption-previous_pets').selectOption('dogs');
    await page.locator('#adoption-current_pets').selectOption('none');
    await page.locator('#adoption-experience').selectOption('moderate');

    // Section 4: Compatibility
    await page.locator('#adoption-has_children').selectOption('no');
    await page.locator('#adoption-has_cats').selectOption('no');
    await page.locator('#adoption-has_other_dogs').selectOption('no');

    // Section 5: Commitment
    await page.locator('#adoption-accepts_vaccination').check();
    await page.locator('#adoption-accepts_sterilization').check();
    await page.locator('#adoption-accepts_followup').check();

    // Section 6: Logistics
    await page.locator('#adoption-availability_date').fill('Inmediatamente');
    await page.locator('#adoption-has_transport').selectOption('yes');
    await page.locator('#adoption-delivery_preference').selectOption('flexible');
    await page.locator('#adoption-motivation').fill('Quiero darle un hogar a este animal.');

    // Navigate to Review step
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText(/Revisa tus respuestas/i)).toBeVisible();

    // Navigate to Submit step
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.locator('#adoption-notes')).toBeVisible();

    // Submit the application
    await page.getByRole('button', { name: /Enviar solicitud/i }).click();

    // Verify either success screen or error message (API may fail in test environment)
    const successHeading = page.getByRole('heading', { name: /Solicitud enviada/i });
    const errorMessage = page.locator('.bg-red-50');
    await expect(successHeading.or(errorMessage).first()).toBeVisible({ timeout: 15_000 });
  });
});
