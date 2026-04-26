'use client';
import { useState } from 'react';

export function ModuleToggle({
  guildId,
  module,
  defaultEnabled,
}: {
  guildId: string;
  module: string;
  defaultEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !enabled;
    setEnabled(next); // optimistic
    try {
      await fetch(`/api/guilds/${guildId}/settings/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, enabled: next }),
      });
    } catch {
      setEnabled(!next); // revert on error
    }
    setBusy(false);
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <button
        onClick={toggle}
        aria-label={enabled ? 'Disable module' : 'Enable module'}
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          enabled
            ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
            : 'bg-[#e5e7eb]/15'
        } ${busy ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-[26px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span
        className={`text-[9px] font-semibold tracking-widest transition-colors duration-200 ${
          enabled ? 'text-indigo-400' : 'text-[#e5e7eb]/30'
        }`}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
