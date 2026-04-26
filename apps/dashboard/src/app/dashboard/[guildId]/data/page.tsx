import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Trash2, ShieldAlert, Ticket, Mail, User } from 'lucide-react';
import { auth } from '../../../../auth';
import { db } from '../../../../lib/db';

const TYPE_COLOR: Record<string, string> = {
  WARN: 'text-yellow-400 bg-yellow-400/10',
  MUTE: 'text-orange-400 bg-orange-400/10',
  KICK: 'text-red-400 bg-red-400/10',
  BAN: 'text-red-500 bg-red-500/10',
  UNBAN: 'text-emerald-400 bg-emerald-400/10',
  AUTOMOD: 'text-purple-400 bg-purple-400/10',
};

export default async function DataPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ deleted?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/api/auth/signin');

  const { guildId } = await params;
  const { deleted } = await searchParams;
  const userId = session.user.id;

  const [userData, tickets] = await Promise.all([
    db.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: {
        infractions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    }),
    db.ticket.findMany({
      where: { creatorId: userId, guildId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const totalInfractions = userData?.infractions.length ?? 0;
  const totalTickets = tickets.length;

  return (
    <div className="space-y-8 max-w-3xl">
      {deleted && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
          ✅ Your data has been deleted from this server.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">My Data</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          All data this bot has stored about you in this server.
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-6">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ''}
              width={56}
              height={56}
              className="rounded-full ring-2 ring-[#e5e7eb]/10 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#e5e7eb]/10 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-[#e5e7eb]/40" />
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <p className="font-semibold text-white">{session.user.name ?? 'Unknown'}</p>
            <div className="flex items-center gap-1.5 text-xs text-[#e5e7eb]/40">
              <Mail size={11} />
              <span>{session.user.email ?? 'Sign out and back in to show email'}</span>
            </div>
            <p className="text-xs text-[#e5e7eb]/30 font-mono">{userId}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-5 flex items-center gap-3">
          <ShieldAlert size={18} className="text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-white">{totalInfractions}</p>
            <p className="text-xs text-[#e5e7eb]/40 mt-0.5">Infractions on record</p>
          </div>
        </div>
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-5 flex items-center gap-3">
          <Ticket size={18} className="text-indigo-400 flex-shrink-0" />
          <div>
            <p className="text-2xl font-bold text-white">{totalTickets}</p>
            <p className="text-xs text-[#e5e7eb]/40 mt-0.5">Tickets opened</p>
          </div>
        </div>
      </div>

      {/* Infractions */}
      {totalInfractions > 0 && (
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e7eb]/10">
            <p className="text-sm font-semibold text-white">Infractions</p>
          </div>
          <div className="divide-y divide-[#e5e7eb]/5">
            {userData!.infractions.map((inf) => (
              <div key={inf.id} className="px-6 py-3 flex items-start gap-3">
                <span
                  className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${TYPE_COLOR[inf.type] ?? 'text-[#e5e7eb]/50 bg-[#e5e7eb]/5'}`}
                >
                  {inf.type}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[#e5e7eb]/80 truncate">{inf.reason}</p>
                  <p className="text-xs text-[#e5e7eb]/30 mt-0.5">
                    Case #{inf.caseNumber} · {new Date(inf.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets */}
      {totalTickets > 0 && (
        <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e7eb]/10">
            <p className="text-sm font-semibold text-white">Tickets</p>
          </div>
          <div className="divide-y divide-[#e5e7eb]/5">
            {tickets.map((t) => (
              <div key={t.id} className="px-6 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[#e5e7eb]/80 truncate">#{t.ticketNumber} · {t.subject}</p>
                  <p className="text-xs text-[#e5e7eb]/30 mt-0.5">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                    t.status === 'OPEN' ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#e5e7eb]/40 bg-[#e5e7eb]/5'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalInfractions === 0 && totalTickets === 0 && (
        <div className="text-center py-12 bg-[#111116] border border-[#e5e7eb]/10 rounded-xl">
          <p className="text-[#e5e7eb]/40 text-sm">No data stored for you in this server.</p>
        </div>
      )}

      {/* Delete */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-3">
        <p className="text-sm font-semibold text-red-400">Delete my data</p>
        <p className="text-xs text-[#e5e7eb]/40 leading-relaxed">
          This permanently removes all infractions, tickets, and your user record from this server. This action cannot be undone.
        </p>
        <form action={`/api/guilds/${guildId}/data`} method="POST">
          <input type="hidden" name="_method" value="DELETE" />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors duration-200"
          >
            <Trash2 size={13} /> Delete everything
          </button>
        </form>
      </div>
    </div>
  );
}
