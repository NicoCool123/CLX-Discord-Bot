import { db } from '../../../../lib/db';
import { Hash, Shield, Zap, Type, Link2, Save, Ticket } from 'lucide-react';

const inputCls = 'w-full bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5e7eb]/10 bg-[#09090b]/40">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-[#e5e7eb]/40">{desc}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const settings = await db.guildSettings.findUnique({ where: { guildId } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">Configure logging, automod behaviour, and content filters.</p>
      </div>

      <form action={`/api/guilds/${guildId}/settings`} method="POST" className="space-y-6">

        {/* Logging */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Hash size={15} className="text-indigo-400" />} title="Logging" desc="Where moderation actions are reported" />
          <div className="px-6 py-5">
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Log Channel ID</label>
            <input
              name="logChannelId"
              defaultValue={settings?.logChannelId ?? ''}
              placeholder="Right-click a channel → Copy ID"
              className={inputCls}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">All moderation actions will be posted to this channel.</p>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Shield size={15} className="text-indigo-400" />} title="Roles" desc="Role assignments used during moderation" />
          <div className="px-6 py-5">
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Mute Role ID</label>
            <input
              name="muteRoleId"
              defaultValue={settings?.muteRoleId ?? ''}
              placeholder="Role ID used when muting members"
              className={inputCls}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
              Used as fallback for servers where Discord timeout is unavailable. Leave blank to use Discord&apos;s built-in timeout.
            </p>
          </div>
        </div>

        {/* Automod global */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Zap size={15} className="text-indigo-400" />} title="Automod" desc="Global automod switch and spam settings" />
          <div className="px-6 py-5 space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="automodEnabled"
                id="automodEnabled"
                defaultChecked={settings?.automodEnabled ?? true}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <div>
                <p className="text-sm text-white font-medium">Enable Automod</p>
                <p className="text-xs text-[#e5e7eb]/40">Master switch — disabling this stops all automod rules.</p>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Spam Threshold</label>
                <input
                  type="number"
                  name="spamThreshold"
                  defaultValue={settings?.spamThreshold ?? 5}
                  min={2}
                  max={50}
                  className={inputCls}
                />
                <p className="text-xs text-[#e5e7eb]/30 mt-1">Messages before action (2–50)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Spam Interval (s)</label>
                <input
                  type="number"
                  name="spamInterval"
                  defaultValue={settings?.spamInterval ?? 5}
                  min={1}
                  max={60}
                  className={inputCls}
                />
                <p className="text-xs text-[#e5e7eb]/30 mt-1">Rolling window in seconds (1–60)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Word filter */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Type size={15} className="text-indigo-400" />} title="Word Filter" desc="Words and phrases to remove from messages" />
          <div className="px-6 py-5">
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Blacklisted Words</label>
            <textarea
              name="blacklistedWords"
              defaultValue={(settings?.blacklistedWords ?? []).join(', ')}
              rows={3}
              placeholder="word1, bad phrase, another"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">Comma-separated. Case-insensitive matching.</p>
          </div>
        </div>

        {/* Link detection */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Link2 size={15} className="text-indigo-400" />} title="Link Detection" desc="Domains allowed to be posted" />
          <div className="px-6 py-5">
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Allowed Domains</label>
            <textarea
              name="allowedLinks"
              defaultValue={(settings?.allowedLinks ?? []).join(', ')}
              rows={2}
              placeholder="discord.com, youtube.com, twitch.tv"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">Leave empty to block all links when link detection is enabled.</p>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <SectionHeader icon={<Ticket size={15} className="text-indigo-400" />} title="Tickets" desc="Channel where ticket threads are created" />
          <div className="px-6 py-5">
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Ticket Channel ID</label>
            <input
              name="ticketChannelId"
              defaultValue={settings?.ticketChannelId ?? ''}
              placeholder="Right-click a channel → Copy ID"
              className={inputCls}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">The bot will create threads in this channel when users run /ticket open.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
            <Save size={14} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
