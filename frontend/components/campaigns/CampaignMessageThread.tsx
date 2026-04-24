'use client';

import { useEffect, useState } from 'react';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import type { CampaignMessage } from '@/lib/types';

type Props = {
  campaignId: number;
  currentUserId?: number | null;
};

const EMPTY_MESSAGES: CampaignMessage[] = [];

function bubbleStyle(message: CampaignMessage, currentUserId?: number | null) {
  if (message.is_system) {
    return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200';
  }
  if (currentUserId && message.author === currentUserId) {
    return 'bg-teal-600 text-white';
  }
  if (message.author_role === 'web_manager' || message.author_role === 'admin') {
    return 'bg-surface-secondary text-text-primary ring-1 ring-border-primary';
  }
  return 'bg-surface-tertiary text-text-primary';
}

export default function CampaignMessageThread({ campaignId, currentUserId }: Props) {
  const messages = useCampaignStore((s) => s.messagesByCampaign[campaignId] ?? EMPTY_MESSAGES);
  const loading = useCampaignStore((s) => s.messagesLoading);
  const hasCached = useCampaignStore((s) => campaignId in s.messagesByCampaign);
  const fetchMessages = useCampaignStore((s) => s.fetchMessages);
  const sendMessage = useCampaignStore((s) => s.sendMessage);

  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (hasCached) return;
    void fetchMessages(campaignId);
  }, [campaignId, hasCached, fetchMessages]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(campaignId, text);
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-xl border border-border-primary bg-surface-primary p-5">
      <h2 className="text-lg font-semibold text-text-primary">Conversación</h2>
      <p className="text-xs text-text-tertiary mt-1">
        Coordina con el equipo qué falta para aprobar la campaña.
      </p>

      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading && messages.length === 0 ? (
          <p className="text-sm text-text-quaternary">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-text-quaternary">Aún no hay mensajes.</p>
        ) : (
          messages.map((m) => {
            const isMe = currentUserId && m.author === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${bubbleStyle(m, currentUserId)}`}>
                  <div className="text-[11px] opacity-80 mb-0.5">
                    {m.is_system ? 'Sistema' : `${m.author_name} · ${m.author_role || ''}`}
                    <span className="ml-2">{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{m.body}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSend} className="mt-4 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 min-h-[44px] rounded-lg border border-border-primary bg-surface-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={2}
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className="self-end min-h-11 bg-teal-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
