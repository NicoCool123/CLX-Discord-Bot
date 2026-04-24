import { db } from '../../../../lib/db';
import { AutomodRuleType, AutomodAction } from '@clx/database';

const RULE_LABELS: Record<AutomodRuleType, string> = {
  SPAM: 'Spam Detection',
  WORD_FILTER: 'Word Filter',
  LINK_DETECTION: 'Link Detection',
};

const ACTION_LABELS: Record<AutomodAction, string> = {
  WARN: 'Warn',
  TIMEOUT: 'Timeout (10m)',
  KICK: 'Kick',
  BAN: 'Ban',
  DELETE: 'Delete only',
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
      <h1 className="text-2xl font-bold">Automod Rules</h1>
      <p className="text-gray-400 text-sm">
        Configure how the bot responds to each type of violation. Word lists and allowed domains are
        configured in{' '}
        <a href="../settings" className="text-indigo-400 hover:underline">
          Settings
        </a>
        .
      </p>

      <div className="space-y-4">
        {ruleTypes.map((type) => {
          const rule = rulesByType[type];
          return (
            <form
              key={type}
              action={`/api/guilds/${guildId}/automod`}
              method="POST"
              className="bg-gray-800 rounded-xl p-5 space-y-4"
            >
              <input type="hidden" name="type" value={type} />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{RULE_LABELS[type]}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Enabled</label>
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={rule?.enabled ?? false}
                    className="w-4 h-4 accent-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Action</label>
                <select
                  name="action"
                  defaultValue={rule?.action ?? AutomodAction.WARN}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {Object.entries(ACTION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
