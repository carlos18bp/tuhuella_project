import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  BLOG_BROWSE,
  BLOG_DETAIL,
  BLOG_ADMIN_LIST,
  BLOG_ADMIN_CREATE,
  BLOG_ADMIN_EDIT,
  BLOG_ADMIN_CALENDAR,
} from '../helpers/flow-tags';

test.describe('Blog — Public', () => {
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

    // Wait for the blog API response
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/blog/') && resp.status() === 200,
      { timeout: 10_000 },
    );

    // Should render at least one post card or a featured post
    const articles = page.locator('a[href*="/blog/"]');
    await expect(articles.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to blog post detail page', { tag: [...BLOG_DETAIL] }, async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    // Wait for posts to load
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/blog/') && resp.status() === 200,
      { timeout: 10_000 },
    );

    // Click on the first blog post link
    const firstPostLink = page.locator('a[href*="/blog/"]').first();
    await expect(firstPostLink).toBeVisible({ timeout: 10_000 });
    await firstPostLink.click();

    // Should be on a blog detail page
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Should show back link and article heading
    const backLink = page.getByRole('link', { name: 'Blog' });
    await expect(backLink).toBeVisible();
  });
});

test.describe('Blog — Admin', () => {
  // quality: allow-serial (admin blog tests require sequential auth context)
  test.describe.configure({ mode: 'serial' });

  test('should display admin blog list for staff users', { tag: [...BLOG_ADMIN_LIST] }, async ({ page }) => {
    // Login as admin
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    await page.getByLabel(/correo/i).fill('admin@mihuella.com');
    await page.getByLabel(/contraseña/i).fill('admin123456');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/.*/, { timeout: 10_000 });

    // Navigate to admin blog
    await page.goto('/admin/blog');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Blog Posts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nuevo Post/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Calendario/i })).toBeVisible();
  });

  test('should display admin blog create page', { tag: [...BLOG_ADMIN_CREATE] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    await page.getByLabel(/correo/i).fill('admin@mihuella.com');
    await page.getByLabel(/contraseña/i).fill('admin123456');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/.*/, { timeout: 10_000 });

    await page.goto('/admin/blog/crear');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Nuevo Blog Post/i })).toBeVisible();
    // Manual tab should be active by default
    await expect(page.getByRole('button', { name: 'Manual' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Importar JSON/i })).toBeVisible();
  });

  test('should display admin blog edit page', { tag: [...BLOG_ADMIN_EDIT] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    await page.getByLabel(/correo/i).fill('admin@mihuella.com');
    await page.getByLabel(/contraseña/i).fill('admin123456');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/.*/, { timeout: 10_000 });

    // Go to admin blog list first
    await page.goto('/admin/blog');
    await waitForPageLoad(page);

    // Wait for posts to load
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/blog/admin/') && resp.status() === 200,
      { timeout: 10_000 },
    );

    // Click the first "Editar" link
    const editLink = page.getByRole('link', { name: /Editar/i }).first();
    await expect(editLink).toBeVisible({ timeout: 10_000 });
    await editLink.click();

    // Should be on edit page
    await expect(page).toHaveURL(/\/admin\/blog\/\d+\/editar/);
    await expect(page.getByRole('heading', { name: /Editar Post/i })).toBeVisible();
  });

  test('should display admin blog calendar page', { tag: [...BLOG_ADMIN_CALENDAR] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);
    await page.getByLabel(/correo/i).fill('admin@mihuella.com');
    await page.getByLabel(/contraseña/i).fill('admin123456');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/.*/, { timeout: 10_000 });

    await page.goto('/admin/blog/calendario');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Calendario del Blog/i })).toBeVisible();
    // Calendar navigation buttons
    await expect(page.getByRole('button', { name: /Anterior/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Siguiente/i })).toBeVisible();
    // Day headers
    await expect(page.getByText('Lun')).toBeVisible();
    await expect(page.getByText('Vie')).toBeVisible();
  });
});
