import { test, expect } from '../test-with-coverage';
import type { Page, Route } from '@playwright/test';
import { loginAndNavigate } from '../fixtures';
import {
  ADOPTION_EVENT_CREATE_WEB_MANAGER,
  ADOPTION_EVENT_CREATE_SHELTER,
} from '../helpers/flow-tags';

const SHELTER_APPLICATION_LIST = [
  {
    id: 5,
    animal_name: 'Luna',
    user_email: 'adopter@example.com',
    status: 'interview',
    created_at: '2026-01-10T00:00:00Z',
    notes: '',
  },
];

const SHELTER_APPLICATION_DETAIL = {
  id: 5,
  animal_name: 'Luna',
  user_email: 'adopter@example.com',
  shelter_name: 'Patitas Felices',
  status: 'interview',
  created_at: '2026-01-10T00:00:00Z',
  applicant_whatsapp: '',
  events: [],
};

/** Serve the shelter applications list, the expanded detail, and the created event. */
async function mockShelterApplications(page: Page) {
  await page.route('**/api/adoptions/**', (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (url.includes('/events/') && request.method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 88,
          application: 5,
          event_date: '2026-02-01T10:00:00Z',
          description: SHELTER_EVENT_DESCRIPTION,
          created_by: 3,
          created_by_name: 'María López',
          created_by_role: 'shelter_admin',
          created_by_email: 'shelter-e2e@example.com',
          created_at: '2026-02-01T10:05:00Z',
        }),
      });
    }
    if (url.includes('/adoptions/5/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SHELTER_APPLICATION_DETAIL),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SHELTER_APPLICATION_LIST),
    });
  });
}

const SHELTER_EVENT_DESCRIPTION = 'Visita domiciliaria realizada con éxito.';

const INTERVIEW_APPLICATION = {
  id: 5,
  animal_name: 'Luna',
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  user_email: 'adopter@example.com',
  status: 'interview',
  next_follow_up_due_at: '2099-01-01T00:00:00Z',
  created_at: '2026-01-10T00:00:00Z',
  events: [],
};

const NEW_EVENT_DESCRIPTION = 'Llamada de seguimiento con el adoptante realizada.';

/** Serve the interview application on GET and a created event on POST /events/. */
async function mockApplicationAndEvents(page: Page) {
  await page.route('**/api/adoptions/5/**', (route: Route) => {
    const request = route.request();
    if (request.url().includes('/events/') && request.method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 77,
          application: 5,
          event_date: '2026-02-01T10:00:00Z',
          description: NEW_EVENT_DESCRIPTION,
          created_by: 9,
          created_by_name: 'Laura Gómez',
          created_by_role: 'web_manager',
          created_by_email: 'webmanager-e2e@example.com',
          created_at: '2026-02-01T10:05:00Z',
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(INTERVIEW_APPLICATION),
    });
  });
}

test.describe('Adoption event creation', () => {
  test(
    'web manager registers a follow-up event on an interview application',
    { tag: [...ADOPTION_EVENT_CREATE_WEB_MANAGER] },
    async ({ page }) => {
      await mockApplicationAndEvents(page);

      await loginAndNavigate(page, 'web_manager', '/es/web-manager/applications/5');

      await expect(page.getByRole('heading', { level: 1, name: 'Luna' })).toBeVisible({
        timeout: 15_000,
      });

      await page.getByTestId('event-add-button').click();
      await page.getByTestId('event-description-input').fill(NEW_EVENT_DESCRIPTION);

      const createResponse = page.waitForResponse(
        (res) => res.url().includes('/adoptions/5/events/') && res.request().method() === 'POST',
      );
      await page.getByTestId('event-submit').click();
      await createResponse;

      // Scoped to the timeline row on purpose: React mirrors a controlled
      // textarea's value into the DOM as its child text, so between the POST
      // response and the modal unmounting the description exists twice. A bare
      // getByText then dies of strict mode instead of waiting it out — that is
      // the "resolved to 2 elements" flake, the <p> plus the <textarea>.
      const created = page.getByTestId('event-item').filter({ hasText: NEW_EVENT_DESCRIPTION });
      await expect(created).toHaveCount(1, { timeout: 10_000 });
      // Author comes from the POST response, so the row is rendered from what
      // the server returned and not from what was typed into the form.
      await expect(created).toContainText('Laura Gómez');
    },
  );

  test(
    'shelter admin registers a follow-up event from the applications list',
    { tag: [...ADOPTION_EVENT_CREATE_SHELTER] },
    async ({ page }) => {
      await mockShelterApplications(page);

      await loginAndNavigate(page, 'shelter_admin', '/es/shelter/applications');

      await expect(
        page.getByRole('heading', { name: 'Solicitudes de Adopción' }),
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole('button', { name: 'Detalle' }).click();

      await page.getByTestId('event-add-button').click();
      await page.getByTestId('event-description-input').fill(SHELTER_EVENT_DESCRIPTION);

      const createResponse = page.waitForResponse(
        (res) => res.url().includes('/adoptions/5/events/') && res.request().method() === 'POST',
      );
      await page.getByTestId('event-submit').click();
      await createResponse;

      // Same reason as above: the modal's textarea holds the same text until it
      // unmounts, so the assertion is scoped to the created timeline row.
      const created = page.getByTestId('event-item').filter({ hasText: SHELTER_EVENT_DESCRIPTION });
      await expect(created).toHaveCount(1, { timeout: 10_000 });
      await expect(created).toContainText('María López');
    },
  );
});
