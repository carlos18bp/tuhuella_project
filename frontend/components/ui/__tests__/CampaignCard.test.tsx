import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import CampaignCard from '../CampaignCard';
import { mockCampaigns } from '@/lib/__tests__/fixtures';

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    expect(screen.getByText('Fondo Médico de Emergencia')).toBeInTheDocument();
  });

  it('renders shelter name', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    expect(screen.getByText('Patitas Felices')).toBeInTheDocument();
  });

  it('renders campaign description when provided', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    expect(screen.getByText('Ayúdanos a cubrir los costos médicos de animales rescatados')).toBeInTheDocument();
  });

  it('links to campaign detail page', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/campanas/1');
  });

  it('renders progress percentage', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders raised and goal amounts', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    expect(screen.getByText(/125,000/)).toBeInTheDocument();
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(<CampaignCard campaign={mockCampaigns[0]} />);
    const progressBar = screen.getByTestId('progress-bar-fill');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });

  it('caps progress bar at 100%', () => {
    const overFundedCampaign = {
      ...mockCampaigns[0],
      progress_percentage: 120,
    };
    render(<CampaignCard campaign={overFundedCampaign} />);
    const progressBar = screen.getByTestId('progress-bar-fill');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});
