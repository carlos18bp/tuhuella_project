import { test, expect } from '../test-with-coverage';
import { openEcosystem } from '../helpers/ecosystem-session';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

test('user enters the ecosystem from the manual', { tag: ['@flow:manual-ecosystem-browse', '@outcome:display'] }, async ({ page }, testInfo) => {
  await openEcosystem(page);
  await expect(page.getByTestId('ecosystem-stage').getByRole('button')).toHaveCount(7);
  await expect(page.getByTestId('ecosystem-context')).toContainText('69 pantallas relacionadas');
  await expect(page.getByTestId('ecosystem-node-administration')).toContainText('Administración y ayuda');
  await page.screenshot({ path: testInfo.outputPath('ecosystem-orbit.png'), fullPage: true });
});

test('user drills into the animal profile module', { tag: ['@flow:manual-ecosystem-navigate', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByTestId('ecosystem-node-discover').click();
  await page.getByTestId('ecosystem-node-discover-animals').click();
  await page.getByTestId('ecosystem-node-animal-detail').click();
  await expect(page.getByTestId('ecosystem-context')).toContainText('Consulta fotos, salud');
  await page.getByRole('button', { name: 'Volver al nivel anterior' }).click();
  await expect(page.getByTestId('ecosystem-stage').getByRole('button')).toHaveCount(2);
  await expect(page).toHaveURL(/node=discover-animals/);
});

test('user finds a module through search', { tag: ['@flow:manual-ecosystem-search', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByRole('searchbox', { name: 'Buscar en el ecosistema' }).fill('atencion veterinaria');
  await page.getByRole('button', { name: /Atención veterinaria Atención veterinaria/ }).click();
  await expect(page).toHaveURL(/node=veterinary/);
  await expect(page.getByTestId('ecosystem-context')).toContainText('Registra atención y da continuidad');
});

test('user sees an unmatched module search', { tag: ['@flow:manual-ecosystem-search-empty', '@outcome:display'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByRole('searchbox').fill('xyz-nothing');
  await expect(page.getByRole('status')).toHaveText('No encontramos módulos con ese término.');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
});

test('user completes a veterinary guided tour', { tag: ['@flow:manual-ecosystem-tour', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByTestId('ecosystem-node-veterinary').click();
  await page.getByRole('button', { name: 'Iniciar recorrido' }).click();
  const tour = page.getByRole('region', { name: 'Recorrido guiado' });
  await expect(tour).toContainText('Paso 1 de 2');
  await tour.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByTestId('ecosystem-context')).toContainText('Atención e historia clínica');
  await tour.getByRole('button', { name: 'Terminar recorrido' }).click();
  await expect(tour).toHaveCount(0);
  await expect(page).toHaveURL(/node=veterinary-history$/);
});

test('user hides the operational connections', { tag: ['@flow:manual-ecosystem-relations', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await expect(page.getByTestId('ecosystem-relation')).toHaveCount(6);
  await page.getByRole('button', { name: 'Ocultar relaciones' }).click();
  await expect(page.getByTestId('ecosystem-relation')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mostrar relaciones' })).toHaveAttribute('aria-pressed', 'false');
});

test('user reloads a selected module', { tag: ['@flow:manual-ecosystem-share', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByTestId('ecosystem-node-shelter').click();
  await page.getByTestId('ecosystem-node-shelter-fundraising').click();
  await expect(page).toHaveURL(/node=shelter-fundraising/);
  await page.reload();
  await expect(page.getByTestId('ecosystem-context')).toContainText('Campañas y donaciones');
  await expect(page.getByTestId('ecosystem-stage').getByRole('button')).toHaveCount(4);
});

test('adopter explores an administrative screen without its access link', { tag: ['@flow:manual-ecosystem-access', '@outcome:display'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByTestId('ecosystem-node-administration').click();
  await page.getByTestId('ecosystem-node-administration-overview').click();
  await page.getByTestId('ecosystem-node-admin-metrics').click();
  const context = page.getByTestId('ecosystem-context');
  await expect(context).toContainText('Métricas');
  await expect(context).toContainText('Disponible para: administración');
  await expect(context.getByRole('link', { name: /Abrir pantalla/ })).toHaveCount(0);
});

test('user returns to the role-filtered guide', { tag: ['@flow:manual-ecosystem-guide', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByRole('link', { name: 'Volver al manual' }).click();
  await expect(page).toHaveURL(/\/manual$/);
  await expect(page.getByRole('heading', { name: 'Rol: Adoptante' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rol: Web Manager' })).toHaveCount(0);
});

test('signed-out user cannot reopen the ecosystem', { tag: ['@flow:manual-ecosystem-auth', '@outcome:error'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByRole('button', { name: 'Abrir menú de cuenta' }).click();
  await page.getByRole('menuitem', { name: 'Salir', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.goto('/es/manual/ecosystem');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
});

test('user adjusts the orbit with keyboard controls', { tag: ['@flow:manual-ecosystem-orbit', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  const stage = page.getByTestId('ecosystem-stage');
  const animalSpace = page.getByTestId('ecosystem-node-discover');
  const before = await animalSpace.boundingBox();
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  const after = await animalSpace.boundingBox();
  expect(after!.x).not.toBe(before!.x);
  await expect(stage).toHaveAttribute('data-rotating', 'false');
});

test('user recovers from an unknown shared node', { tag: ['@flow:manual-ecosystem-share-invalid', '@outcome:error'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.goto('/es/manual/ecosystem?node=unknown&tour=unknown');
  await expect(page).toHaveURL(/\/manual\/ecosystem$/);
  await expect(page.getByTestId('ecosystem-context')).toContainText('69 pantallas relacionadas');
});

test('user restores the orbit after zooming', { tag: ['@flow:manual-ecosystem-orbit', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  const node = page.getByTestId('ecosystem-node-discover');
  const before = await node.boundingBox();
  await page.getByRole('button', { name: 'Acercar', exact: true }).click();
  const zoomed = await node.boundingBox();
  expect(zoomed!.y).toBeLessThan(before!.y);
  await page.getByRole('button', { name: 'Centrar la órbita' }).click();
  await expect(page.getByTestId('ecosystem-stage')).toHaveAttribute('data-zoom', '1.00');
});

test('user rotates the orbit by dragging its background', { tag: ['@flow:manual-ecosystem-orbit', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  const stage = page.getByTestId('ecosystem-stage');
  await stage.scrollIntoViewIfNeeded();
  const box = await stage.boundingBox();
  const node = page.getByTestId('ecosystem-node-discover');
  const before = await node.boundingBox();
  await page.mouse.move(box!.x + 20, box!.y + 150);
  await page.mouse.down();
  await page.mouse.move(box!.x + 100, box!.y + 150, { steps: 6 });
  await page.mouse.up();
  const after = await node.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 30);
  await expect(page).toHaveURL(/\/manual\/ecosystem$/);
  await node.click();
  await expect(page).toHaveURL(/node=discover$/);
});

test('user pauses automatic rotation', { tag: ['@flow:manual-ecosystem-orbit', '@outcome:success'] }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openEcosystem(page);
  await page.getByRole('button', { name: 'Pausar giro', exact: true }).click();
  await expect(page.getByTestId('ecosystem-stage')).toHaveAttribute('data-rotating', 'false');
  await page.getByRole('button', { name: 'Reanudar giro' }).click();
  await expect(page.getByTestId('ecosystem-stage')).toHaveAttribute('data-rotating', 'true');
});

test('user follows the screen entry to the animal listing', { tag: ['@flow:manual-ecosystem-navigate', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.getByTestId('ecosystem-node-discover').click();
  await page.getByTestId('ecosystem-node-discover-animals').click();
  await page.getByTestId('ecosystem-node-animal-detail').click();
  await page.getByRole('link', { name: 'Elegir un registro: Ficha del animal' }).click();
  await expect(page).toHaveURL(/\/animals$/);
});

test('user respects a reduced-motion preference', { tag: ['@flow:manual-ecosystem-orbit', '@outcome:success'] }, async ({ page }) => {
  await openEcosystem(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('searchbox').focus();
  await page.mouse.move(0, 0);
  await expect(page.getByText('El giro automático está desactivado por tu preferencia de movimiento reducido.')).toBeVisible();
  await expect(page.getByTestId('ecosystem-stage')).toHaveAttribute('data-rotating', 'false');
});

test('user explores the map in dark mode', { tag: ['@flow:manual-ecosystem-navigate', '@outcome:success'] }, async ({ page }, testInfo) => {
  await openEcosystem(page);
  await page.getByRole('button', { name: 'Cambiar a modo oscuro', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByTestId('ecosystem-node-veterinary').click();
  await expect(page.getByTestId('ecosystem-context')).toContainText('Registra atención y da continuidad');
  await page.screenshot({ path: testInfo.outputPath('ecosystem-dark.png'), fullPage: true });
});
