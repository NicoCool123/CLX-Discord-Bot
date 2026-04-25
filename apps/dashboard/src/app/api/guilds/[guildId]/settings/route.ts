import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../lib/discord';
import { db } from '../../../../../lib/db';

async function verifyAccess(accessToken: string, guildId: string): Promise<boolean> {
  const guilds = await getUserGuilds(accessToken);
  return guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const settings = await db.guildSettings.findUnique({ where: { guildId } });
  return NextResponse.json(settings);
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

  const body = await req.formData().catch(() => null);
  if (!body) {
    // Also accept JSON
    const json = await req.json().catch(() => null);
    if (!json) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });

    const settings = await db.guildSettings.upsert({
      where: { guildId },
      create: { guildId, ...json },
      update: json,
    });
    return NextResponse.json(settings);
  }

  const blacklistedWords = (body.get('blacklistedWords') as string ?? '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  const allowedLinks = (body.get('allowedLinks') as string ?? '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);

  const data = {
    automodEnabled: body.get('automodEnabled') === 'on',
    logChannelId: (body.get('logChannelId') as string)?.trim() || null,
    muteRoleId: (body.get('muteRoleId') as string)?.trim() || null,
    spamThreshold: parseInt(body.get('spamThreshold') as string, 10) || 5,
    spamInterval: parseInt(body.get('spamInterval') as string, 10) || 5,
    blacklistedWords,
    allowedLinks,
  };

  await db.guildSettings.upsert({
    where: { guildId },
    create: { guildId, ...data },
    update: data,
  });

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/settings`, req.url));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const settings = await db.guildSettings.upsert({
    where: { guildId },
    create: { guildId, ...body },
    update: body,
  });

  return NextResponse.json(settings);
}
