import { test, expect } from '../test-with-coverage';
import { loginAndNavigate } from '../fixtures';
import {
  ADOPTION_TRACK,
  ADOPTION_MANAGE,
  ADOPTION_DETAIL_ADOPTER,
  ADOPTION_WHATSAPP_SHELTER,
  ADOPTION_WHATSAPP_APPLICANT,
  ADOPTION_EVENT_CREATE_SHELTER,
} from '../helpers/flow-tags';

const baseApp = {
  id: 1,
  animal: 1,
  animal_name: 'Luna',
  animal_species: 'dog',
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  thumbnail_url: null,
  user: 1,
  user_email: 'adopter-e2e@example.com',
  form_answers: { reason: 'Love animals' },
  notes: '',
  reviewed_at: null,
  created_at: '2026-04-20T12:00:00Z',
};

const interviewEvent = {
  id: 10,
  application: 1,
  event_date: '2026-05-01T10:00:00Z',
  description: 'Llamada inicial con el adoptante para coordinar la entrevista por WhatsApp.',
  created_by: 99,
  created_by_name: 'Refugio Patitas Felices',
  created_by_role: 'shelter_admin',
  created_by_email: 'shelter-e2e@example.com',
  created_at: '2026-05-01T10:00:00Z',
};

test.describe('Adoption Interview Flow', () => {
  test('adopter sees WhatsApp card and event timeline when status is interview', { tag: [...ADOPTION_TRACK, ...ADOPTION_DETAIL_ADOPTER, ...ADOPTION_WHATSAPP_SHELTER] }, async ({ page }) => {
    await page.route('**/api/adoptions/1/**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...baseApp,
            status: 'interview',
            shelter_whatsapp: '+57 300 111 2233',
            next_follow_up_due_at: '2026-05-09T12:00:00Z',
            events: [interviewEvent],
          }),
        });
      }
      return route.fallback();
    });

    await loginAndNavigate(page, 'adopter', '/my-applications/1');

    const whatsappCta = page.getByTestId('whatsapp-contact-cta');
    await expect(whatsappCta).toBeVisible({ timeout: 10_000 });
    await expect(whatsappCta).toHaveAttribute('href', /wa\.me\/573001112233/);

    const eventItems = page.getByTestId('event-item');
    await expect(eventItems).toHaveCount(1);
    await expect(eventItems.first()).toContainText('Llamada inicial con el adoptante');
  });

  test('adopter does not see WhatsApp card when status is submitted', { tag: [...ADOPTION_TRACK] }, async ({ page }) => {
    await page.route('**/api/adoptions/1/**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...baseApp,
            status: 'submitted',
            shelter_whatsapp: null,
            applicant_whatsapp: null,
            events: [],
          }),
        });
      }
      return route.fallback();
    });

    await loginAndNavigate(page, 'adopter', '/my-applications/1');

    await expect(page.getByRole('heading', { name: 'Luna' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('whatsapp-contact-cta')).toHaveCount(0);
  });

  // quality: disable test_too_long (multi-step adoption interview event flow must be atomic — login + modal + timeline verification)
  test('shelter admin records an event from the applications list', { tag: [...ADOPTION_MANAGE, ...ADOPTION_EVENT_CREATE_SHELTER] }, async ({ page }) => {
    let postBody: { event_date?: string; description?: string } | null = null;

    const interviewListItem = {
      ...baseApp,
      status: 'interview',
      shelter_whatsapp: '+57 300 111 2233',
      applicant_whatsapp: '+57 311 222 3344',
      next_follow_up_due_at: '2026-05-09T12:00:00Z',
    };

    await page.route('**/api/adoptions/', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([interviewListItem]),
        });
      }
      return route.fallback();
    });

    await page.route('**/api/adoptions/1/', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...interviewListItem, events: [] }),
        });
      }
      return route.fallback();
    });

    await page.route('**/api/adoptions/1/events/', async (route) => {
      if (route.request().method() === 'POST') {
        postBody = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 42,
            application: 1,
            event_date: postBody?.event_date ?? '2026-05-04T10:00:00Z',
            description: postBody?.description ?? '',
            created_by: 99,
            created_by_name: 'Refugio Patitas Felices',
            created_by_role: 'shelter_admin',
            created_by_email: 'shelter-e2e@example.com',
            created_at: '2026-05-04T10:00:00Z',
          }),
        });
      }
      return route.fallback();
    });

    await loginAndNavigate(page, 'shelter_admin', '/shelter/applications');

    await expect(page.getByRole('heading', { name: 'Luna' })).toBeVisible({ timeout: 10_000 });

    // quality: disable fragile_locator (role+name is Playwright's recommended stable pattern when no test-id is present on this button)
    await page.getByRole('button', { name: 'Detalle' }).click();

    const addEventButton = page.getByTestId('event-add-button');
    await expect(addEventButton).toBeVisible({ timeout: 10_000 });
    await addEventButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByTestId('event-description-input').fill(
      'Entrevista por WhatsApp realizada satisfactoriamente.',
    );
    await page.getByTestId('event-submit').click();

    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 });

    await expect.poll(() => postBody?.description ?? null, { timeout: 5_000 }).toContain(
      'Entrevista por WhatsApp',
    );
    await expect.poll(() => postBody?.event_date ?? null).not.toBeNull();

    const eventItems = page.getByTestId('event-item');
    await expect(eventItems).toHaveCount(1);
    // quality: disable fragile_locator (.first() on a getByTestId collection is deterministic when mock returns exactly 1 item)
    await expect(eventItems.first()).toContainText('Entrevista por WhatsApp');
  });

  test('shelter admin can contact the applicant via WhatsApp', { tag: [...ADOPTION_WHATSAPP_APPLICANT] }, async ({ page }) => {
    const interviewListItem = {
      ...baseApp,
      status: 'interview',
      shelter_whatsapp: '+57 300 111 2233',
      applicant_whatsapp: '+57 311 222 3344',
      next_follow_up_due_at: '2026-07-12T12:00:00Z',
    };

    await page.route('**/api/adoptions/', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([interviewListItem]),
        });
      }
      return route.fallback();
    });

    await page.route('**/api/adoptions/1/', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...interviewListItem, events: [] }),
        });
      }
      return route.fallback();
    });

    await loginAndNavigate(page, 'shelter_admin', '/shelter/applications');

    await expect(page.getByRole('heading', { name: 'Luna' })).toBeVisible({ timeout: 10_000 });

    // quality: disable fragile_locator (role+name is Playwright's recommended stable pattern when no test-id is present on this button)
    await page.getByRole('button', { name: 'Detalle' }).click();

    const whatsappCta = page.getByTestId('whatsapp-contact-cta');
    await expect(whatsappCta).toBeVisible({ timeout: 10_000 });
    await expect(whatsappCta).toHaveAttribute('href', /wa\.me\/573112223344/);
  });
});
