import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../../lib/db';
import { InfractionType } from '@clx/database';

const TYPE_STYLE: Record<string, string> = {
  WARN: 'text-yellow-400 bg-yellow-400/10',
  MUTE: 'text-orange-400 bg-orange-400/10',
  BAN: 'text-red-500 bg-red-500/10',
  KICK: 'text-red-300 bg-red-300/10',
  UNBAN: 'text-green-400 bg-green-400/10',
  AUTOMOD: 'text-purple-400 bg-purple-400/10',
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ guildId: string; userId: string }>;
}) {
  const { guildId, userId } = await params;

  const [user, infractions] = await Promise.all([
    db.user.findUnique({ where: { userId_guildId: { userId, guildId } } }),
    db.infraction.findMany({
      where: { userId, guildId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!user) notFound();

  const counts = infractions.reduce(
    (acc, inf) => { acc[inf.type] = (acc[inf.type] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="../.." className="text-gray-500 hover:text-gray-300 text-sm">← Overview</Link>
      </div>

      {/* User header */}
      <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-5">
        <img
          src={`https://cdn.discordapp.com/avatars/${userId}/default.png`}
          alt={user.username}
          className="w-16 h-16 rounded-full bg-gray-700"
          onError={undefined}
        />
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <p className="text-gray-400 text-sm font-mono">{userId}</p>
          <p className="text-gray-500 text-xs mt-1">
            First seen <time>{new Date(user.createdAt).toLocaleDateString()}</time>
          </p>
        </div>
      </div>

      {/* Infraction counts */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Warns', type: InfractionType.WARN, color: 'text-yellow-400' },
          { label: 'Mutes', type: InfractionType.MUTE, color: 'text-orange-400' },
          { label: 'Kicks', type: InfractionType.KICK, color: 'text-red-300' },
          { label: 'Bans', type: InfractionType.BAN, color: 'text-red-500' },
          { label: 'Unbans', type: InfractionType.UNBAN, color: 'text-green-400' },
          { label: 'Automod', type: InfractionType.AUTOMOD, color: 'text-purple-400' },
        ].map(({ label, type, color }) => (
          <div key={type} className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{counts[type] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Infraction list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Infractions <span className="text-gray-500 font-normal text-sm">({infractions.length})</span>
        </h2>

        {infractions.length === 0 ? (
          <p className="text-gray-500 text-sm">No infractions on record.</p>
        ) : (
          <div className="space-y-2">
            {infractions.map((inf) => {
              const caseId = inf.id.slice(-6).toUpperCase();
              return (
                <div key={inf.id} className="bg-gray-800 rounded-xl px-5 py-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[inf.type] ?? ''}`}>
                      {inf.type}
                    </span>
                    <span className="font-mono text-xs text-gray-500">#{caseId}</span>
                    {inf.duration && (
                      <span className="text-xs text-gray-400">
                        {Math.floor(inf.duration / 60)}m
                      </span>
                    )}
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(inf.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{inf.reason}</p>
                  <p className="text-xs text-gray-500">
                    Moderator: <span className="font-mono">{inf.moderatorId}</span>
                  </p>

                  {/* Delete button */}
                  <form action={`/api/guilds/${guildId}/infractions/${inf.id}`} method="POST">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-300 transition-colors mt-1"
                      onClick={undefined}
                    >
                      Delete case
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
