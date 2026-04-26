import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { db } from '../../../../../lib/db';

const inputCls = 'w-full bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';

const chips = ['{member}', '{server}', '{count}'];

export default async function WelcomePage({ params }: { params: Promise<{ guildId: string }> }) {
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
        <h1 className="text-2xl font-bold text-white">Welcome Messages</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Greet new members automatically when they join.
        </p>
      </div>

      <form action={`/api/guilds/${guildId}/settings/welcome`} method="POST">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — channel config */}
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Channel</p>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
                Welcome Channel ID
              </label>
              <input
                name="welcomeChannelId"
                defaultValue={s?.welcomeChannelId ?? ''}
                placeholder="Right-click a channel → Copy ID"
                className={inputCls}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">Leave blank to disable welcome messages.</p>
            </div>
          </div>

          {/* Right — message builder */}
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Message Template</p>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
                Welcome Message
              </label>
              <textarea
                name="welcomeMessage"
                defaultValue={s?.welcomeMessage ?? ''}
                rows={5}
                placeholder={`Hey {member}, welcome to {server}! You're member #{count}.`}
                className={`${inputCls} resize-none`}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
                Leave blank to use the default embed message.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#e5e7eb]/40 uppercase tracking-wide mb-2">
                Available placeholders
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#e5e7eb]/25 mt-2">
                <span className="font-mono text-indigo-400/70">{'{member}'}</span> → Discord mention ·{' '}
                <span className="font-mono text-indigo-400/70">{'{server}'}</span> → server name ·{' '}
                <span className="font-mono text-indigo-400/70">{'{count}'}</span> → member number
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
    </div>
  );
}
