import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClinicalEntryForm from '../ClinicalEntryForm';
import type { ClinicalEntryPayload } from '@/lib/types';

describe('ClinicalEntryForm', () => {
  it('submits the entered payload with the follow-up id and selected entry type', async () => {
    const onSubmit = jest.fn<(payload: ClinicalEntryPayload) => void>();
    const user = userEvent.setup();

    render(<ClinicalEntryForm followUpId={42} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Título/), 'Revisión general');
    await user.selectOptions(screen.getByLabelText(/Tipo de entrada/), 'vaccination');
    await user.type(screen.getByLabelText(/Detalle \(español\)/), 'Vacuna triple aplicada');

    await user.click(screen.getByRole('button', { name: 'Guardar entrada' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        follow_up: 42,
        entry_type: 'vaccination',
        title: 'Revisión general',
        body_es: 'Vacuna triple aplicada',
      }),
    );
    expect(payload.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
