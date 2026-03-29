import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/services/http', () => ({ api: { post: jest.fn() } }));
jest.mock('next/navigation', () => ({ useParams: () => ({ animalId: '5' }) }));

// Override the global next-intl mock to add t.rich support needed by the success state
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const esMessages = require('../../../../../messages/es.json');
    const messages: Record<string, unknown> = namespace
      ? ((esMessages as Record<string, unknown>)[namespace] as Record<string, unknown>) || {}
      : (esMessages as Record<string, unknown>);
    function t(key: string, params?: Record<string, string | number>): string {
      const value = key.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
        return undefined;
      }, messages);
      if (typeof value !== 'string') return key;
      if (!params) return value;
      return value.replace(/\{(\w+)\}/g, (_: string, k: string) => String(params[k] ?? `{${k}}`));
    }
    t.rich = (key: string, params?: Record<string, unknown>): React.ReactNode => {
      const value = key.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
        return undefined;
      }, messages);
      if (typeof value !== 'string') return key;
      // Split on <tag>content</tag> or {variable} patterns
      const parts = value.split(/(<\w+>[^<]*<\/\w+>|\{\w+\})/g);
      return React.createElement(
        React.Fragment,
        null,
        ...parts.map((part) => {
          const tagMatch = part.match(/^<(\w+)>(.*)<\/\w+>$/);
          if (tagMatch) {
            const tagFn = params?.[tagMatch[1]];
            return typeof tagFn === 'function' ? tagFn(tagMatch[2]) : tagMatch[2];
          }
          const varMatch = part.match(/^\{(\w+)\}$/);
          if (varMatch) return String(params?.[varMatch[1]] ?? part);
          return part;
        }),
      );
    };
    return t;
  },
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <svg data-testid="arrow-left" {...props} />,
  CheckCircle2: (props: any) => <svg data-testid="check-circle" {...props} />,
}));

jest.mock('@/lib/stores/animalStore', () => ({ useAnimalStore: jest.fn() }));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/components/ui', () => ({
  AdoptionForm: ({ onSubmit, submitting, animalName }: any) => (
    <div data-testid="adoption-form">
      <span>{animalName}</span>
      <button
        onClick={() => onSubmit({ form_answers: {}, notes: '' })}
        data-testid="submit-form"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  ),
}));

import AdoptPage from '../page';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

const mockUseAnimalStore = useAnimalStore as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApiPost = api.post as jest.Mock;

const mockAnimal = {
  id: 5,
  name: 'Rex',
  species: 'dog',
  breed: 'Mestizo',
  age_range: 'adult',
  gender: 'male',
  size: 'large',
  status: 'published',
  is_vaccinated: true,
  is_sterilized: false,
  shelter: 1,
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  gallery_urls: [],
  created_at: '2026-01-10T12:00:00Z',
};

const mockUser = {
  id: 1,
  email: 'adopter@example.com',
  first_name: 'Carlos',
  last_name: 'Pérez',
  phone: '3001234567',
  city: 'Bogotá',
  role: 'adopter',
  is_staff: false,
  is_active: true,
};

function setupLoadedState() {
  const animalState = {
    animal: mockAnimal,
    loading: false,
    fetchAnimal: jest.fn(),
  };
  const authState = { user: mockUser };
  mockUseAnimalStore.mockImplementation((sel: any) => sel(animalState));
  mockUseAuthStore.mockImplementation((sel: any) => sel(authState));
  return { animalState, authState };
}

describe('AdoptPage — loaded state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLoadedState();
  });

  it('renders back link to animal detail', () => {
    render(<AdoptPage />);
    expect(screen.getByTestId('arrow-left')).toBeInTheDocument();
  });

  it('renders AdoptionForm when animal is loaded', () => {
    render(<AdoptPage />);
    expect(screen.getByTestId('adoption-form')).toBeInTheDocument();
  });

  it('passes animal name to AdoptionForm', () => {
    render(<AdoptPage />);
    expect(screen.getByTestId('adoption-form')).toHaveTextContent('Rex');
  });
});

describe('AdoptPage — loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const animalState = {
      animal: null,
      loading: true,
      fetchAnimal: jest.fn(),
    };
    const authState = { user: null };
    mockUseAnimalStore.mockImplementation((sel: any) => sel(animalState));
    mockUseAuthStore.mockImplementation((sel: any) => sel(authState));
  });

  it('shows loading skeleton when loading', () => {
    render(<AdoptPage />);
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument();
  });

  it('does not render AdoptionForm while loading', () => {
    render(<AdoptPage />);
    expect(screen.queryByTestId('adoption-form')).not.toBeInTheDocument();
  });
});

describe('AdoptPage — success state after submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ data: {} });
    setupLoadedState();
  });

  it('shows CheckCircle2 icon after successful submission', async () => {
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    });
  });

  it('shows success title after successful submission', async () => {
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Solicitud enviada');
    });
  });

  it('shows link to my applications after successful submission', async () => {
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Ver mis solicitudes/i })).toBeInTheDocument();
    });
  });

  it('shows link to explore animals after successful submission', async () => {
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Explorar animales/i })).toBeInTheDocument();
    });
  });

  it('hides AdoptionForm after successful submission', async () => {
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.queryByTestId('adoption-form')).not.toBeInTheDocument();
    });
  });
});

describe('AdoptPage — error state after failed submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLoadedState();
  });

  it('shows server error message when api.post returns error detail', async () => {
    mockApiPost.mockRejectedValue({ response: { data: { detail: 'Ya tienes una solicitud activa' } } });
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByText('Ya tienes una solicitud activa')).toBeInTheDocument();
    });
  });

  it('shows default error message when api.post rejects without response data', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByText('Error al enviar la solicitud')).toBeInTheDocument();
    });
  });

  it('keeps AdoptionForm visible after failed submission', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByTestId('adoption-form')).toBeInTheDocument();
    });
  });
});

describe('AdoptPage — submitting state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLoadedState();
  });

  it('shows submitting state on AdoptionForm while request is in flight', async () => {
    let resolvePost!: (v: any) => void;
    mockApiPost.mockReturnValue(new Promise((res) => { resolvePost = res; }));
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    expect(await screen.findByText('Submitting...')).toBeInTheDocument();
    resolvePost({ data: {} });
  });
});

describe('AdoptPage — no user state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const animalState = {
      animal: mockAnimal,
      loading: false,
      fetchAnimal: jest.fn(),
    };
    const authState = { user: null };
    mockUseAnimalStore.mockImplementation((sel: any) => sel(animalState));
    mockUseAuthStore.mockImplementation((sel: any) => sel(authState));
  });

  it('renders AdoptionForm without default values when user is null', () => {
    render(<AdoptPage />);
    expect(screen.getByTestId('adoption-form')).toBeInTheDocument();
    expect(screen.getByText('Rex')).toBeInTheDocument();
  });
});

describe('AdoptPage — error response with error field', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLoadedState();
  });

  it('shows error field value when api.post returns error key in response data', async () => {
    mockApiPost.mockRejectedValue({ response: { data: { error: 'Animal no disponible' } } });
    const user = userEvent.setup();
    render(<AdoptPage />);
    await user.click(screen.getByTestId('submit-form'));
    await waitFor(() => {
      expect(screen.getByText('Animal no disponible')).toBeInTheDocument();
    });
  });
});
