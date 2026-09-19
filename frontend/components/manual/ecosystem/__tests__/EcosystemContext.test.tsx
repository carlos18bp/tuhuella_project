import { render, screen, within } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import userEvent from '@testing-library/user-event';
import EcosystemContext from '../EcosystemContext';
import EcosystemSearch from '../EcosystemSearch';
import EcosystemTour from '../EcosystemTour';
import { findEcosystemNode } from '@/lib/manual/ecosystem';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    void prefetch;
    return <a {...props} />;
  },
}));

const adopter = { role: 'adopter' as const, is_staff: false };
const contextProps = { user: adopter, preview: false, touring: false, onSelect: jest.fn(), onStartTour: jest.fn() };

describe('ecosystem context', () => {
  it('explains restricted modules without offering their entry', () => {
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('admin-metrics')} />);
    expect(screen.getByRole('heading', { name: 'Métricas' })).toBeInTheDocument();
    expect(screen.getByText('Disponible para: administración')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Abrir pantalla/ })).not.toBeInTheDocument();
  });

  it('takes a record-specific screen to its selection list', () => {
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('animal-detail')} />);
    expect(screen.getByRole('link', { name: 'Elegir un registro: Ficha del animal' })).toHaveAttribute('href', '/animals');
  });

  it('warns that payments remain in demonstration mode', () => {
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('donate')} />);
    expect(screen.getByText(/todavía no se realizan cobros reales/)).toBeInTheDocument();
  });

  it('starts a guided tour from a selected space', async () => {
    const onStartTour = jest.fn();
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('veterinary')} onStartTour={onStartTour} />);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar recorrido' }));
    expect(onStartTour).toHaveBeenCalledWith('veterinary');
  });

  it('keeps role-restricted instructions out of the full map', () => {
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('vet-detail')} />);
    expect(screen.getByRole('heading', { name: 'Detalle del seguimiento' })).toBeInTheDocument();
    expect(screen.queryByText('Ver instrucciones')).not.toBeInTheDocument();
  });

  it('opens matching instructions for the current role', async () => {
    render(<EcosystemContext {...contextProps} node={findEcosystemNode('favorites')} />);
    await userEvent.click(screen.getByText('Ver instrucciones'));
    expect(screen.getByRole('link', { name: 'Gestionar favoritos' })).toHaveAttribute('href', '/manual#adopter-favorites');
  });

  it('selects a search result by its node identifier', async () => {
    const onSelect = jest.fn();
    render(<EcosystemSearch onSelect={onSelect} />);
    await userEvent.type(screen.getByRole('searchbox'), 'atencion veterinaria');
    await userEvent.click(screen.getByRole('button', { name: /Atención veterinaria/ }));
    expect(onSelect).toHaveBeenCalledWith('veterinary');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('clears an unmatched search with Escape', async () => {
    render(<EcosystemSearch onSelect={jest.fn()} />);
    await userEvent.type(screen.getByRole('searchbox'), 'xyz-nothing');
    expect(screen.getByRole('status')).toHaveTextContent('No encontramos módulos');
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('advances the guided tour to the next module', async () => {
    const onSelect = jest.fn();
    render(<EcosystemTour spaceId="veterinary" nodeId="veterinary-followups" onSelect={onSelect} onStop={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onSelect).toHaveBeenCalledWith('veterinary-history');
  });

  it('finishes the last guided stop', async () => {
    const onStop = jest.fn();
    render(<EcosystemTour spaceId="veterinary" nodeId="veterinary-history" onSelect={jest.fn()} onStop={onStop} />);
    await userEvent.click(within(screen.getByRole('region', { name: 'Recorrido guiado' })).getByRole('button', { name: 'Terminar recorrido' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
