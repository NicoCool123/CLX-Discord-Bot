import { db } from '../../../../lib/db';
import { InfractionType } from '@clx/database';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#111827] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#e5e7eb]/50 w-8 text-right">{value}</span>
    </div>
  );
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allInfractions, recentInfractions, typeCounts, totalUsers] = await Promise.all([
    db.infraction.findMany({
      where: { guildId, createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, type: true, moderatorId: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.infraction.findMany({
      where: { guildId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, moderatorId: true },
    }),
    db.infraction.groupBy({
      by: ['type'],
      where: { guildId },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    }),
    db.user.count({ where: { guildId } }),
  ]);

  // Build last 14 days
  const dayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const inf of allInfractions) {
    const key = inf.createdAt.toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  }
  const days = Object.entries(dayMap);
  const maxDay = Math.max(...Object.values(dayMap), 1);

  // Top moderators (last 30 days)
  const modMap: Record<string, number> = {};
  for (const inf of recentInfractions) {
    modMap[inf.moderatorId] = (modMap[inf.moderatorId] ?? 0) + 1;
  }
  const topMods = Object.entries(modMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxMod = topMods[0]?.[1] ?? 1;

  // Type breakdown
  const totalCount = typeCounts.reduce((s, t) => s + t._count.type, 0);

  const typeConfig: Record<string, { label: string; color: string; bar: string }> = {
    WARN:    { label: 'Warns',   color: 'text-yellow-400', bar: 'bg-yellow-400' },
    MUTE:    { label: 'Mutes',   color: 'text-orange-400', bar: 'bg-orange-400' },
    KICK:    { label: 'Kicks',   color: 'text-red-300',    bar: 'bg-red-300' },
    BAN:     { label: 'Bans',    color: 'text-red-500',    bar: 'bg-red-500' },
    UNBAN:   { label: 'Unbans',  color: 'text-green-400',  bar: 'bg-green-400' },
    AUTOMOD: { label: 'Automod', color: 'text-purple-400', bar: 'bg-purple-400' },
  };

  // This week vs last week
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thisWeek = allInfractions.filter((i) => i.createdAt >= weekAgo).length;
  const lastWeek = allInfractions.filter((i) => i.createdAt >= twoWeeksAgo && i.createdAt < weekAgo).length;
  const weekDelta = lastWeek === 0 ? null : thisWeek - lastWeek;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link href="." className="inline-flex items-center gap-1 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/70 transition-colors mb-3">
          <ArrowLeft size={12} /> Overview
        </Link>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">Infraction trends and breakdowns for this server</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total infractions', value: totalCount },
          { label: 'This week', value: thisWeek, delta: weekDelta },
          { label: 'Last week', value: lastWeek },
          { label: 'Tracked users', value: totalUsers },
        ].map(({ label, value, delta }) => (
          <div key={label} className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-4">
            <p className="text-xs text-[#e5e7eb]/40 font-medium">{label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-white">{value}</p>
              {delta !== null && delta !== undefined && (
                <span className={`text-xs font-medium pb-0.5 ${delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : 'text-[#e5e7eb]/30'}`}>
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 14-day chart */}
      <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Infractions — Last 14 Days</h2>
        <div className="flex items-end gap-1.5 h-28">
          {days.map(([date, count]) => {
            const pct = maxDay === 0 ? 0 : (count / maxDay) * 100;
            const label = new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-indigo-500/70 hover:bg-indigo-400 rounded-t transition-all"
                    style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                    title={`${label}: ${count}`}
                  />
                </div>
                <span className="text-[9px] text-[#e5e7eb]/30 hidden sm:block leading-none">
                  {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#e5e7eb]/30">{days[0]?.[0] ? new Date(days[0][0] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
          <span className="text-[10px] text-[#e5e7eb]/30">Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Type breakdown */}
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Infraction Types</h2>
          {typeCounts.length === 0 ? (
            <p className="text-[#e5e7eb]/40 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {typeCounts.map((t) => {
                const cfg = typeConfig[t.type];
                const pct = totalCount === 0 ? 0 : Math.round((t._count.type / totalCount) * 100);
                return (
                  <div key={t.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${cfg?.color ?? 'text-white'}`}>{cfg?.label ?? t.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#e5e7eb]/30">{pct}%</span>
                        <span className="text-xs text-[#e5e7eb]/50 w-6 text-right">{t._count.type}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#111827] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg?.bar ?? 'bg-white'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top moderators */}
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Top Moderators</h2>
          <p className="text-xs text-[#e5e7eb]/40 mb-4">Last 30 days</p>
          {topMods.length === 0 ? (
            <p className="text-[#e5e7eb]/40 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topMods.map(([modId, count], i) => (
                <div key={modId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-yellow-400' : 'text-[#e5e7eb]/30'}`}>#{i + 1}</span>
                      <span className="text-xs text-white font-mono">{modId}</span>
                    </div>
                    <span className="text-xs text-[#e5e7eb]/50">{count}</span>
                  </div>
                  <Bar value={count} max={maxMod} color="bg-indigo-500/60" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
