/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { ECOSYSTEM } from '../ecosystemCatalog';
import { ECOSYSTEM_NODES, ecosystemViews, ecosystemViewCount } from '../ecosystem';
import { MANUAL_SECTIONS } from '../content';
import es from '@/messages/es.json';
import en from '@/messages/en.json';

const pagesRoot = path.join(process.cwd(), 'app/[locale]');
function pageRoutes(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== '__tests__') return pageRoutes(full);
    return entry.name === 'page.tsx' ? ['/' + path.relative(pagesRoot, directory).split(path.sep).filter(Boolean).join('/')] : [];
  });
}

describe('ecosystem screen inventory', () => {
  it('maps every App Router page to one primary location', () => {
    const routes = ecosystemViews(ECOSYSTEM).map((node) => node.view!.route);
    expect(routes.sort()).toEqual(pageRoutes(pagesRoot).sort());
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('offers only existing static entry points', () => {
    const routes = new Set(pageRoutes(pagesRoot));
    const destinations = ecosystemViews(ECOSYSTEM).flatMap((node) => node.view!.destination ? [node.view!.destination] : []);
    expect(destinations.filter((route) => !routes.has(route) || route.includes('['))).toEqual([]);
  });

  it('keeps navigation node identifiers unique', () => {
    expect(new Set(ECOSYSTEM_NODES.map((node) => node.id)).size).toBe(ECOSYSTEM_NODES.length);
  });

  it('connects only siblings available at the current level', () => {
    const invalid = ECOSYSTEM_NODES.flatMap((node) => node.relations.filter((relation) =>
      !node.children.some((child) => child.id === relation.from) || !node.children.some((child) => child.id === relation.to)));
    expect(invalid).toEqual([]);
  });

  it.each([['es', es], ['en', en]] as const)('provides readable copy for every node in %s', (_locale, messages) => {
    const copy: Record<string, { title: string; summary: string; value: string }> = messages.manual.ecosystem.nodes;
    const missing = ECOSYSTEM_NODES.filter((node) => !copy[node.id]?.title || !copy[node.id]?.summary || !copy[node.id]?.value);
    expect(missing).toEqual([]);
  });

  it('links only to existing manual instructions', () => {
    const processIds = new Set(MANUAL_SECTIONS.flatMap((section) => section.processes.map((process) => process.id)));
    expect(ECOSYSTEM_NODES.flatMap((node) => node.processIds || []).filter((id) => !processIds.has(id))).toEqual([]);
  });

  it('counts actual screen routes at the root', () => {
    expect(ecosystemViewCount(ECOSYSTEM)).toBe(pageRoutes(pagesRoot).length);
  });
});
