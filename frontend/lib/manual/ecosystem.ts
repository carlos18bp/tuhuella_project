import { ECOSYSTEM } from './ecosystemCatalog';
import type { EcosystemNode, EcosystemUser, EcosystemView } from './ecosystemTypes';

export function flattenEcosystem(node: EcosystemNode = ECOSYSTEM): EcosystemNode[] {
  return [node, ...node.children.flatMap(flattenEcosystem)];
}
export const ECOSYSTEM_NODES = flattenEcosystem();
const byId = new Map(ECOSYSTEM_NODES.map((node) => [node.id, node]));
const parents = new Map(ECOSYSTEM_NODES.flatMap((node) => node.children.map((child) => [child.id, node.id] as const)));

export function findEcosystemNode(id: string | null | undefined): EcosystemNode {
  return byId.get(id || '') || ECOSYSTEM;
}
export function ecosystemPath(id: string): EcosystemNode[] {
  const node = findEcosystemNode(id);
  const parent = parents.get(node.id);
  return [...(parent ? ecosystemPath(parent) : []), node];
}
export function ecosystemViews(node: EcosystemNode): EcosystemNode[] {
  return flattenEcosystem(node).filter((entry) => entry.view);
}
export function ecosystemViewCount(node: EcosystemNode): number {
  return new Set(ecosystemViews(node).map((entry) => entry.view!.route)).size;
}
export function ecosystemTour(id: string | null): EcosystemNode[] {
  const node = findEcosystemNode(id);
  return node.kind === 'space' ? node.children : [];
}

/** Presentation gate only; existing pages and APIs remain the authorization boundary. */
export function canOpenEcosystemView(view: EcosystemView, user: EcosystemUser): boolean {
  if (!view.destination) return false;
  if (view.access === 'public') return true;
  if (!user) return false;
  if (view.access === 'authenticated') return true;
  if (view.access === 'shelter_applicant') return user.role === 'adopter' || user.role === 'shelter_admin';
  if (view.access === 'shelter_admin') return user.role === 'shelter_admin';
  if (view.access === 'admin') return user.role === 'admin' || user.is_staff;
  return user.role === view.access || user.role === 'admin' || user.is_staff;
}

export function resolveEcosystemState(params: URLSearchParams) {
  let node = findEcosystemNode(params.get('node'));
  const candidate = params.get('tour');
  const steps = ecosystemTour(candidate);
  const tour = steps.length ? candidate : null;
  if (tour && !steps.some((step) => step.id === node.id)) node = steps[0];
  return { nodeId: node.id, tour, showRelations: params.get('relations') !== '0' };
}

export function searchEcosystem(query: string, getText: (id: string) => string): EcosystemNode[] {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return ECOSYSTEM_NODES.filter((node) => node.kind !== 'root')
    .filter((node) => terms.every((term) => normalize(getText(node.id)).includes(term)))
    .slice(0, 8);
}
