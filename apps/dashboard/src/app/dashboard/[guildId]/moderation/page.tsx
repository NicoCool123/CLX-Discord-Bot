import { db } from '../../../../lib/db';
import Link from 'next/link';
import { Filter } from 'lucide-react';

const PAGE_SIZE = 20;

const ALL_TYPES = ['WARN', 'MUTE', 'KICK', 'BAN', 'UNBAN', 'AUTOMOD'] as const;

const typeColors: Record<string, string> = {
  WARN:    'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  MUTE:    'text-orange-400 bg-orange-400/10 border border-orange-400/20',
  BAN:     'text-red-500 bg-red-500/10 border border-red-500/20',
  KICK:    'text-red-300 bg-red-300/10 border border-red-300/20',
  UNBAN:   'text-green-400 bg-green-400/10 border border-green-400/20',
  AUTOMOD: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
};

const typeActive: Record<string, string> = {
  WARN:    'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40',
  MUTE:    'bg-orange-400/20 text-orange-400 border border-orange-400/40',
  BAN:     'bg-red-500/20 text-red-500 border border-red-500/40',
  KICK:    'bg-red-300/20 text-red-300 border border-red-300/40',
  UNBAN:   'bg-green-400/20 text-green-400 border border-green-400/40',
  AUTOMOD: 'bg-purple-400/20 text-purple-400 border border-purple-400/40',
};

export default async function ModerationPage({
  params,
  searchParams,
}: {
  params: Promise<{ guildId: string }>;
  searchParams: Promise<{ page?: string; type?: string; q?: string; mod?: string }>;
}) {
  const { guildId } = await params;
  const { page: pageStr, type: typeFilter, q, mod } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;
  const query = q?.trim() ?? '';
  const modFilter = mod?.trim() ?? '';

  const where = {
    guildId,
    ...(typeFilter && ALL_TYPES.includes(typeFilter as typeof ALL_TYPES[number]) ? { type: typeFilter as typeof ALL_TYPES[number] } : {}),
    ...(query ? { user: { username: { contains: query, mode: 'insensitive' as const } } } : {}),
    ...(modFilter ? { moderatorId: { contains: modFilter, mode: 'insensitive' as const } } : {}),
  };

  const [infractions, total] = await Promise.all([
    db.infraction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      include: { user: true },
    }),
    db.infraction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    if (query) p.q = query;
    if (typeFilter) p.type = typeFilter;
    if (modFilter) p.mod = modFilter;
    Object.assign(p, overrides);
    Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
    const qs = new URLSearchParams(p).toString();
    return qs ? `?${qs}` : '?';
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation Log</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">
          {total} infraction{total !== 1 ? 's' : ''}
          {typeFilter && <span className="ml-1 text-[#e5e7eb]/30">· type: {typeFilter}</span>}
          {modFilter && <span className="ml-1 text-[#e5e7eb]/30">· mod: {modFilter}</span>}
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex gap-2 flex-1 flex-wrap">
          {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by username…"
            className="flex-1 min-w-[160px] bg-[#1f2937] border border-[#e5e7eb]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <input
            name="mod"
            defaultValue={modFilter}
            placeholder="Filter by moderator ID…"
            className="flex-1 min-w-[160px] bg-[#1f2937] border border-[#e5e7eb]/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#e5e7eb]/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
          {(query || modFilter) && (
            <Link href={buildHref({ q: undefined, mod: undefined, page: undefined })} className="px-4 py-2.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg text-sm transition-colors">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Type filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-[#e5e7eb]/30 flex-shrink-0" />
        <Link
          href={buildHref({ type: undefined, page: undefined })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !typeFilter
              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
              : 'text-[#e5e7eb]/50 border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30'
          }`}
        >
          All
        </Link>
        {ALL_TYPES.map((t) => (
          <Link
            key={t}
            href={buildHref({ type: t, page: undefined })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              typeFilter === t ? typeActive[t] : `text-[#e5e7eb]/50 border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 ${typeColors[t]?.split(' ')[0] ?? ''}`
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {infractions.length === 0 ? (
        <div className="bg-[#1f2937] border border-[#e5e7eb]/10 rounded-xl p-12 text-center">
          <p className="text-[#e5e7eb]/40">No infractions found.</p>
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
                  <th className="px-5 py-3 text-left font-medium">Moderator</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]/5">
                {infractions.map((inf) => (
                  <tr key={inf.id} className="hover:bg-[#263348] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/30">
                      #{inf.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`../users/${inf.userId}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                        {inf.user.username}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[inf.type] ?? 'text-[#e5e7eb] bg-[#e5e7eb]/10'}`}>
                        {inf.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#e5e7eb]/60 max-w-xs truncate">{inf.reason}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#e5e7eb]/40 whitespace-nowrap">{inf.moderatorId}</td>
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
                <Link href={buildHref({ page: String(page - 1) })} className="px-4 py-1.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg transition-colors">
                  ← Previous
                </Link>
              )}
              <span className="px-4 py-1.5 text-[#e5e7eb]/50 text-xs">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })} className="px-4 py-1.5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-lg transition-colors">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
