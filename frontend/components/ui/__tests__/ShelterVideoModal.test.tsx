import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';

import ShelterVideoModal from '../ShelterVideoModal';

describe('ShelterVideoModal', () => {
  const onClose = jest.fn();
  const props = {
    open: true,
    onClose,
    videoUrl: '/media/shelters/videos/sample.mp4',
  };

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders nothing when closed', () => {
    render(<ShelterVideoModal {...props} open={false} />);
    expect(screen.queryByTestId('shelter-video-overlay')).not.toBeInTheDocument();
  });

  it('renders video element with the provided src when open', () => {
    render(<ShelterVideoModal {...props} />);
    const player = screen.getByTestId('shelter-video-player') as HTMLVideoElement;
    expect(player).toBeInTheDocument();
    expect(player.getAttribute('src')).toBe('/media/shelters/videos/sample.mp4');
  });

  it('renders default title from translations when none is provided', () => {
    render(<ShelterVideoModal {...props} />);
    expect(screen.getByText('Video del refugio')).toBeInTheDocument();
  });

  it('uses the provided title when given', () => {
    render(<ShelterVideoModal {...props} title="Patitas Felices" />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    render(<ShelterVideoModal {...props} />);
    const overlay = screen.getByTestId('shelter-video-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked', () => {
    render(<ShelterVideoModal {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar video' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    render(<ShelterVideoModal {...props} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
