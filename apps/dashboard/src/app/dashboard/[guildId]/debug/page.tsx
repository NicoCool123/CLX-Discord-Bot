import { db } from '../../../../lib/db';
import { InfractionType } from '@clx/database';
import { CheckCircle, XCircle, AlertTriangle, Zap, Hash, Shield, Bug } from 'lucide-react';
import Link from 'next/link';

function Check({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#e5e7eb]/5 last:border-0">
      {ok
        ? <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
        : <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm text-white">{label}</p>
        {detail && <p className="text-xs text-[#e5e7eb]/40 mt-0.5">{detail}</p>}
      </div>
      <span className={`text-xs font-medium ${ok ? 'text-green-400' : 'text-red-400'}`}>
        {ok ? 'OK' : 'Missing'}
      </span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#09090b] border border-[#e5e7eb]/10 rounded-lg px-4 py-3">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#e5e7eb]/40 mt-0.5">{label}</p>
    </div>
  );
}

export default async function DebugPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [settings, rules, userCount, infractionCount, recentCount, automodInfractions] = await Promise.all([
    db.guildSettings.findUnique({ where: { guildId } }),
    db.automodRule.findMany({ where: { guildId } }),
    db.user.count({ where: { guildId } }),
    db.infraction.count({ where: { guildId } }),
    db.infraction.count({ where: { guildId, createdAt: { gte: thirtyDaysAgo } } }),
    db.infraction.findMany({
      where: { guildId, type: InfractionType.AUTOMOD },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true },
    }),
  ]);

  const ruleMap = Object.fromEntries(rules.map((r) => [r.type, r]));
  const spamRule = ruleMap['SPAM'];
  const wordRule = ruleMap['WORD_FILTER'];
  const linkRule = ruleMap['LINK_DETECTION'];

  const checks = [
    {
      ok: !!settings?.logChannelId,
      label: 'Log Channel configured',
      detail: settings?.logChannelId
        ? `Channel ID: ${settings.logChannelId}`
        : 'Set a log channel in Settings so moderation actions are recorded.',
    },
    {
      ok: settings?.automodEnabled !== false,
      label: 'Automod master switch is ON',
      detail: settings?.automodEnabled === false
        ? 'Automod is globally disabled. Enable it in Settings.'
        : 'Automod is globally active.',
    },
    {
      ok: !!spamRule?.enabled,
      label: 'Spam Detection active',
      detail: spamRule?.enabled
        ? `Action: ${spamRule.action} — ${settings?.spamThreshold ?? 5} msgs / ${settings?.spamInterval ?? 5}s`
        : 'Enable Spam Detection in Automod.',
    },
    {
      ok: !!wordRule?.enabled && (settings?.blacklistedWords?.length ?? 0) > 0,
      label: 'Word Filter active with words',
      detail: wordRule?.enabled
        ? `${settings?.blacklistedWords?.length ?? 0} word(s) configured — Action: ${wordRule.action}`
        : 'Enable Word Filter and add blacklisted words in Automod.',
    },
    {
      ok: !!linkRule?.enabled,
      label: 'Link Detection active',
      detail: linkRule?.enabled
        ? `${settings?.allowedLinks?.length ?? 0} allowed domain(s) — Action: ${linkRule.action}`
        : 'Enable Link Detection in Automod.',
    },
    {
      ok: !!settings?.muteRoleId,
      label: 'Mute Role set',
      detail: settings?.muteRoleId
        ? `Role ID: ${settings.muteRoleId}`
        : 'Optional: set a Mute Role in Settings as a fallback for older Discord servers.',
    },
  ];

  const activeChecks = checks.filter((c) => c.ok).length;
  const scoreColor = activeChecks === checks.length
    ? 'text-green-400' : activeChecks >= checks.length / 2
    ? 'text-yellow-400' : 'text-red-400';

  const typeColors: Record<string, string> = {
    WARN: 'text-yellow-400', MUTE: 'text-orange-400', BAN: 'text-red-500',
    KICK: 'text-red-300', UNBAN: 'text-green-400', AUTOMOD: 'text-purple-400',
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bug size={20} className="text-indigo-400" /> Debug &amp; Diagnostics
        </h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Configuration health check and system overview.
        </p>
      </div>

      {/* Health score */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-1 bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-4">
          <p className="text-xs text-[#e5e7eb]/40 font-medium">Config Score</p>
          <p className={`text-3xl font-bold mt-1 ${scoreColor}`}>
            {activeChecks}/{checks.length}
          </p>
          <p className="text-xs text-[#e5e7eb]/30 mt-0.5">checks passed</p>
        </div>
        <StatPill label="Tracked users" value={userCount} />
        <StatPill label="Total infractions" value={infractionCount} />
        <StatPill label="Last 30 days" value={recentCount} />
      </div>

      {/* Config checklist */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e7eb]/10 flex items-center gap-2">
          <Shield size={14} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Configuration Health</h2>
        </div>
        <div className="px-5 py-1">
          {checks.map((c) => (
            <Check key={c.label} ok={c.ok} label={c.label} detail={c.detail} />
          ))}
        </div>
      </div>

      {/* Automod rule status */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e7eb]/10 flex items-center gap-2">
          <Zap size={14} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Automod Rules</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
              <th className="px-5 py-3 text-left font-medium">Rule</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Action</th>
              <th className="px-5 py-3 text-left font-medium">Config</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]/5">
            {[
              {
                name: 'Spam Detection',
                rule: spamRule,
                config: `${settings?.spamThreshold ?? 5} msgs / ${settings?.spamInterval ?? 5}s`,
              },
              {
                name: 'Word Filter',
                rule: wordRule,
                config: `${settings?.blacklistedWords?.length ?? 0} words`,
              },
              {
                name: 'Link Detection',
                rule: linkRule,
                config: settings?.allowedLinks?.length
                  ? `${settings.allowedLinks.length} allowed domain(s)`
                  : 'Block all links',
              },
            ].map(({ name, rule, config }) => (
              <tr key={name} className="hover:bg-[#1c1c24] transition-colors">
                <td className="px-5 py-3 font-medium text-white">{name}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    rule?.enabled
                      ? 'text-green-400 bg-green-400/10 border-green-400/20'
                      : 'text-[#e5e7eb]/30 bg-[#e5e7eb]/5 border-[#e5e7eb]/10'
                  }`}>
                    {rule?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[#e5e7eb]/50">{rule?.action ?? '—'}</td>
                <td className="px-5 py-3 text-xs text-[#e5e7eb]/40">{config}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[#e5e7eb]/10 text-right">
          <Link href="../automod" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Configure rules →
          </Link>
        </div>
      </div>

      {/* Settings snapshot */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e7eb]/10 flex items-center gap-2">
          <Hash size={14} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Settings Snapshot</h2>
        </div>
        <div className="divide-y divide-[#e5e7eb]/5">
          {[
            { key: 'Log Channel ID',    val: settings?.logChannelId     ?? 'Not set' },
            { key: 'Mute Role ID',      val: settings?.muteRoleId       ?? 'Not set' },
            { key: 'Automod Enabled',   val: settings?.automodEnabled !== false ? 'Yes' : 'No' },
            { key: 'Spam Threshold',    val: settings?.spamThreshold    ?? 5 },
            { key: 'Spam Interval',     val: `${settings?.spamInterval ?? 5}s` },
            { key: 'Blacklisted Words', val: settings?.blacklistedWords?.length ?? 0 },
            { key: 'Allowed Domains',   val: settings?.allowedLinks?.length ?? 0 },
          ].map(({ key, val }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-[#1c1c24] transition-colors">
              <span className="text-[#e5e7eb]/50">{key}</span>
              <span className={`font-mono text-xs ${
                val === 'Not set' ? 'text-[#e5e7eb]/30' : 'text-white'
              }`}>{String(val)}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-[#e5e7eb]/10 text-right">
          <Link href="../settings" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Edit settings →
          </Link>
        </div>
      </div>

      {/* Recent automod hits */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e7eb]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Recent Automod Hits</h2>
          </div>
          <span className="text-xs text-[#e5e7eb]/30">{automodInfractions.length} shown</span>
        </div>
        {automodInfractions.length === 0 ? (
          <p className="text-[#e5e7eb]/40 text-sm p-6">No automod actions recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#e5e7eb]/5">
            {automodInfractions.map((inf) => (
              <div key={inf.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1c1c24] transition-colors text-sm">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-purple-400 bg-purple-400/10 border border-purple-400/20`}>
                  AUTOMOD
                </span>
                <Link href={`../users/${inf.userId}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                  {inf.user.username}
                </Link>
                <span className="text-[#e5e7eb]/40 truncate flex-1 text-xs">{inf.reason}</span>
                <span className="text-[#e5e7eb]/30 text-xs whitespace-nowrap flex-shrink-0">
                  {new Date(inf.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {automodInfractions.length > 0 && (
          <div className="px-5 py-3 border-t border-[#e5e7eb]/10 text-right">
            <Link href="../moderation?type=AUTOMOD" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all automod hits →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
