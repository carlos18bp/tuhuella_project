import { expect, type Page } from '@playwright/test';
import type { UserRole } from '../../lib/types';

/** Auth and API boundary fixtures only: the catalog, navigation and UI stay real.
 * No backend login, writes or seeded data are needed for this static manual.
 */
export async function openEcosystem(page: Page, role: UserRole = 'adopter', locale: 'es' | 'en' = 'es') {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  await page.context().addCookies([
    { name: 'access_token', value: 'ecosystem-test-access', url: baseURL },
    { name: 'refresh_token', value: 'ecosystem-test-refresh', url: baseURL },
  ]);
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const user = { id: 9001, email: 'ecosystem@example.test', first_name: 'Luna', last_name: 'Prueba', role, is_staff: role === 'admin', is_active: true };
    const json = pathname.includes('validate_token')
      ? { user }
      : ['/api/campaigns/', '/api/shelters/'].includes(pathname)
        ? []
        : { count: 0, results: [], items: [], unread_count: 0, site_key: '' };
    await route.fulfill({ status: 200, json });
  });
  await page.goto(`/${locale}`);
  await page.getByRole('button', { name: locale === 'en' ? 'Open account menu' : 'Abrir menú de cuenta', exact: true })
    .or(page.getByRole('button', { name: 'Toggle menu', exact: true })).click();
  await page.getByRole('menuitem', { name: 'Manual', exact: true })
    .or(page.getByRole('link', { name: 'Manual', exact: true })).click();
  await page.getByRole('link', { name: locale === 'en' ? 'Explore the ecosystem' : 'Explorar el ecosistema', exact: true }).click();
  await expect(page).toHaveURL(/\/manual\/ecosystem/);
  await expect(page.getByTestId('ecosystem-context')).toContainText(locale === 'en' ? 'Tuhuella ecosystem' : 'Ecosistema Tuhuella');
}
