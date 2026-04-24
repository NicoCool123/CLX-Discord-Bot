import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../lib/discord';
import { db } from '../../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;

  const guilds = await getUserGuilds(session.accessToken);
  if (!guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get('q')?.trim() ?? '';

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
    take: 20,
  });

  return NextResponse.json(users);
}
