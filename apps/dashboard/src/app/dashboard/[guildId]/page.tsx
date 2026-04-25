import { db } from '../../../lib/db';
import { InfractionType } from '@clx/database';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, VolumeX, UserX, Ban, Zap, Shield, Users, Settings, BarChart2, TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';

export default async function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [recentInfractions, typeCounts, activeUsers, thisWeekCount, lastWeekCount] = await Promise.all([
    db.infraction.findMany({
      where: { guildId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: true },
    }),
    db.infraction.groupBy({
      by: ['type'],
      where: { guildId },
      _count: { type: true },
    }),
    db.infraction.groupBy({
      by: ['userId'],
      where: { guildId },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
    }),
    db.infraction.count({ where: { guildId, createdAt: { gte: sevenDaysAgo } } }),
    db.infraction.count({ where: { guildId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);

  const counts = Object.fromEntries(typeCounts.map((t) => [t.type, t._count.type]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const weekDiff = lastWeekCount === 0 ? null : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

  const statCards = [
    { label: 'Total', value: total, color: 'text-white', accent: 'border-white/20', Icon: ClipboardList },
    { label: 'Warns', value: counts[InfractionType.WARN] ?? 0, color: 'text-yellow-400', accent: 'border-yellow-400/30', Icon: AlertTriangle },
    { label: 'Mutes', value: counts[InfractionType.MUTE] ?? 0, color: 'text-orange-400', accent: 'border-orange-400/30', Icon: VolumeX },
    { label: 'Kicks', value: counts[InfractionType.KICK] ?? 0, color: 'text-red-300', accent: 'border-red-300/30', Icon: UserX },
    { label: 'Bans', value: counts[InfractionType.BAN] ?? 0, color: 'text-red-500', accent: 'border-red-500/30', Icon: Ban },
    { label: 'Unbans', value: counts[InfractionType.UNBAN] ?? 0, color: 'text-green-400', accent: 'border-green-400/30', Icon: ShieldCheck },
    { label: 'Automod', value: counts[InfractionType.AUTOMOD] ?? 0, color: 'text-purple-400', accent: 'border-purple-400/30', Icon: Zap },
  ];

  const typeColors: Record<string, string> = {
    WARN: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
    MUTE: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
    BAN: 'text-red-500 bg-red-500/10 border border-red-500/20',
    KICK: 'text-red-300 bg-red-300/10 border border-red-300/20',
    UNBAN: 'text-green-400 bg-green-400/10 border border-green-400/20',
    AUTOMOD: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
  };

  const topUserIds = activeUsers.map((u) => u.userId);
  const topUsers = topUserIds.length > 0
    ? await db.user.findMany({ where: { userId: { in: topUserIds }, guildId } })
    : [];
  const usernameMap = Object.fromEntries(topUsers.map((u) => [u.userId, u.username]));

  const quickActions = [
    { href: 'moderation', label: 'Moderation Log', Icon: Shield, desc: 'View all infractions' },
    { href: 'users', label: 'Users', Icon: Users, desc: 'Search & browse users' },
    { href: 'analytics', label: 'Analytics', Icon: BarChart2, desc: 'Trends & breakdowns' },
    { href: 'settings', label: 'Settings', Icon: Settings, desc: 'Guild configuration' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-[#e5e7eb]/50 text-sm mt-1">{total} total moderation actions</p>
        </div>
        {weekDiff !== null && (
          <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${
            weekDiff > 0
              ? 'text-red-400 bg-red-400/10 border-red-400/20'
              : weekDiff < 0
              ? 'text-green-400 bg-green-400/10 border-green-400/20'
              : 'text-[#e5e7eb]/50 bg-[#e5e7eb]/5 border-[#e5e7eb]/10'
          }`}>
            {weekDiff > 0 ? <TrendingUp size={14} /> : weekDiff < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{weekDiff > 0 ? '+' : ''}{weekDiff}% vs last week</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map(({ label, value, color, accent, Icon }) => (
          <div key={label} className={`bg-[#111116] border ${accent} rounded-xl p-4 flex flex-col gap-1`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#e5e7eb]/50 font-medium">{label}</p>
              <Icon size={14} className={`${color} opacity-70`} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ href, label, Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 bg-[#111116] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-xl px-4 py-3 transition-all hover:bg-[#1c1c24]"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-[#e5e7eb]/40 truncate">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link href="moderation" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            {recentInfractions.length === 0 ? (
              <p className="text-[#e5e7eb]/40 text-sm p-6">No infractions yet.</p>
            ) : (
              <div className="divide-y divide-[#e5e7eb]/5">
                {recentInfractions.map((inf) => (
                  <div key={inf.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c24] transition-colors text-sm">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[inf.type] ?? 'text-[#e5e7eb] bg-[#e5e7eb]/10'}`}>
                      {inf.type}
                    </span>
                    <Link href={`users/${inf.userId}`} className="font-medium text-white hover:text-indigo-400 transition-colors truncate">
                      {inf.user.username}
                    </Link>
                    <span className="text-[#e5e7eb]/40 truncate flex-1 text-xs">{inf.reason}</span>
                    <span className="text-[#e5e7eb]/30 text-xs whitespace-nowrap flex-shrink-0">
                      {new Date(inf.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top actioned users */}
        <div>
          <h2 className="text-base font-semibold text-white mb-3">Most Actioned Users</h2>
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            {activeUsers.length === 0 ? (
              <p className="text-[#e5e7eb]/40 text-sm p-6">No data yet.</p>
            ) : (
              <div className="divide-y divide-[#e5e7eb]/5">
                {activeUsers.map((u, i) => (
                  <Link
                    key={u.userId}
                    href={`users/${u.userId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c24] transition-colors text-sm"
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                      i === 1 ? 'bg-[#e5e7eb]/10 text-[#e5e7eb]/60' :
                      i === 2 ? 'bg-orange-400/20 text-orange-400' :
                      'bg-[#e5e7eb]/5 text-[#e5e7eb]/30'
                    }`}>{i + 1}</span>
                    <span className="flex-1 font-medium text-white truncate">{usernameMap[u.userId] ?? u.userId}</span>
                    <span className="text-indigo-400 font-semibold text-xs flex-shrink-0">{u._count.userId}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
