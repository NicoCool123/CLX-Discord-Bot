import { db } from '../../../../lib/db';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const settings = await db.guildSettings.findUnique({ where: { guildId } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">Configure your server&apos;s moderation behaviour.</p>
      </div>

      <form
        action={`/api/guilds/${guildId}/settings`}
        method="POST"
        className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden"
      >
        {/* Section: Logging */}
        <div className="px-6 py-5 border-b border-[#e5e7eb]/10">
          <h2 className="text-sm font-semibold text-[#e5e7eb]/60 uppercase tracking-wide mb-4">Logging</h2>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Log Channel ID</label>
            <input
              name="logChannelId"
              defaultValue={settings?.logChannelId ?? ''}
              placeholder="Discord channel ID"
              className="w-full bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
              Moderation actions will be logged to this channel.
            </p>
          </div>
        </div>

        {/* Section: Automod */}
        <div className="px-6 py-5 border-b border-[#e5e7eb]/10">
          <h2 className="text-sm font-semibold text-[#e5e7eb]/60 uppercase tracking-wide mb-4">Automod</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="automodEnabled"
                id="automodEnabled"
                defaultChecked={settings?.automodEnabled ?? true}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="automodEnabled" className="text-sm text-white">
                Enable Automod
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Spam Threshold
                  <span className="text-[#e5e7eb]/40 font-normal text-xs ml-1">messages per interval</span>
                </label>
                <input
                  type="number"
                  name="spamThreshold"
                  defaultValue={settings?.spamThreshold ?? 5}
                  min={2}
                  max={50}
                  className="w-full bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Spam Interval
                  <span className="text-[#e5e7eb]/40 font-normal text-xs ml-1">seconds</span>
                </label>
                <input
                  type="number"
                  name="spamInterval"
                  defaultValue={settings?.spamInterval ?? 5}
                  min={1}
                  max={60}
                  className="w-full bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Content filtering */}
        <div className="px-6 py-5 border-b border-[#e5e7eb]/10">
          <h2 className="text-sm font-semibold text-[#e5e7eb]/60 uppercase tracking-wide mb-4">Content Filtering</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Blacklisted Words</label>
              <textarea
                name="blacklistedWords"
                defaultValue={(settings?.blacklistedWords ?? []).join(', ')}
                rows={3}
                placeholder="word1, word2, phrase three"
                className="w-full bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">Comma-separated list of words to block.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Allowed Link Domains</label>
              <textarea
                name="allowedLinks"
                defaultValue={(settings?.allowedLinks ?? []).join(', ')}
                rows={2}
                placeholder="discord.com, youtube.com"
                className="w-full bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1.5">
                Leave empty to block all links when link detection is enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
