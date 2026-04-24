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
    // Most actioned users (top 5)
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
    { label: 'Total', value: total, color: 'text-white', bg: 'bg-gray-700' },
    { label: 'Warns', value: counts[InfractionType.WARN] ?? 0, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Mutes', value: counts[InfractionType.MUTE] ?? 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Kicks', value: counts[InfractionType.KICK] ?? 0, color: 'text-red-300', bg: 'bg-red-300/10' },
    { label: 'Bans', value: counts[InfractionType.BAN] ?? 0, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Automod', value: counts[InfractionType.AUTOMOD] ?? 0, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const typeColors: Record<string, string> = {
    WARN: 'text-yellow-400 bg-yellow-400/10',
    MUTE: 'text-orange-400 bg-orange-400/10',
    BAN: 'text-red-500 bg-red-500/10',
    KICK: 'text-red-300 bg-red-300/10',
    UNBAN: 'text-green-400 bg-green-400/10',
    AUTOMOD: 'text-purple-400 bg-purple-400/10',
  };

  // Fetch usernames for top users
  const topUserIds = activeUsers.map((u) => u.userId);
  const topUsers = topUserIds.length > 0
    ? await db.user.findMany({ where: { userId: { in: topUserIds }, guildId } })
    : [];
  const usernameMap = Object.fromEntries(topUsers.map((u) => [u.userId, u.username]));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.bg}`}>
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="moderation" className="text-xs text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>

          {recentInfractions.length === 0 ? (
            <p className="text-gray-500 text-sm">No infractions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentInfractions.map((inf) => (
                <div key={inf.id} className="flex items-center gap-3 bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[inf.type] ?? 'text-gray-400 bg-gray-700'}`}
                  >
                    {inf.type}
                  </span>
                  <Link
                    href={`users/${inf.userId}`}
                    className="font-medium hover:text-indigo-400 transition-colors"
                  >
                    {inf.user.username}
                  </Link>
                  <span className="text-gray-400 truncate flex-1">{inf.reason}</span>
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    <time dateTime={inf.createdAt.toISOString()}>
                      {new Date(inf.createdAt).toLocaleDateString()}
                    </time>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top actioned users */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Most Actioned Users</h2>
          {activeUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {activeUsers.map((u, i) => (
                <Link
                  key={u.userId}
                  href={`users/${u.userId}`}
                  className="flex items-center gap-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg px-4 py-2.5 text-sm transition-colors"
                >
                  <span className="text-gray-500 w-5 text-center font-mono">{i + 1}</span>
                  <span className="flex-1 font-medium">{usernameMap[u.userId] ?? u.userId}</span>
                  <span className="text-indigo-400 font-semibold">{u._count.userId}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
