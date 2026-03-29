import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('swiper/react', () => ({
  Swiper: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'swiper', ...props }, children),
  SwiperSlide: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'swiper-slide' }, children),
}));

jest.mock('swiper/modules', () => ({
  Navigation: 'Navigation',
  Pagination: 'Pagination',
}));

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/navigation', () => ({}));
jest.mock('swiper/css/pagination', () => ({}));

import AnimalGallery from '../AnimalGallery';

describe('AnimalGallery', () => {
  it('renders dog fallback emoji when images array is empty', () => {
    const { container } = render(
      <AnimalGallery images={[]} species="dog" name="Luna" />,
    );
    expect(container.textContent).toContain('🐕');
  });

  it('renders cat fallback emoji when images array is empty', () => {
    const { container } = render(
      <AnimalGallery images={[]} species="cat" name="Milo" />,
    );
    expect(container.textContent).toContain('🐈');
  });

  it('renders generic fallback emoji for other species', () => {
    const { container } = render(
      <AnimalGallery images={[]} species="rabbit" name="Bugs" />,
    );
    expect(container.textContent).toContain('🐾');
  });

  it('renders fallback emoji when images is undefined', () => {
    const { container } = render(
      <AnimalGallery images={undefined as unknown as string[]} species="dog" name="Luna" />,
    );
    expect(container.textContent).toContain('🐕');
  });

  it('renders a single image without swiper', () => {
    render(
      <AnimalGallery images={['http://example.com/photo.jpg']} species="dog" name="Luna" />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Luna - foto');
    expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
  });

  it('renders swiper gallery for multiple images', () => {
    render(
      <AnimalGallery
        images={['http://example.com/a.jpg', 'http://example.com/b.jpg']}
        species="dog"
        name="Luna"
      />,
    );
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    const slides = screen.getAllByTestId('swiper-slide');
    expect(slides).toHaveLength(2);
  });

  it('renders correct alt text for each image in gallery', () => {
    render(
      <AnimalGallery
        images={['http://example.com/a.jpg', 'http://example.com/b.jpg']}
        species="cat"
        name="Milo"
      />,
    );
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('alt', 'Milo - foto 1');
    expect(images[1]).toHaveAttribute('alt', 'Milo - foto 2');
  });
});
