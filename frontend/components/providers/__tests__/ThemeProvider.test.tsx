import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

import { ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <span>Child content</span>
      </ThemeProvider>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('passes correct theme props to NextThemesProvider', () => {
    render(
      <ThemeProvider>
        <span>Child</span>
      </ThemeProvider>,
    );
    const provider = screen.getByTestId('next-themes-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');
    expect(props.attribute).toBe('class');
    expect(props.defaultTheme).toBe('system');
    expect(props.enableSystem).toBe(true);
    expect(props.storageKey).toBe('mi-huella-theme');
    expect(props.disableTransitionOnChange).toBe(true);
  });
});
