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

  it('renders info callout with correct icon and styling', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { callout: { type: 'info', title: 'Información', text: 'Este es un dato importante.' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Información')).toBeInTheDocument();
    expect(screen.getByText('Este es un dato importante.')).toBeInTheDocument();
  });

  it('renders note callout with correct icon and styling', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { callout: { type: 'note', text: 'Una nota sobre el proceso.' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Una nota sobre el proceso.')).toBeInTheDocument();
  });

  it('renders default callout when type is undefined', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { callout: { text: 'Consejo general sin tipo.' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Consejo general sin tipo.')).toBeInTheDocument();
  });

  it('renders YouTube video embed for standard youtube.com URL', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { video: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Video de ejemplo' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    const iframe = screen.getByTitle('Video de ejemplo');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('renders YouTube video embed for youtu.be short URL', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { video: { url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Video corto' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    const iframe = screen.getByTitle('Video corto');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('does not render video iframe for invalid URL', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { video: { url: 'not-a-valid-url', title: 'Video inválido' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.queryByTitle('Video inválido')).not.toBeInTheDocument();
  });

  it('does not render video iframe for youtube.com URL without v param', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { video: { url: 'https://www.youtube.com/watch', title: 'Video sin ID' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.queryByTitle('Video sin ID')).not.toBeInTheDocument();
  });

  it('renders image credit as plain text when no credit_url provided', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { image: { url: 'http://example.com/img.jpg', alt: 'Un animal', credit: 'Foto de Juan' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText('Foto de Juan')).toBeInTheDocument();
  });

  it('renders image credit as link when credit_url is provided', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        {
          image: {
            url: 'http://example.com/img.jpg',
            alt: 'Un animal',
            credit: 'Foto de Juan',
            credit_url: 'https://example.com/juan',
          },
        },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    const link = screen.getByRole('link', { name: 'Foto de Juan' });
    expect(link).toHaveAttribute('href', 'https://example.com/juan');
  });

  it('renders quote without author when author is omitted', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { quote: { text: 'Frase sin autor.' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByText(/Frase sin autor/)).toBeInTheDocument();
    expect(screen.queryByText(/^—/)).not.toBeInTheDocument();
  });

  it('renders image with empty alt when alt is not provided', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { image: { url: 'http://example.com/no-alt.jpg' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    const img = screen.getByTestId('section-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
  });

  it('renders YouTube video with default "Video" title when no title provided', () => {
    const contentJson = {
      intro: 'Intro',
      sections: [
        { video: { url: 'https://www.youtube.com/watch?v=abc123' } },
      ],
    };
    render(<BlogContentRenderer contentJson={contentJson} />);
    expect(screen.getByTitle('Video')).toBeInTheDocument();
  });
});
