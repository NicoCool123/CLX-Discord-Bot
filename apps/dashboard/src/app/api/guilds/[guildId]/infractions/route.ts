import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../lib/discord';
import { db } from '../../../../../lib/db';

const PAGE_SIZE = 20;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;

  const guilds = await getUserGuilds(session.accessToken);
  const hasAccess = guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const userId = url.searchParams.get('userId') ?? undefined;
  const skip = (page - 1) * PAGE_SIZE;

  const where = { guildId, ...(userId ? { userId } : {}) };

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

  return NextResponse.json({
    infractions,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
