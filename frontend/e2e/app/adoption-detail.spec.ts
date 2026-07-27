import { test, expect } from '../test-with-coverage';
import type { Page, Route } from '@playwright/test';
import { loginAndNavigate } from '../fixtures';
import {
  ADOPTION_DETAIL_ADOPTER,
  ADOPTION_DETAIL_WEB_MANAGER,
  ADOPTION_FOLLOWUP_REMINDER,
  ADOPTION_WHATSAPP_APPLICANT,
  ADOPTION_WHATSAPP_SHELTER,
} from '../helpers/flow-tags';

/** Fulfil GET /adoptions/5/ with the given application detail. */
async function mockApplicationDetail(page: Page, detail: Record<string, unknown>) {
  await page.route('**/api/adoptions/5/**', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(detail),
    }),
  );
}

test.describe('Adoption application detail', () => {
  test(
    'adopter sees their application detail',
    { tag: [...ADOPTION_DETAIL_ADOPTER, '@outcome:display'] },
    async ({ page }) => {
      await mockApplicationDetail(page, {
        id: 5,
        animal_name: 'Luna',
        shelter_name: 'Patitas Felices',
        shelter_city: 'Bogotá',
        shelter_whatsapp: '',
        status: 'interview',
        created_at: '2026-01-10T00:00:00Z',
        events: [],
      });

      await loginAndNavigate(page, 'adopter', '/es/my-applications/5');

      await expect(page.getByRole('heading', { level: 1, name: 'Luna' })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(/Patitas Felices/)).toBeVisible();
    },
  );

  test(
    'web manager sees the applicant on the application detail',
    { tag: [...ADOPTION_DETAIL_WEB_MANAGER, '@outcome:display'] },
    async ({ page }) => {
      await mockApplicationDetail(page, {
        id: 5,
        animal_name: 'Luna',
        shelter_name: 'Patitas Felices',
        shelter_city: 'Bogotá',
        user_email: 'adopter@example.com',
        status: 'interview',
        next_follow_up_due_at: '2099-01-01T00:00:00Z',
        created_at: '2026-01-10T00:00:00Z',
        events: [],
      });

      await loginAndNavigate(page, 'web_manager', '/es/web-manager/applications/5');

      await expect(page.getByRole('heading', { level: 1, name: 'Luna' })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(/adopter@example\.com/)).toBeVisible();
    },
  );

  test(
    'web manager sees the follow-up reminder on an interview application',
    { tag: [...ADOPTION_FOLLOWUP_REMINDER] },
    async ({ page }) => {
      await mockApplicationDetail(page, {
        id: 5,
        animal_name: 'Luna',
        shelter_name: 'Patitas Felices',
        shelter_city: 'Bogotá',
        user_email: 'adopter@example.com',
        status: 'interview',
        next_follow_up_due_at: '2099-01-01T00:00:00Z',
        created_at: '2026-01-10T00:00:00Z',
        events: [],
      });

      await loginAndNavigate(page, 'web_manager', '/es/web-manager/applications/5');

      await expect(page.getByText('Próximo recordatorio de seguimiento')).toBeVisible({
        timeout: 15_000,
      });
    },
  );

  test(
    'adopter can open a WhatsApp chat with the shelter',
    { tag: [...ADOPTION_WHATSAPP_APPLICANT] },
    async ({ page }) => {
      await mockApplicationDetail(page, {
        id: 5,
        animal_name: 'Luna',
        shelter_name: 'Patitas Felices',
        shelter_city: 'Bogotá',
        shelter_whatsapp: '+57 300 123 4567',
        status: 'interview',
        created_at: '2026-01-10T00:00:00Z',
        events: [],
      });

      await loginAndNavigate(page, 'adopter', '/es/my-applications/5');

      const cta = page.getByTestId('whatsapp-contact-cta');
      await expect(cta).toBeVisible({ timeout: 15_000 });
      await expect(cta).toHaveAttribute('href', /wa\.me\/573001234567/);
    },
  );

  test(
    'shelter admin can open a WhatsApp chat with the applicant',
    { tag: [...ADOPTION_WHATSAPP_SHELTER] },
    async ({ page }) => {
      await page.route('**/api/adoptions/**', (route: Route) => {
        const url = route.request().url();
        if (url.includes('/adoptions/5/')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 5,
              animal_name: 'Luna',
              user_email: 'adopter@example.com',
              shelter_name: 'Patitas Felices',
              status: 'interview',
              applicant_whatsapp: '+57 310 555 7788',
              events: [],
            }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 5,
              animal_name: 'Luna',
              user_email: 'adopter@example.com',
              status: 'interview',
              created_at: '2026-01-10T00:00:00Z',
              notes: '',
            },
          ]),
        });
      });

      await loginAndNavigate(page, 'shelter_admin', '/es/shelter/applications');

      await expect(
        page.getByRole('heading', { name: 'Solicitudes de Adopción' }),
      ).toBeVisible({ timeout: 15_000 });
      await page.getByRole('button', { name: 'Detalle' }).click();

      const cta = page.getByTestId('whatsapp-contact-cta');
      await expect(cta).toBeVisible({ timeout: 10_000 });
      await expect(cta).toHaveAttribute('href', /wa\.me\/573105557788/);
    },
  );
});
