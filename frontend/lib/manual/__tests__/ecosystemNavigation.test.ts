import { ecosystemPath, ecosystemTour, findEcosystemNode, resolveEcosystemState, searchEcosystem } from '../ecosystem';
import es from '@/messages/es.json';

describe('ecosystem navigation', () => {
  it('falls back to the root for an unknown node', () => {
    expect(resolveEcosystemState(new URLSearchParams('node=missing')).nodeId).toBe('tuhuella');
  });

  it('starts a valid tour at its first module when the node is invalid', () => {
    expect(resolveEcosystemState(new URLSearchParams('tour=veterinary&node=missing'))).toEqual({
      nodeId: 'veterinary-followups', tour: 'veterinary', showRelations: true,
    });
  });

  it('discards a tour that names a module instead of a space', () => {
    expect(resolveEcosystemState(new URLSearchParams('tour=discover-animals&node=animals'))).toEqual({
      nodeId: 'animals', tour: null, showRelations: true,
    });
  });

  it('restores a shareable tour step', () => {
    expect(resolveEcosystemState(new URLSearchParams('tour=veterinary&node=veterinary-history&relations=0'))).toEqual({
      nodeId: 'veterinary-history', tour: 'veterinary', showRelations: false,
    });
  });

  it('returns the navigation path for an animal profile', () => {
    expect(ecosystemPath('animal-detail').map((node) => node.id)).toEqual(['tuhuella', 'discover', 'discover-animals', 'animal-detail']);
  });

  it('defines a guided stop for each module of the selected space', () => {
    expect(ecosystemTour('veterinary').map((node) => node.id)).toEqual(['veterinary-followups', 'veterinary-history']);
  });

  it('returns the root for an empty navigation target', () => {
    expect(findEcosystemNode(null).id).toBe('tuhuella');
  });

  it('finds accented titles with an unaccented query', () => {
    const copy: Record<string, { title: string }> = es.manual.ecosystem.nodes;
    const results = searchEcosystem('atencion veterinaria', (id) => copy[id].title);
    expect(results.map((node) => node.id)).toEqual(['veterinary']);
  });

  it('returns no options for an unmatched search', () => {
    expect(searchEcosystem('xyz-nothing', (id) => id)).toEqual([]);
  });

  it('returns no options for an empty search', () => {
    expect(searchEcosystem('   ', (id) => id)).toEqual([]);
  });
});
