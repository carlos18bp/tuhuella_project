import { test, expect } from '../test-with-coverage';
import type { UserRole } from '../../lib/types';
import { openEcosystem } from '../helpers/ecosystem-session';

const roles: UserRole[] = ['adopter', 'shelter_admin', 'veterinarian', 'web_manager', 'admin'];
for (const role of roles) {
  test(`${role} sees the complete ecosystem`, { tag: ['@flow:manual-ecosystem-browse', '@outcome:display'] }, async ({ page }) => {
    await openEcosystem(page, role);
    await page.getByTestId('ecosystem-node-administration').click();
    await expect(page.getByTestId('ecosystem-stage').getByRole('button')).toHaveCount(6);
    await expect(page.getByTestId('ecosystem-node-administration-review')).toContainText('Aprobación y moderación');
  });
}

for (const width of [412, 835, 1195]) {
  test(`user explores cards at ${width}px`, { tag: ['@flow:manual-ecosystem-responsive', '@outcome:success'] }, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 915 });
    await openEcosystem(page);
    await page.getByTestId('ecosystem-node-discover').click();
    await page.getByTestId('ecosystem-node-discover-animals').click();
    await expect(page.getByTestId('ecosystem-stage').getByRole('button')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Girar a la izquierda' })).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('ecosystem-cards.png'), fullPage: true });
  });
}

test('user explores the English catalog', { tag: ['@flow:manual-ecosystem-locale', '@outcome:display'] }, async ({ page }) => {
  await openEcosystem(page, 'adopter', 'en');
  await page.getByTestId('ecosystem-node-veterinary').click();
  await expect(page.getByTestId('ecosystem-context')).toContainText('Record care and maintain assigned follow-ups.');
  await expect(page.getByTestId('ecosystem-node-veterinary-history')).toContainText('Care and clinical history');
  await expect(page).toHaveURL(/\/en\/manual\/ecosystem\?node=veterinary/);
});
