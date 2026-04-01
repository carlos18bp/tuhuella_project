import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('react-google-recaptcha', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const MockRecaptcha = React.forwardRef(
    (_props: { onChange?: (token: string | null) => void }, ref: React.Ref<{ reset: () => void }>) => {
      React.useImperativeHandle(ref, () => ({ reset: () => {} }));
      return <div data-testid="mock-recaptcha" />;
    },
  );
  MockRecaptcha.displayName = 'MockRecaptcha';
  return MockRecaptcha;
});

const mockGet = jest.fn().mockResolvedValue({ data: { site_key: '' } });
const mockPost = jest.fn();

jest.mock('@/lib/services/http', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

import ContactanosPage from '../page';

describe('ContactanosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: { site_key: '' } });
  });

  it('renders page title and subtitle', () => {
    render(<ContactanosPage />);
    expect(screen.getByRole('heading', { name: 'Contáctanos', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Escríbenos desde el formulario/i)).toBeInTheDocument();
  });

  it('renders form fields and WhatsApp section', () => {
    render(<ContactanosPage />);
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'WhatsApp', level: 2 })).toBeInTheDocument();
  });
});
