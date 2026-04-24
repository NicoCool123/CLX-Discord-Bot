import Link from 'next/link';
import { db } from '../../../../lib/db';

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { guildId } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const users = await db.user.findMany({
    where: {
      guildId,
      ...(query
        ? {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { userId: { contains: query } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { infractions: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          {query ? `${users.length} result${users.length !== 1 ? 's' : ''} for "${query}"` : `${users.length} users recorded`}
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by username or user ID..."
          className="flex-1 bg-[#1f2937] border border-[#e5e7eb]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
        {query && (
          <Link
            href="?"
            className="px-5 py-2.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg text-sm transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-12 text-center">
          <p className="text-[#e5e7eb]/40 text-sm">
            {query ? 'No users found matching your search.' : 'No users recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]/10 text-xs text-[#e5e7eb]/40 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Username</th>
                <th className="px-5 py-3 text-left font-medium">User ID</th>
                <th className="px-5 py-3 text-center font-medium">Infractions</th>
                <th className="px-5 py-3 text-left font-medium">First Seen</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]/5">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-[#263348] transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{user.username}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/40">{user.userId}</td>
                  <td className="px-5 py-3 text-center">
                    {user._count.infractions > 0 ? (
                      <span className="text-red-400 font-semibold">{user._count.infractions}</span>
                    ) : (
                      <span className="text-[#e5e7eb]/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#e5e7eb]/40 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`users/${user.userId}`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
