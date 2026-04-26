import Link from 'next/link';
import { ChevronLeft, Save, Send } from 'lucide-react';
import { db } from '../../../../../lib/db';
import { SendPanelButton } from '../../../../../components/SendPanelButton';

const inputCls = 'w-full bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';

export default async function TicketsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const s = await db.guildSettings.findUnique({ where: { guildId } });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/${guildId}/settings`}
          className="flex items-center gap-1 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/80 transition-colors"
        >
          <ChevronLeft size={12} /> Settings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Configure the ticket channel, support categories, and the message sent when a ticket opens.
        </p>
      </div>

      <form action={`/api/guilds/${guildId}/settings/tickets`} method="POST">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — channel + categories */}
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-5">
            <p className="text-sm font-semibold text-white">Configuration</p>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
                Ticket Channel ID
              </label>
              <input
                name="ticketChannelId"
                defaultValue={s?.ticketChannelId ?? ''}
                placeholder="Right-click a channel → Copy ID"
                className={inputCls}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
                The bot will create threads in this channel.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
                Support Categories
              </label>
              <input
                name="ticketCategories"
                defaultValue={(s?.ticketCategories ?? []).join(', ')}
                placeholder="Technical, Billing, General"
                className={inputCls}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
                Comma-separated. When set, the panel shows a dropdown instead of a button. Max 25.
              </p>
            </div>
          </div>

          {/* Right — open message builder */}
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Open Message</p>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
                Message sent when a ticket opens
              </label>
              <textarea
                name="ticketOpenMessage"
                defaultValue={s?.ticketOpenMessage ?? ''}
                rows={5}
                placeholder="Hey {member}, thanks for opening a ticket! Our staff will assist you shortly."
                className={`${inputCls} resize-none`}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
                Leave blank for a plain mention. Applies to all ticket creation methods.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#e5e7eb]/40 uppercase tracking-wide mb-2">
                Available placeholder
              </p>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono">
                  {'{member}'}
                </span>
              </div>
              <p className="text-xs text-[#e5e7eb]/25 mt-2">
                <span className="font-mono text-indigo-400/70">{'{member}'}</span> → pings the user who opened the ticket
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </form>

      {/* Send Panel card */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Send size={14} className="text-indigo-400" />
              <p className="text-sm font-semibold text-white">Send Ticket Panel</p>
            </div>
            <p className="text-xs text-[#e5e7eb]/40">
              Push the ticket panel embed to your configured channel.
            </p>
            {s?.ticketChannelId ? (
              <p className="text-xs text-[#e5e7eb]/30 mt-2">
                Channel: <span className="font-mono text-indigo-400/70">{s.ticketChannelId}</span>
                {(s.ticketCategories?.length ?? 0) > 0 && (
                  <span className="ml-2 text-[#e5e7eb]/30">
                    · {s.ticketCategories!.length} {s.ticketCategories!.length === 1 ? 'category' : 'categories'}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-yellow-500/60 mt-2">
                ⚠ Configure a ticket channel above before sending the panel.
              </p>
            )}
          </div>
          {s?.ticketChannelId && <SendPanelButton guildId={guildId} />}
        </div>
      </div>
    </div>
  );
}
