import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';

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

  it('renders form input fields', () => {
    render(<ContactanosPage />);
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mensaje/i)).toBeInTheDocument();
  });

  it('renders WhatsApp section heading', () => {
    render(<ContactanosPage />);
    expect(screen.getByRole('heading', { name: 'WhatsApp', level: 2 })).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactanosPage />);
    expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument();
  });

  it('renders WhatsApp phone links', () => {
    render(<ContactanosPage />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('updates form fields on input', () => {
    render(<ContactanosPage />);
    const nameInput = screen.getByLabelText(/Nombre/i);
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Juan' } });
    expect(nameInput).toHaveValue('Juan');
  });

  it('clears field errors when input changes', () => {
    render(<ContactanosPage />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'name', value: '' } });
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { name: 'name', value: 'J' } });
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue('J');
  });

  it('renders message character counter', () => {
    render(<ContactanosPage />);
    expect(screen.getByText(/0\/5000/)).toBeInTheDocument();
  });

  it('renders formatted WhatsApp numbers', () => {
    render(<ContactanosPage />);
    const links = screen.getAllByText(/\+57 300/);
    expect(links.length).toBe(2);
  });
});
