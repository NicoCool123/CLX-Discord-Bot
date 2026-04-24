import { db } from '../../../../lib/db';

const PAGE_SIZE = 20;

export default async function ModerationPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { guildId } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [infractions, total] = await Promise.all([
    db.infraction.findMany({
      where: { guildId },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      include: { user: true },
    }),
    db.infraction.count({ where: { guildId } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const typeColors: Record<string, string> = {
    WARN: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
    MUTE: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
    BAN: 'text-red-500 bg-red-500/10 border border-red-500/20',
    KICK: 'text-red-300 bg-red-300/10 border border-red-300/20',
    UNBAN: 'text-green-400 bg-green-400/10 border border-green-400/20',
    AUTOMOD: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation Log</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">{total} total infraction{total !== 1 ? 's' : ''}</p>
      </div>

      {infractions.length === 0 ? (
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-12 text-center">
          <p className="text-[#e5e7eb]/40">No infractions recorded.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">Case</th>
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">Type</th>
                  <th className="px-5 py-3 text-left font-medium">Reason</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/5">
                {infractions.map((inf) => (
                  <tr key={inf.id} className="hover:bg-[#263348] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/30">
                      #{inf.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">{inf.user.username}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[inf.type] ?? 'text-[#e5e7eb] bg-[#e5e7eb]/10'}`}>
                        {inf.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#e5e7eb]/60 max-w-xs truncate">{inf.reason}</td>
                    <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs whitespace-nowrap">
                      {new Date(inf.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 items-center justify-center text-sm">
              {page > 1 && (
                <a
                  href={`?page=${page - 1}`}
                  className="px-4 py-1.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg transition-colors"
                >
                  ← Previous
                </a>
              )}
              <span className="px-4 py-1.5 text-[#e5e7eb]/50 text-xs">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`?page=${page + 1}`}
                  className="px-4 py-1.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg transition-colors"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
