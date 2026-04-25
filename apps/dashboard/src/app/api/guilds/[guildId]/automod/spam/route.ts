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
  const action = (body.get('action') as AutomodAction) ?? AutomodAction.WARN;
  const enabled = body.get('enabled') === 'on';
  const spamThreshold = Math.min(50, Math.max(2, parseInt(body.get('spamThreshold') as string, 10) || 5));
  const spamInterval = Math.min(60, Math.max(1, parseInt(body.get('spamInterval') as string, 10) || 5));

  const guild = await db.guild.findUnique({ where: { guildId } });
  if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });

  await Promise.all([
    db.automodRule.upsert({
      where: { guildId_type: { guildId, type: AutomodRuleType.SPAM } },
      create: { guildId, type: AutomodRuleType.SPAM, action, enabled },
      update: { action, enabled },
    }),
    db.guildSettings.upsert({
      where: { guildId },
      create: { guildId, spamThreshold, spamInterval },
      update: { spamThreshold, spamInterval },
    }),
  ]);

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/automod`, req.url));
}
