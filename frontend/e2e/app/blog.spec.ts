import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  BLOG_BROWSE,
  BLOG_DETAIL,
  BLOG_ADMIN_LIST,
  BLOG_ADMIN_CREATE,
  BLOG_ADMIN_EDIT,
  BLOG_ADMIN_CALENDAR,
} from '../helpers/flow-tags';

const mockBlogPost = {
  id: 1,
  title: 'Cómo adoptar responsablemente',
  slug: 'como-adoptar-responsablemente',
  excerpt: 'Guía completa para una adopción exitosa.',
  content: '<p>Contenido del artículo sobre adopción responsable.</p>',
  category: 'adoption',
  category_display: 'Adopción',
  cover_image: '',
  author_name: 'Admin',
  published_at: '2026-03-01T12:00:00Z',
  created_at: '2026-03-01T12:00:00Z',
  status: 'published',
};

const mockBlogPost2 = {
  ...mockBlogPost,
  id: 2,
  title: 'Cuidados básicos para tu mascota',
  slug: 'cuidados-basicos-mascota',
  excerpt: 'Todo lo que necesitas saber para cuidar a tu mascota.',
};

const mockBlogListResponse = {
  results: [mockBlogPost, mockBlogPost2],
  count: 2,
  page: 1,
  page_size: 10,
  total_pages: 1,
};

test.describe('Blog — Public', () => {
  test.beforeEach(async ({ page }) => {
    // Mock blog detail API (must be registered before the list catch-all)
    await page.route('**/api/blog/como-adoptar-responsablemente/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBlogPost) }),
    );
    // Mock blog list API — catch-all for any query param combination
    await page.route('**/api/blog/**', (route) => {
      // Don't intercept detail page requests (already handled above)
      if (route.request().url().includes('/api/blog/como-adoptar')) return route.fallback();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBlogListResponse) });
    });
  });

  test('should display blog listing page with heading and filters', { tag: [...BLOG_BROWSE] }, async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Blog Mi Huella/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Buscar artículos/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adopción' })).toBeVisible();
  });

  test('should load blog posts from API', { tag: [...BLOG_BROWSE] }, async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    // Wait for at least one post card to appear (web-first assertion waits for React to render)
    await expect(page.getByTestId('post-card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('should navigate to blog post detail page', { tag: [...BLOG_DETAIL] }, async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    // Wait for post cards to render
    const firstPostLink = page.getByTestId('post-card').first();
    await expect(firstPostLink).toBeVisible({ timeout: 15_000 });
    await firstPostLink.click();

    // Should be on a blog detail page
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Should show back link and article heading
    const backLink = page.locator('main').getByRole('link', { name: 'Blog' }).first();
    await expect(backLink).toBeVisible();
  });
});

test.describe('Blog — Admin', () => {
  // quality: allow-serial (admin blog tests require sequential auth context)
  test.describe.configure({ mode: 'serial' });

  const mockAdminBlogListResponse = {
    results: [{ ...mockBlogPost, id: 1, status: 'published' }],
    count: 1,
    page: 1,
    page_size: 10,
    total_pages: 1,
  };

  test.beforeEach(async ({ page }) => {
    // Mock validate_token so fetchMe succeeds with mock tokens
    await page.route('**/api/auth/validate_token/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 1, email: 'admin@mihuella.com', first_name: 'Admin', last_name: 'Test', role: 'admin', is_staff: true, is_active: true } }),
      }),
    );
    // Mock admin blog API endpoints (catch-all)
    await page.route(/\/api\/blog\/admin\//, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminBlogListResponse) }),
    );
  });

  test('should display admin blog list for staff users', { tag: [...BLOG_ADMIN_LIST] }, async ({ page }) => {
    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Blog Posts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nuevo Post/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Calendario/i })).toBeVisible();
  });

  test('should display admin blog create page', { tag: [...BLOG_ADMIN_CREATE] }, async ({ page }) => {
    await loginAndNavigate(page, 'admin', '/admin/blog/crear');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Nuevo Blog Post/i })).toBeVisible();
    // Manual tab should be active by default
    await expect(page.getByRole('button', { name: 'Manual' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Importar JSON/i })).toBeVisible();
  });

  test('should display admin blog edit page', { tag: [...BLOG_ADMIN_EDIT] }, async ({ page }) => {
    // Mock the individual blog post endpoint for the edit page
    await page.route('**/api/blog/admin/1/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...mockBlogPost, id: 1, status: 'published' }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    // Wait for the "Editar" link to appear (list has loaded)
    const editLink = page.getByRole('link', { name: /Editar/i }).first();
    await expect(editLink).toBeVisible({ timeout: 15_000 });
    await editLink.click();

    // Should be on edit page
    await expect(page).toHaveURL(/\/admin\/blog\/\d+\/editar/);
    await expect(page.getByRole('heading', { name: /Editar Post/i })).toBeVisible();
  });

  test('should display admin blog calendar page', { tag: [...BLOG_ADMIN_CALENDAR] }, async ({ page }) => {
    await loginAndNavigate(page, 'admin', '/admin/blog/calendario');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Calendario del Blog/i })).toBeVisible();
    // Calendar navigation buttons
    await expect(page.getByRole('button', { name: /Anterior/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Siguiente/i })).toBeVisible();
    // Day headers
    await expect(page.getByText('Lun', { exact: true })).toBeVisible();
    await expect(page.getByText('Vie', { exact: true })).toBeVisible();
  });
});
