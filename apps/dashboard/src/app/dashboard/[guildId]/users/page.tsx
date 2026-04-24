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
      <h1 className="text-2xl font-bold">Users</h1>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by username or user ID..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
        {query && (
          <Link
            href="?"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {query ? 'No users found matching your search.' : 'No users recorded yet.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="pb-3 pr-4">Username</th>
                <th className="pb-3 pr-4">User ID</th>
                <th className="pb-3 pr-4 text-center">Infractions</th>
                <th className="pb-3 pr-4">First Seen</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-800/50">
                  <td className="py-3 pr-4 font-medium">{user.username}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{user.userId}</td>
                  <td className="py-3 pr-4 text-center">
                    {user._count.infractions > 0 ? (
                      <span className="text-red-400 font-semibold">{user._count.infractions}</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`users/${user.userId}`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs"
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
