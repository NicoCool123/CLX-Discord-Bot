import { db } from '../../../lib/db';
import { InfractionType } from '@clx/database';
import Link from 'next/link';

export default async function GuildOverviewPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const [recentInfractions, typeCounts, activeUsers] = await Promise.all([
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
  ]);

  const counts = Object.fromEntries(typeCounts.map((t) => [t.type, t._count.type]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const statCards = [
    { label: 'Total', value: total, color: 'text-white', accent: 'border-[#e5e7eb]/20', icon: '📋' },
    { label: 'Warns', value: counts[InfractionType.WARN] ?? 0, color: 'text-yellow-400', accent: 'border-yellow-400/30', icon: '⚠️' },
    { label: 'Mutes', value: counts[InfractionType.MUTE] ?? 0, color: 'text-orange-400', accent: 'border-orange-400/30', icon: '🔇' },
    { label: 'Kicks', value: counts[InfractionType.KICK] ?? 0, color: 'text-red-300', accent: 'border-red-300/30', icon: '👢' },
    { label: 'Bans', value: counts[InfractionType.BAN] ?? 0, color: 'text-red-500', accent: 'border-red-500/30', icon: '🔨' },
    { label: 'Automod', value: counts[InfractionType.AUTOMOD] ?? 0, color: 'text-purple-400', accent: 'border-purple-400/30', icon: '🤖' },
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
    { href: 'moderation', label: 'Moderation Log', icon: '🔨', desc: 'View all infractions' },
    { href: 'users', label: 'Users', icon: '👥', desc: 'Search & browse users' },
    { href: 'automod', label: 'Automod', icon: '🤖', desc: 'Configure rules' },
    { href: 'settings', label: 'Settings', icon: '⚙️', desc: 'Guild configuration' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">{total} total moderation actions recorded</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-[#1f2937] border ${card.accent} rounded-xl p-4 flex flex-col gap-1`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#e5e7eb]/50 font-medium">{card.label}</p>
              <span className="text-base leading-none">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#e5e7eb]/50 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-xl px-4 py-3 transition-all hover:bg-[#263348]"
            >
              <span className="text-xl leading-none">{action.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p className="text-xs text-[#e5e7eb]/40 truncate">{action.desc}</p>
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

          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            {recentInfractions.length === 0 ? (
              <p className="text-[#e5e7eb]/40 text-sm p-6">No infractions yet.</p>
            ) : (
              <div className="divide-y divide-[#e5e7eb]/5">
                {recentInfractions.map((inf) => (
                  <div key={inf.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#263348] transition-colors text-sm">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[inf.type] ?? 'text-[#e5e7eb] bg-[#e5e7eb]/10'}`}
                    >
                      {inf.type}
                    </span>
                    <Link
                      href={`users/${inf.userId}`}
                      className="font-medium text-white hover:text-indigo-400 transition-colors min-w-0 truncate"
                    >
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
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            {activeUsers.length === 0 ? (
              <p className="text-[#e5e7eb]/40 text-sm p-6">No data yet.</p>
            ) : (
              <div className="divide-y divide-[#e5e7eb]/5">
                {activeUsers.map((u, i) => (
                  <Link
                    key={u.userId}
                    href={`users/${u.userId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#263348] transition-colors text-sm"
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
