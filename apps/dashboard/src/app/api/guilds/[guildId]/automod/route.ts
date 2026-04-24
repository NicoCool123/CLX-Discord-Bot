import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../lib/discord';
import { db } from '../../../../../lib/db';
import { AutomodRuleType, AutomodAction } from '@clx/database';

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

  const rules = await db.automodRule.findMany({ where: { guildId } });
  return NextResponse.json(rules);
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
  const type = body.get('type') as AutomodRuleType;
  const action = body.get('action') as AutomodAction;
  const enabled = body.get('enabled') === 'on';

  if (!type || !action) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  // Ensure guild exists before creating rule
  const guild = await db.guild.findUnique({ where: { guildId } });
  if (!guild) {
    return NextResponse.json({ error: 'Guild not found in database. Bot must be in server.' }, { status: 404 });
  }

  await db.automodRule.upsert({
    where: { guildId_type: { guildId, type } },
    create: { guildId, type, action, enabled },
    update: { action, enabled },
  });

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/automod`, req.url));
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

  const { type, action, enabled, config } = await req.json();

  const rule = await db.automodRule.upsert({
    where: { guildId_type: { guildId, type } },
    create: { guildId, type, action, enabled: enabled ?? true, config: config ?? {} },
    update: { action, enabled, config },
  });

  return NextResponse.json(rule);
}
