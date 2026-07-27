import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  BLOG_BROWSE,
  BLOG_DETAIL,
  BLOG_ADMIN_LIST,
  BLOG_ADMIN_CREATE,
  BLOG_ADMIN_EDIT,
  BLOG_ADMIN_CALENDAR,
  BLOG_ADMIN_DELETE,
  BLOG_ADMIN_DUPLICATE,
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

  test('should display blog listing page with heading and filters', { tag: [...BLOG_BROWSE, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.locator('header').getByRole('link', { name: 'Blog' }).click();
    await page.waitForURL(/\/blog$/, { timeout: 15_000 });
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

  test('should navigate to blog post detail page', { tag: [...BLOG_DETAIL, '@outcome:display'] }, async ({ page }) => {
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

  test('shows an error message when the blog listing API fails', { tag: [...BLOG_BROWSE, '@outcome:failure'] }, async ({ page }) => {
    // quality: allow-no-interaction (public failure render on load — the error state IS
    // the behavior under test; there is no interactive surface to click before it renders)
    // blogStore.fetchPosts stores the raw Axios error message (blogStore.ts:70-88), not
    // app copy — the error container (blog/page.tsx:219-222) shows it verbatim.
    await page.route('**/api/blog/**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Internal Server Error' }) }),
    );

    await page.goto('/blog');
    await waitForPageLoad(page);

    await expect(page.getByText(/request failed with status code 500/i)).toBeVisible({ timeout: 15_000 });
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

  test('should display admin blog list for staff users', { tag: [...BLOG_ADMIN_LIST, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (authenticated display test: loginAndNavigate is API-based by design; content is asserted with concrete values)
    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Blog Posts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nuevo Post/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Calendario/i })).toBeVisible();
  });

  test('should display admin blog create page', { tag: [...BLOG_ADMIN_CREATE, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (authenticated display render: loginAndNavigate is API-based by design; form structure asserted)
    await loginAndNavigate(page, 'admin', '/admin/blog/crear');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Nuevo Blog Post/i })).toBeVisible();
    // Manual tab should be active by default
    await expect(page.getByRole('button', { name: 'Manual' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Importar JSON/i })).toBeVisible();
  });

  test('creates a new blog post and redirects to its edit page', { tag: [...BLOG_ADMIN_CREATE, '@outcome:success'] }, async ({ page }) => {
    // Registered after the describe-level beforeEach's admin-blog catch-all so it wins for create.
    await page.route('**/api/blog/admin/create/**', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 77, title: 'Nuevo post E2E', slug: 'nuevo-post-e2e' }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/blog/crear');
    await waitForPageLoad(page);

    await page.getByLabel('Título (ES)').fill('Nuevo post E2E');
    await page.getByLabel('Title (EN)').fill('New E2E Post');
    await page.getByLabel('Resumen (ES)').fill('Resumen del post de prueba.');
    await page.getByLabel('Excerpt (EN)').fill('Summary of the test post.');
    await page.getByRole('button', { name: 'Crear Post' }).click();

    // handleManualSubmit redirects to the edit page for the created post, not the list
    // (admin/blog/crear/page.tsx:90) — a stale assumption here would silently pass on a
    // create that never actually reached the API.
    await expect(page).toHaveURL(/\/admin\/blog\/77\/editar/, { timeout: 10_000 });
  });

  test('shows the API validation error when creating a post is rejected', { tag: [...BLOG_ADMIN_CREATE, '@outcome:error'] }, async ({ page }) => {
    // blogStore.createPost has no try/catch, so any non-2xx response propagates as the raw
    // AxiosError (admin/blog/crear/page.tsx:89-92 only reads `err.message`, never the response
    // body) — the field-shaped body here documents intent but the surfaced text is Axios's own.
    await page.route('**/api/blog/admin/create/**', (route) =>
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ title_es: ['Este campo es requerido.'] }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/blog/crear');
    await waitForPageLoad(page);

    await page.getByLabel('Título (ES)').fill('Título incompleto');
    await page.getByLabel('Title (EN)').fill('Incomplete title');
    await page.getByLabel('Resumen (ES)').fill('Resumen');
    await page.getByLabel('Excerpt (EN)').fill('Summary');
    await page.getByRole('button', { name: 'Crear Post' }).click();

    await expect(page.getByText('Request failed with status code 400')).toBeVisible({ timeout: 10_000 });
  });

  test('shows an error message when creating a post fails at the server', { tag: [...BLOG_ADMIN_CREATE, '@outcome:failure'] }, async ({ page }) => {
    await page.route('**/api/blog/admin/create/**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Internal Server Error' }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/blog/crear');
    await waitForPageLoad(page);

    await page.getByLabel('Título (ES)').fill('Título con fallo de servidor');
    await page.getByLabel('Title (EN)').fill('Server failure title');
    await page.getByLabel('Resumen (ES)').fill('Resumen');
    await page.getByLabel('Excerpt (EN)').fill('Summary');
    await page.getByRole('button', { name: 'Crear Post' }).click();

    await expect(page.getByText('Request failed with status code 500')).toBeVisible({ timeout: 10_000 });
  });

  test('should display admin blog edit page', { tag: [...BLOG_ADMIN_EDIT, '@outcome:display'] }, async ({ page }) => {
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

  test('saves changes to an existing blog post', { tag: [...BLOG_ADMIN_EDIT, '@outcome:success'] }, async ({ page }) => {
    // Blanket handler answers GET (initial load + post-save re-fetch) and PATCH (save)
    // alike — sufficient here since the assertion only needs the save to return 2xx.
    await page.route('**/api/blog/admin/1/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...mockBlogPost, id: 1, status: 'published' }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    const editLink = page.getByRole('link', { name: /Editar/i }).first();
    await expect(editLink).toBeVisible({ timeout: 15_000 });
    await editLink.click();

    await expect(page).toHaveURL(/\/admin\/blog\/\d+\/editar/);

    await page.getByLabel('Título (ES)').fill('Cómo adoptar responsablemente (actualizado)');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Post guardado correctamente.')).toBeVisible({ timeout: 10_000 });
  });

  test('shows an error message when saving blog post changes fails', { tag: [...BLOG_ADMIN_EDIT, '@outcome:error'] }, async ({ page }) => {
    // blogStore.updatePost has no try/catch either — same raw-Axios-message behavior as
    // blog-admin-create (page.tsx:92-93 only reads `err.message`).
    await page.route('**/api/blog/admin/1/**', (route) => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ title_es: ['Este campo es requerido.'] }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...mockBlogPost, id: 1, status: 'published' }) });
    });

    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    const editLink = page.getByRole('link', { name: /Editar/i }).first();
    await expect(editLink).toBeVisible({ timeout: 15_000 });
    await editLink.click();

    await expect(page).toHaveURL(/\/admin\/blog\/\d+\/editar/);

    await page.getByLabel('Título (ES)').fill('Intento de guardado fallido');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Request failed with status code 400')).toBeVisible({ timeout: 10_000 });
  });

  test('should display admin blog calendar page', { tag: [...BLOG_ADMIN_CALENDAR] }, async ({ page }) => {
    // Calendar endpoint returns an array, not paginated — override the beforeEach catch-all
    await page.route(/\/api\/blog\/admin\/calendar/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

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

  test('should delete a blog post with confirmation dialog', { tag: [...BLOG_ADMIN_DELETE] }, async ({ page }) => {
    let deleteRequested = false;
    await page.route(/\/api\/blog\/admin\/1\/delete/, (route) => {
      deleteRequested = true;
      return route.fulfill({ status: 204, body: '' });
    });
    // After delete, the list re-fetches and returns empty
    await page.route(/\/api\/blog\/admin\//, (route) => {
      if (route.request().url().includes('/delete')) return route.fallback();
      const body = deleteRequested
        ? { results: [], count: 0, page: 1, page_size: 10, total_pages: 1 }
        : { results: [{ ...mockBlogPost, id: 1, status: 'published' }], count: 1, page: 1, page_size: 10, total_pages: 1 };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    // Click Eliminar button on the post
    const deleteBtn = page.getByRole('button', { name: /Eliminar/i }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 15_000 });
    await deleteBtn.click();

    // Confirmation dialog appears
    const dialog = page.getByRole('dialog', { name: /Eliminar post/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/no se puede deshacer/i)).toBeVisible();

    // Confirm deletion
    await dialog.getByRole('button', { name: /Eliminar/i }).click();

    // Post should be removed from the list
    await expect(page.getByText('No hay posts aún')).toBeVisible({ timeout: 10_000 });
  });

  test('should duplicate a blog post with confirmation dialog', { tag: [...BLOG_ADMIN_DUPLICATE] }, async ({ page }) => {
    let duplicated = false;
    const duplicatedPost = { ...mockBlogPost, id: 3, title: 'Copia de Cómo adoptar responsablemente', slug: 'copia-como-adoptar', status: 'draft', is_published: false };
    await page.route(/\/api\/blog\/admin\/1\/duplicate/, (route) => {
      duplicated = true;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(duplicatedPost) });
    });
    // After duplicate, the list re-fetches and includes the new post
    await page.route(/\/api\/blog\/admin\//, (route) => {
      if (route.request().url().includes('/duplicate')) return route.fallback();
      const results = duplicated
        ? [{ ...mockBlogPost, id: 1, status: 'published' }, duplicatedPost]
        : [{ ...mockBlogPost, id: 1, status: 'published' }];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results, count: results.length, page: 1, page_size: 10, total_pages: 1 }) });
    });

    await loginAndNavigate(page, 'admin', '/admin/blog');
    await waitForPageLoad(page);

    // Click Duplicar button on the post
    const duplicateBtn = page.getByRole('button', { name: /Duplicar/i }).first();
    await expect(duplicateBtn).toBeVisible({ timeout: 15_000 });
    await duplicateBtn.click();

    // Confirmation dialog appears
    const dialog = page.getByRole('dialog', { name: /Duplicar post/i });
    await expect(dialog).toBeVisible();

    // Confirm duplication
    await dialog.getByRole('button', { name: /Duplicar/i }).click();

    // Duplicated post should appear in the list
    await expect(page.locator('table').getByText('Copia de Cómo adoptar responsablemente')).toBeVisible({ timeout: 10_000 });
  });
});
