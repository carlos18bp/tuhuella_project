import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TermsModal from '../TermsModal';

describe('TermsModal', () => {
  const defaultProps = {
    open: true,
    onAccept: jest.fn(),
    onDecline: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<TermsModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId('terms-modal')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(<TermsModal {...defaultProps} />);
    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<TermsModal {...defaultProps} />);
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
  });

  it('renders all terms sections', () => {
    render(<TermsModal {...defaultProps} />);
    expect(screen.getByText(/Términos Generales de Uso/)).toBeInTheDocument();
    expect(screen.getByText(/Responsabilidades del Usuario/)).toBeInTheDocument();
    expect(screen.getByText(/Proceso de Adopción/)).toBeInTheDocument();
  });

  it('shows scroll hint before scrolling to bottom', () => {
    render(<TermsModal {...defaultProps} />);
    expect(screen.getByText(/Desplázate para leer/)).toBeInTheDocument();
  });

  it('disables accept button before scrolling to bottom', () => {
    render(<TermsModal {...defaultProps} />);
    const acceptBtn = screen.getByTestId('terms-accept-btn');
    expect(acceptBtn).toBeDisabled();
  });

  it('calls onClose when close button clicked', async () => {
    render(<TermsModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Cerrar'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when decline button clicked', async () => {
    render(<TermsModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Rechazar'));
    expect(defaultProps.onDecline).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking overlay backdrop', async () => {
    render(<TermsModal {...defaultProps} />);
    await userEvent.click(screen.getByTestId('terms-modal-overlay'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    render(<TermsModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button instead of actions when showActions is false', () => {
    render(<TermsModal {...defaultProps} showActions={false} />);
    expect(screen.queryByTestId('terms-accept-btn')).not.toBeInTheDocument();
    expect(screen.queryByText('Rechazar')).not.toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  it('has correct dialog role and aria attributes', () => {
    render(<TermsModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
