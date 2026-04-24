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
      <h1 className="text-2xl font-bold">Settings</h1>

      <form
        action={`/api/guilds/${guildId}/settings`}
        method="POST"
        className="space-y-5 bg-gray-800 rounded-xl p-6"
      >
        <div>
          <label className="block text-sm text-gray-400 mb-1">Log Channel ID</label>
          <input
            name="logChannelId"
            defaultValue={settings?.logChannelId ?? ''}
            placeholder="Discord channel ID"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Moderation actions will be logged to this channel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="automodEnabled"
            id="automodEnabled"
            defaultChecked={settings?.automodEnabled ?? true}
            className="w-4 h-4 accent-indigo-500"
          />
          <label htmlFor="automodEnabled" className="text-sm">
            Enable Automod
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Spam Threshold (messages per interval)
          </label>
          <input
            type="number"
            name="spamThreshold"
            defaultValue={settings?.spamThreshold ?? 5}
            min={2}
            max={50}
            className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Spam Interval (seconds)
          </label>
          <input
            type="number"
            name="spamInterval"
            defaultValue={settings?.spamInterval ?? 5}
            min={1}
            max={60}
            className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Blacklisted Words (comma-separated)
          </label>
          <textarea
            name="blacklistedWords"
            defaultValue={(settings?.blacklistedWords ?? []).join(', ')}
            rows={3}
            placeholder="word1, word2, phrase three"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Allowed Link Domains (comma-separated)
          </label>
          <textarea
            name="allowedLinks"
            defaultValue={(settings?.allowedLinks ?? []).join(', ')}
            rows={2}
            placeholder="discord.com, youtube.com"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to block all links (when link detection is enabled).
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
