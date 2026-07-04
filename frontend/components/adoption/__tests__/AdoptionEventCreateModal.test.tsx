import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AdoptionEventCreateModal from '../AdoptionEventCreateModal';

type SubmitFn = (payload: { event_date: string; description: string }) => Promise<void>;

const renderModal = (
  overrides: Partial<{ open: boolean; onClose: () => void; onSubmit: SubmitFn }> = {},
) => {
  const onClose = overrides.onClose ?? jest.fn();
  const onSubmit =
    overrides.onSubmit ?? (jest.fn().mockResolvedValue(undefined as never) as unknown as SubmitFn);
  render(
    <AdoptionEventCreateModal
      open={overrides.open ?? true}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
  );
  return { onClose, onSubmit };
};

describe('AdoptionEventCreateModal', () => {
  it('renders no dialog when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with date and description fields when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('event-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('event-description-input')).toBeInTheDocument();
  });

  it('blocks submission and shows an error when the description is only whitespace', () => {
    const { onSubmit } = renderModal();

    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: '    ' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    expect(screen.getByText('La descripción es obligatoria.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a future event date', () => {
    const { onSubmit } = renderModal();

    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: 'Visita programada.' },
    });
    fireEvent.change(screen.getByTestId('event-date-input'), {
      target: { value: '2099-01-01T10:00' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    expect(screen.getByText('La fecha del evento no puede ser futura.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits an ISO payload and closes on success', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined as never) as unknown as SubmitFn;
    const { onClose } = renderModal({ onSubmit });

    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: '  Hablamos con el adoptante.  ' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = (onSubmit as jest.Mock).mock.calls[0][0] as {
      event_date: string;
      description: string;
    };
    expect(payload.description).toBe('Hablamos con el adoptante.');
    expect(payload.event_date).toMatch(/T.*Z$/);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('flattens field errors from a rejected submission', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue({
        response: { data: { event_date: ['Fecha requerida.'], description: ['Muy corto.'] } },
      } as never) as unknown as SubmitFn;
    const { onClose } = renderModal({ onSubmit });

    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: 'x' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    await waitFor(() =>
      expect(screen.getByText('Fecha requerida. Muy corto.')).toBeInTheDocument(),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a generic error when the submission fails without field details', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(new Error('boom') as never) as unknown as SubmitFn;
    renderModal({ onSubmit });

    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: 'Evento válido.' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    await waitFor(() =>
      expect(
        screen.getByText('No pudimos registrar el evento. Intenta de nuevo.'),
      ).toBeInTheDocument(),
    );
  });

  it('closes when the Escape key is pressed', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the cancel button is clicked', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the header close button is clicked', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
