import { db } from '../../../../lib/db';
import { AutomodRuleType, AutomodAction } from '@clx/database';
import { MessageSquareWarning, Type, Link2, ChevronRight } from 'lucide-react';

const ACTION_LABELS: Record<AutomodAction, string> = {
  WARN:    'Warn user',
  TIMEOUT: 'Timeout (10 min)',
  KICK:    'Kick user',
  BAN:     'Ban user',
  DELETE:  'Delete message only',
};

const inputCls = 'w-full bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';
const selectCls = 'bg-[#09090b] border border-[#e5e7eb]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors';

export default async function AutomodPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const [rules, settings] = await Promise.all([
    db.automodRule.findMany({ where: { guildId } }),
    db.guildSettings.findUnique({ where: { guildId } }),
  ]);

  const ruleMap = Object.fromEntries(rules.map((r) => [r.type, r]));

  const spamRule   = ruleMap[AutomodRuleType.SPAM];
  const wordRule   = ruleMap[AutomodRuleType.WORD_FILTER];
  const linkRule   = ruleMap[AutomodRuleType.LINK_DETECTION];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Automod</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Configure each detection rule independently. Changes take effect immediately.
        </p>
      </div>

      {/* ── SPAM ─────────────────────────────────────────────── */}
      <section className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e5e7eb]/10">
          <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
            <MessageSquareWarning size={17} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white">Spam Detection</h2>
            <p className="text-xs text-[#e5e7eb]/40 mt-0.5">
              Triggers when a user sends too many messages within a time window, or sends duplicate messages.
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            spamRule?.enabled
              ? 'text-green-400 bg-green-400/10 border border-green-400/20'
              : 'text-[#e5e7eb]/30 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10'
          }`}>
            {spamRule?.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <form action={`/api/guilds/${guildId}/automod/spam`} method="POST" className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Message Threshold</label>
              <input
                type="number"
                name="spamThreshold"
                defaultValue={settings?.spamThreshold ?? 5}
                min={2}
                max={50}
                className={inputCls}
              />
              <p className="text-xs text-[#e5e7eb]/30 mt-1">Messages before triggering (2–50)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Time Window (seconds)</label>
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
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Action</label>
            <select name="action" defaultValue={spamRule?.action ?? AutomodAction.WARN} className={selectCls}>
              {Object.entries(ACTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="enabled" defaultChecked={spamRule?.enabled ?? false} className="w-4 h-4 accent-indigo-500 rounded" />
              <span className="text-sm text-[#e5e7eb]/70">Enable this rule</span>
            </label>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
              Save <ChevronRight size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* ── WORD FILTER ──────────────────────────────────────── */}
      <section className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e5e7eb]/10">
          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <Type size={17} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white">Word Filter</h2>
            <p className="text-xs text-[#e5e7eb]/40 mt-0.5">
              Removes messages containing blacklisted words or phrases. Matching is case-insensitive.
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            wordRule?.enabled
              ? 'text-green-400 bg-green-400/10 border border-green-400/20'
              : 'text-[#e5e7eb]/30 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10'
          }`}>
            {wordRule?.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <form action={`/api/guilds/${guildId}/automod/word-filter`} method="POST" className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Blacklisted Words & Phrases</label>
            <textarea
              name="blacklistedWords"
              defaultValue={(settings?.blacklistedWords ?? []).join(', ')}
              rows={4}
              placeholder="badword1, bad phrase, another word"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1">
              Comma-separated. Phrases with spaces are matched as whole sequences.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Action</label>
            <select name="action" defaultValue={wordRule?.action ?? AutomodAction.DELETE} className={selectCls}>
              {Object.entries(ACTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="enabled" defaultChecked={wordRule?.enabled ?? false} className="w-4 h-4 accent-indigo-500 rounded" />
              <span className="text-sm text-[#e5e7eb]/70">Enable this rule</span>
            </label>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
              Save <ChevronRight size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* ── LINK DETECTION ───────────────────────────────────── */}
      <section className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e5e7eb]/10">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Link2 size={17} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white">Link Detection</h2>
            <p className="text-xs text-[#e5e7eb]/40 mt-0.5">
              Blocks URLs that are not on the allowed-domains list. Leave list empty to block all links.
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            linkRule?.enabled
              ? 'text-green-400 bg-green-400/10 border border-green-400/20'
              : 'text-[#e5e7eb]/30 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10'
          }`}>
            {linkRule?.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <form action={`/api/guilds/${guildId}/automod/link-detection`} method="POST" className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Allowed Domains</label>
            <textarea
              name="allowedLinks"
              defaultValue={(settings?.allowedLinks ?? []).join(', ')}
              rows={3}
              placeholder="discord.com, youtube.com, twitch.tv"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-[#e5e7eb]/30 mt-1">
              Comma-separated domains. Leave empty to block <em>all</em> links.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#e5e7eb]/50 uppercase tracking-wide mb-2">Action</label>
            <select name="action" defaultValue={linkRule?.action ?? AutomodAction.DELETE} className={selectCls}>
              {Object.entries(ACTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="enabled" defaultChecked={linkRule?.enabled ?? false} className="w-4 h-4 accent-indigo-500 rounded" />
              <span className="text-sm text-[#e5e7eb]/70">Enable this rule</span>
            </label>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
              Save <ChevronRight size={14} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
