'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function SendPanelButton({ guildId }: { guildId: string }) {
  const [status, setStatus] = useState<Status>('idle');

  const sendPanel = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch(`/api/guilds/${guildId}/settings/tickets/send-panel`, {
        method: 'POST',
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  const label =
    status === 'loading' ? 'Sending…' :
    status === 'success' ? 'Sent!' :
    status === 'error'   ? 'Failed' :
    'Send Panel';

  const cls =
    status === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
    status === 'error'   ? 'bg-red-600 hover:bg-red-700' :
    'bg-indigo-600 hover:bg-indigo-700';

  return (
    <button
      onClick={sendPanel}
      disabled={status === 'loading'}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 ${cls} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <Send size={14} />
      {label}
    </button>
  );
}
