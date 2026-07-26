import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  AUTH_LOGIN_INVALID,
  AUTH_PROTECTED_REDIRECT,
  AUTH_SIGN_IN_FORM,
  AUTH_SIGN_OUT,
  AUTH_SIGN_UP_FORM,
} from '../helpers/flow-tags';

test.describe('Auth — Sign-in form', () => {
  test('renders email and password fields and lets the user type', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Iniciar sesión/i, level: 1 })).toBeVisible({ timeout: 10_000 });

    const emailInput = page.getByLabel('Correo electrónico');
    const passwordInput = page.getByLabel('Contraseña', { exact: true });
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('user@example.com');
    await passwordInput.fill('hunter2!');

    await expect(emailInput).toHaveValue('user@example.com');
    await expect(passwordInput).toHaveValue('hunter2!');

    await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeEnabled();
  });

  test('exposes the forgot-password and registration links', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    await expect(page.getByRole('link', { name: /¿olvidaste tu contraseña\?/i })).toHaveAttribute('href', /\/forgot-password$/);
    await expect(page.getByRole('link', { name: /(crear cuenta|regístrate|registrate)/i })).toHaveAttribute('href', /\/sign-up$/);
  });
});

test.describe('Auth — Login invalid', () => {
  test('keeps the user on /sign-in and shows an error when credentials are rejected', { tag: [...AUTH_LOGIN_INVALID] }, async ({ page }) => {
    await page.route('**/google-captcha/site-key/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ site_key: '' }),
      }),
    );
    await page.route('**/auth/sign_in/**', (route: any) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciales inválidas' }),
      }),
    );

    await page.goto('/sign-in');
    await waitForPageLoad(page);

    await page.getByLabel('Correo electrónico').fill('wrong@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('badpassword');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();

    await expect(page.getByText(/Credenciales inválidas/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Auth — Sign-up form', () => {
  test('renders all required registration fields and the terms checkbox', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /crear cuenta/i, level: 1 })).toBeVisible({ timeout: 10_000 });

    await expect(page.getByLabel('Nombre')).toBeVisible();
    await expect(page.getByLabel('Apellido')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  test('blocks submission when terms checkbox is not checked', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.getByLabel('Nombre').fill('Test');
    await page.getByLabel('Apellido').fill('User');
    await page.getByLabel('Correo electrónico').fill('newuser@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('Str0ngPass!');
    await page.getByLabel('Confirmar contraseña').fill('Str0ngPass!');

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  });

  test('shows a mismatch error when password and confirm-password differ', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.getByLabel('Nombre').fill('Test');
    await page.getByLabel('Apellido').fill('User');
    await page.getByLabel('Correo electrónico').fill('newuser@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('Str0ngPass!');
    await page.getByLabel('Confirmar contraseña').fill('DifferentPass!');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe('Auth — Protected route redirect', () => {
  test('unauthenticated visit to a protected route redirects to /sign-in', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    await page.goto('/my-applications/1/history');
    await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated visit to /admin/payments redirects to /sign-in', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Auth — Sign out', () => {
  test('clicking Salir in the account menu ends the real session and redirects to /sign-in', { tag: [...AUTH_SIGN_OUT, '@outcome:success'] }, async ({ page }) => {
    // Seeds real access_token/refresh_token cookies (loginAndNavigate) and lands on
    // a useRequireAuth()-gated page, so the redirect below is driven by the same
    // client-side auth-teardown wiring a real signed-in user hits.
    await loginAndNavigate(page, 'adopter', '/my-profile/notifications');

    // Precondition: prove a real session cookie exists before sign-out, so the
    // post-sign-out absence check below demonstrates removal — not a vacuous
    // pass against a session that was never seeded (e.g. a cookie-domain bug).
    const cookiesBeforeSignOut = await page.context().cookies();
    expect(cookiesBeforeSignOut.some((cookie) => cookie.name === 'access_token')).toBe(true);

    // Act: open the real account menu and click the real, unmocked "Salir" item —
    // this is the exact DOM path Header.tsx wires to useAuthStore().signOut().
    await page.getByRole('button', { name: 'Abrir menú de cuenta' }).filter({ visible: true }).click();
    await page.getByRole('menuitem', { name: 'Salir' }).click();

    // Assert (a): the app actually redirects to /sign-in after sign-out.
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);

    // Assert (b): concrete negative-space check on the real browser cookie jar —
    // catches a cookie path/domain mismatch that would leave the session alive
    // even though the UI already redirected to /sign-in.
    const cookiesAfterSignOut = await page.context().cookies();
    expect(cookiesAfterSignOut.some((cookie) => cookie.name === 'access_token')).toBe(false);
  });
});
