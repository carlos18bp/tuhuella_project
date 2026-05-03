import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  AUTH_LOGIN_INVALID,
  AUTH_PROTECTED_REDIRECT,
  AUTH_SIGN_IN_FORM,
  AUTH_SIGN_UP_FORM,
} from '../helpers/flow-tags';

test.describe('Auth — Sign-in form', () => {
  test('renders email and password fields and lets the user type', { tag: [...AUTH_SIGN_IN_FORM] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Iniciar sesión/i, level: 1 })).toBeVisible({ timeout: 10_000 });

    const emailInput = page.locator('#signin-email');
    const passwordInput = page.locator('#signin-password');
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

    await page.locator('#signin-email').fill('wrong@example.com');
    await page.locator('#signin-password').fill('badpassword');
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

    await expect(page.locator('#signup-firstname')).toBeVisible();
    await expect(page.locator('#signup-lastname')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  test('blocks submission when terms checkbox is not checked', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.locator('#signup-firstname').fill('Test');
    await page.locator('#signup-lastname').fill('User');
    await page.locator('input[type="email"]').first().fill('newuser@example.com');
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill('Str0ngPass!');
    await passwords.nth(1).fill('Str0ngPass!');

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  });

  test('shows a mismatch error when password and confirm-password differ', { tag: [...AUTH_SIGN_UP_FORM] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.locator('#signup-firstname').fill('Test');
    await page.locator('#signup-lastname').fill('User');
    await page.locator('input[type="email"]').first().fill('newuser@example.com');
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill('Str0ngPass!');
    await passwords.nth(1).fill('DifferentPass!');
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
