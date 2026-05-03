import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AdoptionEventTimeline from '../AdoptionEventTimeline';
import type { AdoptionApplicationEvent } from '@/lib/types';

const sampleEvent = (overrides: Partial<AdoptionApplicationEvent> = {}): AdoptionApplicationEvent => ({
  id: 1,
  application: 100,
  event_date: '2026-04-30T14:00:00Z',
  description: 'Llamamos al refugio y confirmaron la entrevista para el martes.',
  created_by: 9,
  created_by_name: 'María Web Manager',
  created_by_role: 'web_manager',
  created_by_email: 'maria@example.com',
  created_at: '2026-04-30T14:05:00Z',
  ...overrides,
});

describe('AdoptionEventTimeline', () => {
  it('renders empty state message when there are no events', () => {
    render(<AdoptionEventTimeline events={[]} canCreate={false} />);
    expect(screen.getByText(/no se han registrado eventos/i)).toBeInTheDocument();
  });

  it('renders each event with author name and description', () => {
    const events = [
      sampleEvent({ id: 1 }),
      sampleEvent({
        id: 2,
        created_by_name: 'Jorge Refugio',
        created_by_role: 'shelter_admin',
        description: 'Visita domiciliaria realizada.',
      }),
    ];

    render(<AdoptionEventTimeline events={events} canCreate={false} />);

    expect(screen.getAllByTestId('event-item')).toHaveLength(2);
    expect(screen.getByText(/María Web Manager/)).toBeInTheDocument();
    expect(screen.getByText(/Jorge Refugio/)).toBeInTheDocument();
    expect(screen.getByText(/Visita domiciliaria realizada/)).toBeInTheDocument();
  });

  it('hides the create-event button when canCreate is false', () => {
    render(<AdoptionEventTimeline events={[sampleEvent()]} canCreate={false} />);
    expect(screen.queryByTestId('event-add-button')).not.toBeInTheDocument();
  });

  it('shows the create-event button only when canCreate is true and onCreate is provided', () => {
    const onCreate = jest.fn(() => Promise.resolve());
    render(
      <AdoptionEventTimeline events={[]} canCreate onCreate={onCreate as never} />,
    );
    expect(screen.getByTestId('event-add-button')).toBeInTheDocument();
  });

  it('opens the modal and submits a new event with normalized payload', async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined as never);
    render(
      <AdoptionEventTimeline events={[]} canCreate onCreate={onCreate as never} />,
    );

    fireEvent.click(screen.getByTestId('event-add-button'));
    fireEvent.change(screen.getByTestId('event-description-input'), {
      target: { value: 'Hablamos con el adoptante; sigue interesado.' },
    });
    fireEvent.click(screen.getByTestId('event-submit'));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    const payload = (onCreate.mock.calls[0] as [{ event_date: string; description: string }])[0];
    expect(payload.description).toBe('Hablamos con el adoptante; sigue interesado.');
    expect(typeof payload.event_date).toBe('string');
    expect(payload.event_date).toMatch(/T.*Z$/);
  });
});
