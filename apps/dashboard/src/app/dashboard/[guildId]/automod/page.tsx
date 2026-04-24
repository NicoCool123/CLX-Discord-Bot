import { db } from '../../../../lib/db';
import { AutomodRuleType, AutomodAction } from '@clx/database';

const RULE_LABELS: Record<AutomodRuleType, { label: string; desc: string; icon: string }> = {
  SPAM:           { label: 'Spam Detection',  desc: 'Detects users sending too many messages in a short interval.',         icon: '💬' },
  WORD_FILTER:    { label: 'Word Filter',     desc: 'Removes messages containing blacklisted words or phrases.',            icon: '🚫' },
  LINK_DETECTION: { label: 'Link Detection',  desc: 'Blocks links that are not in the allowed domains list.',               icon: '🔗' },
};

const ACTION_LABELS: Record<AutomodAction, string> = {
  WARN:    'Warn',
  TIMEOUT: 'Timeout (10m)',
  KICK:    'Kick',
  BAN:     'Ban',
  DELETE:  'Delete only',
};

export default async function AutomodPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const rules = await db.automodRule.findMany({ where: { guildId } });
  const rulesByType = Object.fromEntries(rules.map((r) => [r.type, r]));

  const ruleTypes: AutomodRuleType[] = [
    AutomodRuleType.SPAM,
    AutomodRuleType.WORD_FILTER,
    AutomodRuleType.LINK_DETECTION,
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Automod Rules</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Configure automated responses to each type of violation. Word lists and allowed domains are
          configured in{' '}
          <a href="../settings" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Settings
          </a>
          .
        </p>
      </div>

      <div className="space-y-4">
        {ruleTypes.map((type) => {
          const rule = rulesByType[type];
          const meta = RULE_LABELS[type];
          return (
            <div key={type} className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
              {/* Rule header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-[#e5e7eb]/10">
                <div className="w-9 h-9 rounded-lg bg-[#111827] flex items-center justify-center text-lg flex-shrink-0">
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{meta.label}</h2>
                  <p className="text-xs text-[#e5e7eb]/40 mt-0.5">{meta.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rule?.enabled
                      ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                      : 'text-[#e5e7eb]/30 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10'
                  }`}>
                    {rule?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Rule form */}
              <form
                action={`/api/guilds/${guildId}/automod`}
                method="POST"
                className="px-5 py-4 flex items-end gap-4 flex-wrap"
              >
                <input type="hidden" name="type" value={type} />

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    name="enabled"
                    id={`enabled-${type}`}
                    defaultChecked={rule?.enabled ?? false}
                    className="w-4 h-4 accent-indigo-500 rounded"
                  />
                  <label htmlFor={`enabled-${type}`} className="text-sm text-[#e5e7eb]/70">
                    Enabled
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="text-sm text-[#e5e7eb]/50 whitespace-nowrap">Action</label>
                  <select
                    name="action"
                    defaultValue={rule?.action ?? AutomodAction.WARN}
                    className="bg-[#111827] border border-[#e5e7eb]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  >
                    {Object.entries(ACTION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
