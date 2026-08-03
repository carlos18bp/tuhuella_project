import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  AUTH_FORGOT_PASSWORD_FORM,
  AUTH_FORGOT_PASSWORD_RESET,
  AUTH_LOGIN_INVALID,
  AUTH_LOGIN_REDIRECT,
  AUTH_PROTECTED_REDIRECT,
  AUTH_SESSION_PERSISTENCE,
  AUTH_SIGN_IN_FORM,
  AUTH_SIGN_OUT,
  AUTH_SIGN_UP_FORM,
  AUTH_SIGN_UP_SUCCESS,
} from '../helpers/flow-tags';

test.describe('Auth — Sign-in form', () => {
  test('renders email and password fields and lets the user type', { tag: [...AUTH_SIGN_IN_FORM, '@outcome:display'] }, async ({ page }) => {
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

  test('exposes the forgot-password and registration links', { tag: [...AUTH_SIGN_IN_FORM, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    await expect(page.getByRole('link', { name: /¿olvidaste tu contraseña\?/i })).toHaveAttribute('href', /\/forgot-password$/);
    await expect(page.getByRole('link', { name: /(crear cuenta|regístrate|registrate)/i })).toHaveAttribute('href', /\/sign-up$/);
  });
});

test.describe('Auth — Login invalid', () => {
  test('keeps the user on /sign-in and shows an error when credentials are rejected', { tag: [...AUTH_LOGIN_INVALID, '@outcome:error'] }, async ({ page }) => {
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
  // Visibility alone said nothing about whether the fields WORK: a disabled or
  // read-only input, or one whose value never binds, is visible all the same. This
  // mirrors the sign-in spec above — type into each field and read the value back,
  // and check the terms box actually toggles. Fails if a registration field stops
  // accepting input, which no toBeVisible assertion can see.
  test('renders all required registration fields and lets the user fill them', { tag: [...AUTH_SIGN_UP_FORM, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /crear cuenta/i, level: 1 })).toBeVisible({ timeout: 10_000 });

    const nombre = page.getByLabel('Nombre');
    const apellido = page.getByLabel('Apellido');
    const email = page.getByLabel('Correo electrónico');
    const password = page.getByLabel('Contraseña', { exact: true });

    await nombre.fill('Camila');
    await apellido.fill('Restrepo');
    await email.fill('camila@example.com');
    await password.fill('Str0ngPass!');

    await expect(nombre).toHaveValue('Camila');
    await expect(apellido).toHaveValue('Restrepo');
    await expect(email).toHaveValue('camila@example.com');
    await expect(password).toHaveValue('Str0ngPass!');

    const terms = page.getByRole('checkbox');
    await terms.check();
    await expect(terms).toBeChecked();
  });

  test('blocks submission when terms checkbox is not checked', { tag: [...AUTH_SIGN_UP_FORM, '@outcome:error'] }, async ({ page }) => {
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

  test('shows a mismatch error when password and confirm-password differ', { tag: [...AUTH_SIGN_UP_FORM, '@outcome:error'] }, async ({ page }) => {
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

test.describe('Auth — Forgot password form', () => {
  test('should display forgot password form', { tag: [...AUTH_FORGOT_PASSWORD_FORM, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (public form's static content on load — the
    // click-through arrival is already driven by the sibling 'should navigate from
    // sign-in to forgot password' test below; this test's only job is pinning the
    // field/button/link set via concrete accessible-name locators)
    await page.goto('/forgot-password');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByRole('heading', { name: /Recuperar contraseña/i })).toBeVisible();

    // Step A: email input and send code button
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Enviar código de verificación/i })).toBeVisible();

    // Link back to sign-in
    await expect(page.getByRole('link', { name: /Volver a iniciar sesión/i })).toBeVisible();
  });

  test('should navigate from sign-in to forgot password', { tag: [...AUTH_FORGOT_PASSWORD_FORM, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/sign-in');
    await waitForPageLoad(page);

    // Click forgot password link
    const forgotLink = page.getByRole('link', { name: /Olvidaste tu contraseña/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await page.waitForURL(/.*forgot-password/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByRole('heading', { name: /Recuperar contraseña/i })).toBeVisible();
  });
});

test.describe('Auth — Forgot password reset', () => {
  test('should complete forgot-password reset wizard end-to-end', { tag: [...AUTH_FORGOT_PASSWORD_RESET] }, async ({ page }) => {
    await page.route('**/api/google-captcha/site-key/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_key: '' }) }),
    );
    await page.route('**/api/auth/send_passcode/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Code sent' }) }),
    );
    await page.route('**/api/auth/verify_passcode_and_reset_password/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Password reset' }) }),
    );

    await page.goto('/forgot-password');
    await waitForPageLoad(page);
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible();

    // Step 1 — enter email and request code
    await page.getByLabel(/Correo electrónico/i).fill('test@example.com');
    await page.getByRole('button', { name: /Enviar código/i }).click();

    // Step 2 — code input and new password inputs appear
    await expect(page.getByLabel(/Código/i)).toBeVisible({ timeout: 5_000 });
    await page.getByLabel(/Código/i).fill('123456');
    await page.getByLabel(/Nueva contraseña/i).fill('NewPass123!');
    await page.getByLabel(/Confirmar contraseña/i).fill('NewPass123!');

    // Submit reset — canonical role query (was a bare `button[type="submit"]` CSS
    // locator, indistinguishable from any other submit button on the page)
    await page.getByRole('button', { name: /Restablecer contraseña/i }).click();

    // On success → redirect to sign-in
    await page.waitForURL(/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Auth — Protected route redirect', () => {
  test('unauthenticated visit to a protected route redirects to /sign-in', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    // quality: allow-no-interaction (an anonymous visit's whole behavior IS the
    // server-side redirect — there is nothing to interact with before it fires)
    await page.goto('/my-applications/1/history');
    await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('unauthenticated visit to /admin/payments redirects to /sign-in', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    // quality: allow-no-interaction (an anonymous visit's whole behavior IS the
    // server-side redirect — there is nothing to interact with before it fires)
    await page.goto('/admin/payments');
    await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should navigate to backoffice page', { tag: [...AUTH_PROTECTED_REDIRECT] }, async ({ page }) => {
    // quality: allow-no-interaction (an anonymous visit's whole behavior IS the
    // client-side useRequireAuth redirect — /web-manager has no entry in proxy.ts's
    // PROTECTED_PREFIXES, so there is nothing to interact with before the hook fires
    // the redirect post-hydration)
    //
    // Neither /backoffice nor a bare /web-manager is a route here: web-manager has a
    // layout but no root page.tsx, so the URL 404s and the layout (where the guard
    // lives) never mounts — a bare visit sits with no redirect at all. /web-manager/
    // campaigns is a real page under that layout, so the guard runs. Unlike the
    // sibling tests above (blocked server-side by proxy.ts), /web-manager is absent
    // from PROTECTED_PREFIXES: here the only thing standing between a guest and the
    // back office is useRequireAuth in the layout.
    await page.goto('/web-manager/campaigns');
    await waitForPageLoad(page);

    // Catches an auth-guard regression that lets the web-manager back office render
    // without a session instead of redirecting to sign-in. This redirect is issued by
    // useRequireAuth after hydration, not by a server 302, hence the wider budget.
    await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Auth — Login redirect', () => {
  test('should redirect to original path after sign-in with redirect param', { tag: [...AUTH_LOGIN_REDIRECT, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/google-captcha/site-key/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_key: '' }) }),
    );
    await page.route('**/api/auth/sign_in/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'mock-access', refresh: 'mock-refresh' }),
      }),
    );
    await page.route('**/api/token/refresh/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access: 'mock-access' }) }),
    );
    await page.route('**/api/auth/validate_token/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true }) }),
    );

    await page.goto('/sign-in?redirect=/my-profile');
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/sign-in/);

    // Canonical exact-label queries (were case-insensitive substring regexes
    // /correo/i and /contraseña/i, which would also match "Confirmar contraseña"
    // on any form that has both fields on screen at once).
    await page.getByLabel('Correo electrónico').fill('adopter-e2e@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('testpass123');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();

    // After login → should navigate away from sign-in
    await page.waitForURL(/(?!.*sign-in)/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/sign-in/);
  });
});

test.describe('Auth — Sign-up success', () => {
  test('should register new account and redirect to home', { tag: [...AUTH_SIGN_UP_SUCCESS, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/google-captcha/site-key/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_key: '' }) }),
    );
    await page.route('**/api/auth/sign_up/**', (route: any) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'mock-access', refresh: 'mock-refresh', user: { id: 99, email: 'newuser@example.com' } }),
      }),
    );

    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.getByLabel(/^Nombre$/i).fill('María');
    await page.getByLabel(/Apellido/i).fill('García');
    await page.getByLabel(/Correo electrónico/i).fill('newuser@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('SecurePass123!');
    await page.getByLabel(/Confirmar contraseña/i).fill('SecurePass123!');
    await page.getByRole('checkbox').check();
    await expect(page.getByRole('checkbox')).toBeChecked();

    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    // On success → router.replace(ROUTES.HOME), so user leaves sign-up
    await page.waitForURL((url) => !url.toString().includes('sign-up'), { timeout: 10_000 });
    await expect(page).not.toHaveURL(/sign-up/);
  });

  // Fails if a server-side registration failure reads as anything other than a
  // failure. Two ways it could: leaving the user on a page that looks like it
  // worked, or — the bug this caught — rendering the literal text "undefined",
  // because `{}` is truthy and the old branch read data[undefined] and stringified
  // it. Either way the person cannot tell whether they now have an account.
  test('shows a real message, not "undefined", when registration fails server-side', { tag: [...AUTH_SIGN_UP_SUCCESS, '@outcome:failure'] }, async ({ page }) => {
    await page.route('**/api/google-captcha/site-key/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ site_key: '' }) }),
    );
    await page.route('**/api/auth/sign_up/**', (route: any) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) }),
    );

    await page.goto('/sign-up');
    await waitForPageLoad(page);

    await page.getByLabel(/^Nombre$/i).fill('María');
    await page.getByLabel(/Apellido/i).fill('García');
    await page.getByLabel(/Correo electrónico/i).fill('newuser@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('SecurePass123!');
    await page.getByLabel(/Confirmar contraseña/i).fill('SecurePass123!');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    // The keyless-body fallback at sign-up/page.tsx:103, rendered at :276.
    await expect(page.getByText('Registration failed')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('undefined', { exact: true })).not.toBeVisible();
    await expect(page).toHaveURL(/sign-up/);
  });
});

test.describe('Auth — Session persistence', () => {
  test('should not persist session across fresh navigation without cookies', { tag: [...AUTH_SESSION_PERSISTENCE] }, async ({ page, context }) => {
    // quality: allow-no-interaction (an anonymous visit's whole behavior IS the
    // server-side redirect — there is nothing to interact with before it fires)
    // /my-profile (root) has no auth guard of its own; /my-profile/notifications
    // does call useRequireAuth AND sits under proxy.ts's /my-profile PROTECTED_PREFIXES
    // entry, so clearing cookies is genuinely exercised at the server redirect here.
    await context.clearCookies();
    await page.goto('/my-profile/notifications');
    await waitForPageLoad(page);

    // Without cookies, the guard must redirect to sign-in — catches a session check
    // that trusts stale client state instead of the cleared cookie jar.
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
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
