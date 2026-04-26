import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { db } from '../../../../../lib/db';

const inputCls = 'w-full bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';

export default async function LoggingPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const s = await db.guildSettings.findUnique({ where: { guildId } });

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/${guildId}/settings`}
          className="flex items-center gap-1 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/80 transition-colors"
        >
          <ChevronLeft size={12} /> Settings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Logging</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          All moderation actions (bans, mutes, warns, kicks) are posted to this channel.
        </p>
      </div>

      <form action={`/api/guilds/${guildId}/settings/logging`} method="POST" className="space-y-6">
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">
              Log Channel ID
            </label>
            <input
              name="logChannelId"
              defaultValue={s?.logChannelId ?? ''}
              placeholder="Right-click a channel → Copy ID"
              className={inputCls}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">Leave blank to disable mod logging.</p>
          </div>
        </div>

        <div className="flex justify-end">
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
