import Link from 'next/link';
import { AlertOctagon, Ban, VolumeX, Clock } from 'lucide-react';
import { db } from '../../../../lib/db';
import { InfractionType } from '@clx/database';

export default async function ActiveCasesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const now = Date.now();

  // --- Active Bans ---
  // Get all BAN and UNBAN infractions per user, keep only those whose
  // most-recent action is BAN
  const banUnbanRows = await db.infraction.findMany({
    where: { guildId, type: { in: [InfractionType.BAN, InfractionType.UNBAN] } },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  const latestBanAction = new Map<string, typeof banUnbanRows[number]>();
  for (const row of banUnbanRows) {
    if (!latestBanAction.has(row.userId)) latestBanAction.set(row.userId, row);
  }
  const activeBans = [...latestBanAction.values()].filter((r) => r.type === InfractionType.BAN);

  // --- Active Mutes ---
  // Most recent MUTE per user that hasn't expired (duration > 0 AND createdAt + duration*1000 > now)
  const muteRows = await db.infraction.findMany({
    where: { guildId, type: InfractionType.MUTE },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  const latestMute = new Map<string, typeof muteRows[number]>();
  for (const row of muteRows) {
    if (!latestMute.has(row.userId)) latestMute.set(row.userId, row);
  }
  const activeMutes = [...latestMute.values()].filter((m) => {
    if (!m.duration || m.duration <= 0) return false;
    return m.createdAt.getTime() + m.duration * 1000 > now;
  });

  function timeLeft(inf: { createdAt: Date; duration: number | null }) {
    if (!inf.duration) return null;
    const msLeft = inf.createdAt.getTime() + inf.duration * 1000 - now;
    if (msLeft <= 0) return 'Expired';
    const totalSecs = Math.floor(msLeft / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Active Cases</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          Currently active bans and mutes.
          <span className="ml-2 text-[#e5e7eb]/30">
            Mute expiry is calculated from the infraction record — Discord enforces the actual timeout.
          </span>
        </p>
      </div>

      {/* Active bans */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Ban size={15} className="text-red-400" />
          <h2 className="text-base font-semibold text-white">Active Bans</h2>
          <span className="text-xs text-[#e5e7eb]/40 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10 px-2 py-0.5 rounded-full">
            {activeBans.length}
          </span>
        </div>

        {activeBans.length === 0 ? (
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-8 text-center">
            <p className="text-[#e5e7eb]/40 text-sm">No active bans.</p>
          </div>
        ) : (
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">User ID</th>
                  <th className="px-5 py-3 text-left font-medium">Reason</th>
                  <th className="px-5 py-3 text-left font-medium">Banned</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/5">
                {activeBans.map((ban) => (
                  <tr key={ban.userId} className="hover:bg-[#1c1c24] transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{ban.user.username}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/40">{ban.userId}</td>
                    <td className="px-5 py-3 text-[#e5e7eb]/60 max-w-xs truncate">{ban.reason}</td>
                    <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs whitespace-nowrap">
                      {new Date(ban.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`../users/${ban.userId}`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active mutes */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <VolumeX size={15} className="text-orange-400" />
          <h2 className="text-base font-semibold text-white">Active Mutes</h2>
          <span className="text-xs text-[#e5e7eb]/40 bg-[#e5e7eb]/5 border border-[#e5e7eb]/10 px-2 py-0.5 rounded-full">
            {activeMutes.length}
          </span>
        </div>

        {activeMutes.length === 0 ? (
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl p-8 text-center">
            <p className="text-[#e5e7eb]/40 text-sm">No active mutes.</p>
          </div>
        ) : (
          <div className="bg-[#111116] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">Reason</th>
                  <th className="px-5 py-3 text-left font-medium">Duration</th>
                  <th className="px-5 py-3 text-left font-medium">Time Left</th>
                  <th className="px-5 py-3 text-left font-medium">Muted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/5">
                {activeMutes.map((mute) => {
                  const left = timeLeft(mute);
                  const totalMins = mute.duration ? Math.floor(mute.duration / 60) : 0;
                  return (
                    <tr key={mute.userId} className="hover:bg-[#1c1c24] transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{mute.user.username}</td>
                      <td className="px-5 py-3 text-[#e5e7eb]/60 max-w-xs truncate">{mute.reason}</td>
                      <td className="px-5 py-3 text-xs text-[#e5e7eb]/50">
                        {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
                      </td>
                      <td className="px-5 py-3">
                        {left && (
                          <span className="flex items-center gap-1 text-xs text-orange-400">
                            <Clock size={11} /> {left}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs whitespace-nowrap">
                        {new Date(mute.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`../users/${mute.userId}`}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        >
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {activeBans.length === 0 && activeMutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertOctagon size={32} className="text-[#e5e7eb]/20 mb-3" />
          <p className="text-[#e5e7eb]/40 font-medium">No active cases</p>
          <p className="text-[#e5e7eb]/30 text-sm mt-1">All clear — no ongoing bans or mutes on record.</p>
        </div>
      )}
    </div>
  );
}
