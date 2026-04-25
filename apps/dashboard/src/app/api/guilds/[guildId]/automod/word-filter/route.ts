import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../../lib/discord';
import { db } from '../../../../../../lib/db';
import { AutomodAction, AutomodRuleType } from '@clx/database';

async function verifyAccess(accessToken: string, guildId: string) {
  const guilds = await getUserGuilds(accessToken);
  return guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
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
  const action = (body.get('action') as AutomodAction) ?? AutomodAction.DELETE;
  const enabled = body.get('enabled') === 'on';
  const blacklistedWords = (body.get('blacklistedWords') as string ?? '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);

  const guild = await db.guild.findUnique({ where: { guildId } });
  if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });

  await Promise.all([
    db.automodRule.upsert({
      where: { guildId_type: { guildId, type: AutomodRuleType.WORD_FILTER } },
      create: { guildId, type: AutomodRuleType.WORD_FILTER, action, enabled },
      update: { action, enabled },
    }),
    db.guildSettings.upsert({
      where: { guildId },
      create: { guildId, blacklistedWords },
      update: { blacklistedWords },
    }),
  ]);

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/automod`, req.url));
}
