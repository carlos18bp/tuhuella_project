import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import WhatsAppContactCard from '../WhatsAppContactCard';

describe('WhatsAppContactCard', () => {
  it('renders contact name, intro and chat link with sanitized digits', () => {
    render(
      <WhatsAppContactCard
        phone="(+57) 300 999 8877"
        contactName="Refugio Patitas"
        intro="Coordina la entrevista para Luna."
        buttonLabel="Escribir al refugio"
      />,
    );

    expect(screen.getByText('Refugio Patitas')).toBeInTheDocument();
    expect(screen.getByText('Coordina la entrevista para Luna.')).toBeInTheDocument();
    const link = screen.getByTestId('whatsapp-contact-cta');
    expect(link).toHaveAttribute('href', 'https://wa.me/573009998877');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('returns null when phone has no digits', () => {
    const { container } = render(
      <WhatsAppContactCard
        phone="(no number)"
        contactName="Refugio"
        intro="x"
        buttonLabel="Escribir"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('encodes prefilled message into the wa.me query string', () => {
    render(
      <WhatsAppContactCard
        phone="573001112233"
        contactName="Adoptante"
        intro="x"
        buttonLabel="Escribir"
        prefilledMessage="Hola, soy del refugio Patitas para Luna."
      />,
    );

    const link = screen.getByTestId('whatsapp-contact-cta');
    expect(link.getAttribute('href')).toContain('https://wa.me/573001112233?text=');
    expect(link.getAttribute('href')).toContain('Hola%2C+soy+del+refugio+Patitas+para+Luna.');
  });
});
