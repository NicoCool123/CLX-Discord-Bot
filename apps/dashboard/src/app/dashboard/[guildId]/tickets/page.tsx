import { db } from '../../../../lib/db';
import Link from 'next/link';
import { Ticket, Lock, Clock } from 'lucide-react';

export default async function TicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { guildId } = await params;
  const { status } = await searchParams;
  const showClosed = status === 'closed';

  const [openCount, closedCount, tickets] = await Promise.all([
    db.ticket.count({ where: { guildId, status: 'OPEN' } }),
    db.ticket.count({ where: { guildId, status: 'CLOSED' } }),
    db.ticket.findMany({
      where: { guildId, status: showClosed ? 'CLOSED' : 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          {openCount} open · {closedCount} closed
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        <Link
          href="?"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showClosed
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-[#111116] border border-white/8 text-[#e5e7eb]/50 hover:text-white hover:border-white/20'
          }`}
        >
          <Ticket size={14} /> Open ({openCount})
        </Link>
        <Link
          href="?status=closed"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showClosed
              ? 'bg-[#e5e7eb]/10 text-[#e5e7eb]/70 border border-white/20'
              : 'bg-[#111116] border border-white/8 text-[#e5e7eb]/50 hover:text-white hover:border-white/20'
          }`}
        >
          <Lock size={14} /> Closed ({closedCount})
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-[#111116] border border-white/8 rounded-xl p-12 text-center">
          <Ticket size={28} className="mx-auto mb-3 text-[#e5e7eb]/20" />
          <p className="text-[#e5e7eb]/40 text-sm">
            {showClosed ? 'No closed tickets.' : 'No open tickets.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#111116] border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">#</th>
                <th className="px-5 py-3 text-left font-medium">Subject</th>
                <th className="px-5 py-3 text-left font-medium">Creator</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Opened</th>
                {showClosed && <th className="px-5 py-3 text-left font-medium">Closed</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-[#1c1c24] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/30">#{t.ticketNumber}</td>
                  <td className="px-5 py-3 font-medium text-white max-w-xs truncate">{t.subject}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/40">{t.creatorId}</td>
                  <td className="px-5 py-3">
                    {t.status === 'OPEN' ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-green-400 bg-green-400/10 border border-green-400/20">
                        Open
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-[#e5e7eb]/40 bg-white/5 border border-white/10">
                        Closed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="opacity-50" />
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </td>
                  {showClosed && (
                    <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs whitespace-nowrap">
                      {t.closedAt ? new Date(t.closedAt).toLocaleString() : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
