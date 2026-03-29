import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterGallery from '../ShelterGallery';

const images = [
  'http://example.com/img1.jpg',
  'http://example.com/img2.jpg',
  'http://example.com/img3.jpg',
];

describe('ShelterGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null for empty images array', () => {
    const { container } = render(<ShelterGallery images={[]} shelterName="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null for undefined images', () => {
    const { container } = render(<ShelterGallery images={undefined as any} shelterName="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Swiper with images', () => {
    render(<ShelterGallery images={images} shelterName="Patitas" />);
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    expect(screen.getByAltText('Patitas - 1')).toBeInTheDocument();
    expect(screen.getByAltText('Patitas - 2')).toBeInTheDocument();
    expect(screen.getByAltText('Patitas - 3')).toBeInTheDocument();
  });

  it('opens lightbox on image click', async () => {
    render(<ShelterGallery images={images} shelterName="Patitas" />);
    const user = userEvent.setup();

    const imageButton = screen.getByAltText('Patitas - 1').closest('button')!;
    await user.click(imageButton);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates lightbox forward with next button', async () => {
    render(<ShelterGallery images={images} shelterName="Patitas" />);
    const user = userEvent.setup();

    // Open lightbox on first image
    const imageButton = screen.getByAltText('Patitas - 1').closest('button')!;
    await user.click(imageButton);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes lightbox on close button click', async () => {
    render(<ShelterGallery images={images} shelterName="Patitas" />);
    const user = userEvent.setup();

    // Open lightbox
    const imageButton = screen.getByAltText('Patitas - 1').closest('button')!;
    await user.click(imageButton);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    await user.click(closeBtn);
    expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
  });

  it('renders single image without navigation buttons', async () => {
    render(<ShelterGallery images={['http://example.com/single.jpg']} shelterName="Test" />);
    const user = userEvent.setup();

    const imageButton = screen.getByAltText('Test - 1').closest('button')!;
    await user.click(imageButton);

    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siguiente/i })).not.toBeInTheDocument();
  });
});
