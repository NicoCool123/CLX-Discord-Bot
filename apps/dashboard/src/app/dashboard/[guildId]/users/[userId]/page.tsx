import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { db } from '../../../../../lib/db';
import { InfractionType } from '@clx/database';

const TYPE_STYLE: Record<string, { badge: string; border: string }> = {
  WARN:    { badge: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',  border: 'border-l-yellow-400' },
  MUTE:    { badge: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',  border: 'border-l-orange-400' },
  BAN:     { badge: 'text-red-500 bg-red-500/10 border border-red-500/20',            border: 'border-l-red-500' },
  KICK:    { badge: 'text-red-300 bg-red-300/10 border border-red-300/20',            border: 'border-l-red-300' },
  UNBAN:   { badge: 'text-green-400 bg-green-400/10 border border-green-400/20',      border: 'border-l-green-400' },
  AUTOMOD: { badge: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',  border: 'border-l-purple-400' },
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

  const statCards = [
    { label: 'Warns',   type: InfractionType.WARN,    color: 'text-yellow-400', border: 'border-t-yellow-400/40' },
    { label: 'Mutes',   type: InfractionType.MUTE,    color: 'text-orange-400', border: 'border-t-orange-400/40' },
    { label: 'Kicks',   type: InfractionType.KICK,    color: 'text-red-300',    border: 'border-t-red-300/40' },
    { label: 'Bans',    type: InfractionType.BAN,     color: 'text-red-500',    border: 'border-t-red-500/40' },
    { label: 'Unbans',  type: InfractionType.UNBAN,   color: 'text-green-400',  border: 'border-t-green-400/40' },
    { label: 'Automod', type: InfractionType.AUTOMOD, color: 'text-purple-400', border: 'border-t-purple-400/40' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="../.." className="inline-flex items-center gap-1.5 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/70 transition-colors">
        <ArrowLeft size={12} /> Users
      </Link>

      {/* User header */}
      <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-6 flex items-center gap-5">
        <img
          src={`https://cdn.discordapp.com/avatars/${userId}/default.png`}
          alt={user.username}
          className="w-16 h-16 rounded-full bg-[#111827] ring-2 ring-[#e5e7eb]/10 flex-shrink-0"
          onError={undefined}
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white">{user.username}</h1>
          <p className="text-[#e5e7eb]/40 text-sm font-mono mt-0.5">{userId}</p>
          <p className="text-[#e5e7eb]/30 text-xs mt-1.5">
            First seen <time>{new Date(user.createdAt).toLocaleDateString()}</time>
            {' · '}
            <span className="text-[#e5e7eb]/50 font-medium">{infractions.length} infraction{infractions.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
      </div>

      {/* Infraction counts */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statCards.map(({ label, type, color, border }) => (
          <div key={type} className={`bg-[#1f2937] border border-[#e5e7eb]/10 border-t-2 ${border} rounded-xl p-3 text-center`}>
            <p className="text-xs text-[#e5e7eb]/40 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{counts[type] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Infraction list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          Infractions
          <span className="text-[#e5e7eb]/30 font-normal text-sm ml-2">({infractions.length})</span>
        </h2>

        {infractions.length === 0 ? (
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-10 text-center">
            <p className="text-[#e5e7eb]/40 text-sm">No infractions on record.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {infractions.map((inf) => {
              const caseId = inf.id.slice(-6).toUpperCase();
              const style = TYPE_STYLE[inf.type];
              return (
                <div
                  key={inf.id}
                  className={`bg-[#1f2937] border border-[#e5e7eb]/10 border-l-2 ${style?.border ?? 'border-l-[#e5e7eb]/20'} rounded-xl px-5 py-4 space-y-2`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style?.badge ?? 'text-[#e5e7eb] bg-[#e5e7eb]/10'}`}>
                      {inf.type}
                    </span>
                    <span className="font-mono text-xs text-[#e5e7eb]/30">#{caseId}</span>
                    {inf.duration && (
                      <span className="text-xs text-[#e5e7eb]/40">{Math.floor(inf.duration / 60)}m</span>
                    )}
                    <span className="ml-auto text-xs text-[#e5e7eb]/30">
                      {new Date(inf.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-white">{inf.reason}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#e5e7eb]/30">
                      Moderator: <span className="font-mono text-[#e5e7eb]/50">{inf.moderatorId}</span>
                    </p>
                    <form action={`/api/guilds/${guildId}/infractions/${inf.id}`} method="POST">
                      <input type="hidden" name="_method" value="DELETE" />
                      <button type="submit" className="flex items-center gap-1 text-xs text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 size={11} /> Delete case
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
