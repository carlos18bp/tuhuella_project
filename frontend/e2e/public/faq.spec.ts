import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { PUBLIC_FAQ } from '../helpers/flow-tags';

const mockFAQTopics = [
  {
    id: 1,
    slug: 'adopcion',
    display_name: 'Adopción',
    items: [
      { question: '¿Cómo funciona el proceso de adopción?', answer: 'Explora los animales disponibles en nuestra plataforma y completa el formulario de adopción.' },
      { question: '¿Cómo sé si un refugio es confiable?', answer: 'Todos los refugios en nuestra plataforma son verificados por nuestro equipo.' },
    ],
  },
  {
    id: 2,
    slug: 'apadrinamiento',
    display_name: 'Apadrinamiento',
    items: [
      { question: '¿Puedo apadrinar en vez de adoptar?', answer: 'Tu aporte mensual o único ayuda a cubrir gastos de alimentación y cuidado veterinario.' },
    ],
  },
];

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock FAQ API to ensure test data is always available
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFAQTopics) }),
    );
  });

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

    // Verify FAQ questions are visible (accordion button text)
    await expect(page.getByText(/¿Cómo funciona el proceso de adopción/i)).toBeVisible();
    await expect(page.getByText(/¿Puedo apadrinar en vez de adoptar/i)).toBeVisible();
    await expect(page.getByText(/¿Cómo sé si un refugio es confiable/i)).toBeVisible();
  });

  test('should display FAQ answers alongside questions', { tag: [...PUBLIC_FAQ] }, async ({ page }) => {
    await page.goto('/faq');
    await waitForPageLoad(page);

    // Click on accordion items to expand them (answers are collapsed by default)
    await page.getByText(/¿Cómo funciona el proceso de adopción/i).click();
    await expect(page.getByText(/Explora los animales disponibles/i)).toBeVisible();

    await page.getByText(/¿Puedo apadrinar en vez de adoptar/i).click();
    await expect(page.getByText(/Tu aporte mensual o único/i)).toBeVisible();
  });
});
