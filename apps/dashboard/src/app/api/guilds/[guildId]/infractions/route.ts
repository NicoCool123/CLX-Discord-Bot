import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../lib/discord';
import { db } from '../../../../../lib/db';
import { InfractionType } from '@clx/database';

const PAGE_SIZE = 20;

async function verifyAccess(accessToken: string, guildId: string) {
  const guilds = await getUserGuilds(accessToken);
  return guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.formData();
  const userId    = (body.get('userId') as string)?.trim();
  const type      = body.get('type') as InfractionType;
  const reason    = (body.get('reason') as string)?.trim();
  const durationStr = body.get('duration') as string;
  const redirectTo  = (body.get('_redirect') as string) ?? null;

  const validTypes = Object.values(InfractionType) as string[];
  if (!userId || !type || !reason || !validTypes.includes(type)) {
    return NextResponse.json({ error: 'userId, type, and reason are required' }, { status: 400 });
  }

  const durationMins = parseInt(durationStr, 10);
  const duration = type === InfractionType.MUTE && !isNaN(durationMins) && durationMins > 0
    ? durationMins * 60
    : null;

  // Ensure the user record exists in the DB
  const user = await db.user.findUnique({ where: { userId_guildId: { userId, guildId } } });
  if (!user) {
    return NextResponse.json({ error: 'User not found in this guild' }, { status: 404 });
  }

  await db.infraction.create({
    data: {
      userId,
      guildId,
      type,
      reason,
      moderatorId: session.user?.id ?? 'dashboard',
      duration,
    },
  });

  const dest = redirectTo ?? `/dashboard/${guildId}/moderation`;
  return NextResponse.redirect(new URL(dest, req.url));
}
