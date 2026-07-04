import { test, expect } from '../test-with-coverage';
import type { Page, Route } from '@playwright/test';
import { loginAndNavigate } from '../fixtures';
import {
  ADOPTION_EVENT_CREATE_WEB_MANAGER,
} from '../helpers/flow-tags';

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

      await expect(page.getByText(NEW_EVENT_DESCRIPTION)).toBeVisible({ timeout: 10_000 });
    },
  );
});
