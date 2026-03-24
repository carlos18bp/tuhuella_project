import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import BlogContentRenderer from '../BlogContentRenderer';

describe('BlogContentRenderer', () => {
  it('renders intro text from JSON content', () => {
    const contentJson = {
      intro: 'Adoptar es un acto de amor.',
      sections: [],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Adoptar es un acto de amor.')).toBeInTheDocument();
  });

  it('renders section heading and content', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { heading: 'Paso 1', content: 'Investiga refugios cercanos.' },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Investiga refugios cercanos.')).toBeInTheDocument();
  });

  it('renders a list within a section', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { heading: 'Checklist', list: ['Vacunas', 'Esterilización', 'Microchip'] },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Vacunas')).toBeInTheDocument();
    expect(screen.getByText('Esterilización')).toBeInTheDocument();
    expect(screen.getByText('Microchip')).toBeInTheDocument();
  });

  it('renders subsections with title and description', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        {
          heading: 'Tipos',
          subsections: [
            { title: 'Adopción temporal', description: 'Cuidas al animal mientras encuentra hogar.' },
          ],
        },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Adopción temporal')).toBeInTheDocument();
    expect(screen.getByText('Cuidas al animal mientras encuentra hogar.')).toBeInTheDocument();
  });

  it('renders a quote block', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { quote: { text: 'La grandeza de una nación se mide por cómo trata a sus animales.', author: 'Mahatma Gandhi' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText(/La grandeza de una nación/)).toBeInTheDocument();
    expect(screen.getByText('— Mahatma Gandhi')).toBeInTheDocument();
  });

  it('renders a callout with title and text', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { callout: { type: 'warning', title: 'Importante', text: 'Consulta con un veterinario.' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Importante')).toBeInTheDocument();
    expect(screen.getByText('Consulta con un veterinario.')).toBeInTheDocument();
  });

  it('renders key takeaways', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { key_takeaways: ['Adoptar salva vidas', 'Esteriliza a tu mascota'] },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Adoptar salva vidas')).toBeInTheDocument();
    expect(screen.getByText('Esteriliza a tu mascota')).toBeInTheDocument();
  });

  it('renders FAQ items as details/summary elements', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { faq: [{ question: '¿Cuánto cuesta adoptar?', answer: 'Depende del refugio.' }] },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('¿Cuánto cuesta adoptar?')).toBeInTheDocument();
    expect(screen.getByText('Depende del refugio.')).toBeInTheDocument();
  });

  it('renders conclusion and CTA when present', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [],
      conclusion: 'Gracias por leer.',
      cta: '¡Adopta hoy!',
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Gracias por leer.')).toBeInTheDocument();
    expect(screen.getByText('¡Adopta hoy!')).toBeInTheDocument();
  });

  it('falls back to HTML content when JSON is empty', () => {
    render(
      <BlogContentRenderer
        contentJson={null}
        contentHtml="<p>Contenido HTML</p>"
      />,
    );
    expect(screen.getByText('Contenido HTML')).toBeInTheDocument();
  });

  it('renders empty state when no content is provided', () => {
    render(<BlogContentRenderer contentJson={null} contentHtml="" />);
    expect(screen.getByText('No hay contenido disponible.')).toBeInTheDocument();
  });

  it('renders an image with alt text', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { image: { url: 'http://example.com/img.jpg', alt: 'Perro feliz' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    const img = screen.getByAltText('Perro feliz');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/img.jpg');
  });

  it('renders timeline steps', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        {
          timeline: [
            { step: 'Paso 1', description: 'Visita el refugio.' },
            { step: 'Paso 2', description: 'Llena la solicitud.' },
          ],
        },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Visita el refugio.')).toBeInTheDocument();
    expect(screen.getByText('Llena la solicitud.')).toBeInTheDocument();
  });

  it('renders examples list', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { examples: ['Un perro pequeño', 'Un gato adulto'] },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Un perro pequeño')).toBeInTheDocument();
    expect(screen.getByText('Un gato adulto')).toBeInTheDocument();
  });
});
