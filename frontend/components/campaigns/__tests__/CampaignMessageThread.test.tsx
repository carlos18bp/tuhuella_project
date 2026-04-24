import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CampaignMessageThread from '../CampaignMessageThread';
import { useCampaignStore } from '@/lib/stores/campaignStore';

jest.mock('@/lib/services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const buildMessage = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  campaign: 1,
  author: 10,
  author_name: 'Ana',
  author_role: 'shelter_admin',
  body: 'Hola equipo',
  is_system: false,
  created_at: '2026-04-19T10:00:00Z',
  ...overrides,
});

const resetStore = (initial: Partial<ReturnType<typeof useCampaignStore.getState>> = {}) => {
  useCampaignStore.setState({
    campaigns: [],
    campaign: null,
    messagesByCampaign: {},
    loading: false,
    messagesLoading: false,
    error: null,
    fetchMessages: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn().mockResolvedValue({}),
    ...initial,
  });
};

describe('CampaignMessageThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('renders empty-state copy when no messages exist', async () => {
    resetStore({ messagesByCampaign: { 1: [] } });

    render(<CampaignMessageThread campaignId={1} />);

    expect(await screen.findByText('Aún no hay mensajes.')).toBeInTheDocument();
  });

  it('shows loading copy while first fetch is pending', () => {
    resetStore({ messagesLoading: true, messagesByCampaign: { 1: [] } });

    render(<CampaignMessageThread campaignId={1} />);

    expect(screen.getByText('Cargando mensajes...')).toBeInTheDocument();
  });

  it('renders existing cached messages without fetching again', async () => {
    const fetchSpy = jest.fn();
    resetStore({
      messagesByCampaign: { 1: [buildMessage({ body: 'Hola equipo' })] },
      fetchMessages: fetchSpy as never,
    });

    render(<CampaignMessageThread campaignId={1} />);

    expect(await screen.findByText('Hola equipo')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('calls fetchMessages on mount when no cached thread exists', async () => {
    const fetchSpy = jest.fn().mockImplementation(async (id: number) => {
      useCampaignStore.setState((s) => ({
        messagesByCampaign: { ...s.messagesByCampaign, [id]: [] },
      }));
    });
    resetStore({ fetchMessages: fetchSpy as never, messagesByCampaign: { 99: [] } });

    render(<CampaignMessageThread campaignId={42} />);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(42));
  });

  it('renders system messages with "Sistema" label', async () => {
    resetStore({
      messagesByCampaign: {
        1: [buildMessage({ is_system: true, body: 'Aprobada', author: 0 })],
      },
    });

    render(<CampaignMessageThread campaignId={1} />);

    expect(await screen.findByText('Sistema')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('renders current-user bubble with author-specific styling', async () => {
    resetStore({
      messagesByCampaign: {
        1: [buildMessage({ author: 99, body: 'Mensaje mío' })],
      },
    });

    render(<CampaignMessageThread campaignId={1} currentUserId={99} />);

    const bubble = (await screen.findByText('Mensaje mío')).parentElement as HTMLElement;
    expect(bubble.className).toContain('bg-teal-600');
  });

  it('renders web-manager messages with muted bubble styling', async () => {
    resetStore({
      messagesByCampaign: {
        1: [buildMessage({ author: 1, author_role: 'web_manager', body: 'Review' })],
      },
    });

    render(<CampaignMessageThread campaignId={1} currentUserId={99} />);

    const bubble = (await screen.findByText('Review')).parentElement as HTMLElement;
    expect(bubble.className).toContain('bg-surface-secondary');
  });

  it('disables send button when textarea is empty', () => {
    resetStore({ messagesByCampaign: { 1: [] } });

    render(<CampaignMessageThread campaignId={1} />);

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('enables send button when message has content', async () => {
    resetStore({ messagesByCampaign: { 1: [] } });
    const user = userEvent.setup();

    render(<CampaignMessageThread campaignId={1} />);
    await user.type(screen.getByPlaceholderText('Escribe un mensaje...'), 'hola');

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeEnabled();
  });

  it('calls sendMessage and clears textarea on submit', async () => {
    const sendSpy = jest.fn().mockResolvedValue({ id: 2 });
    resetStore({ messagesByCampaign: { 1: [] }, sendMessage: sendSpy });
    const user = userEvent.setup();

    render(<CampaignMessageThread campaignId={1} />);
    const textarea = screen.getByPlaceholderText('Escribe un mensaje...');
    await user.type(textarea, 'hola');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(sendSpy).toHaveBeenCalledWith(1, 'hola'));
    expect(textarea).toHaveValue('');
  });

  it('does not call sendMessage when body is only whitespace', async () => {
    const sendSpy = jest.fn();
    resetStore({ messagesByCampaign: { 1: [] }, sendMessage: sendSpy });
    const user = userEvent.setup();

    render(<CampaignMessageThread campaignId={1} />);
    const textarea = screen.getByPlaceholderText('Escribe un mensaje...');
    await user.type(textarea, '   ');
    const button = screen.getByRole('button', { name: 'Enviar' });
    expect(button).toBeDisabled();
  });
});
