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
    WARN: 'text-yellow-400',
    MUTE: 'text-orange-400',
    BAN: 'text-red-400',
    KICK: 'text-red-300',
    UNBAN: 'text-green-400',
    AUTOMOD: 'text-purple-400',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderation Log</h1>

      {infractions.length === 0 ? (
        <p className="text-gray-500">No infractions recorded.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 pr-4">Case</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Reason</th>
                  <th className="pb-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {infractions.map((inf) => (
                  <tr key={inf.id} className="hover:bg-gray-800/50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                      #{inf.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 font-medium">{inf.user.username}</td>
                    <td className={`py-3 pr-4 font-semibold ${typeColors[inf.type] ?? 'text-gray-300'}`}>
                      {inf.type}
                    </td>
                    <td className="py-3 pr-4 text-gray-300 max-w-xs truncate">{inf.reason}</td>
                    <td className="py-3 text-gray-500 whitespace-nowrap">
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
                  className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Previous
                </a>
              )}
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`?page=${page + 1}`}
                  className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
