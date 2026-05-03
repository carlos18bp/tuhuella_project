import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterOnboardingPage from '../page';

const mockReplace = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('ShelterOnboardingPage (legacy redirect)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /shelter-application on mount', () => {
    render(<ShelterOnboardingPage />);
    expect(mockReplace).toHaveBeenCalledWith('/shelter-application');
  });

  it('renders a redirecting placeholder', () => {
    render(<ShelterOnboardingPage />);
    expect(screen.getByText(/Redirigiendo/i)).toBeInTheDocument();
  });
});
