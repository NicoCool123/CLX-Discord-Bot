import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { verifyAccess } from '../../../../../../lib/api';
import { db } from '../../../../../../lib/db';

const FIELD_MAP: Record<string, string> = {
  welcome: 'welcomeEnabled',
  logging: 'loggingEnabled',
  automod: 'automodEnabled',
  tickets: 'ticketsEnabled',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { module, enabled } = await req.json();
  const field = FIELD_MAP[module];
  if (!field || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  await db.guildSettings.upsert({
    where: { guildId },
    update: { [field]: enabled },
    create: { guildId, [field]: enabled },
  });

  return NextResponse.json({ ok: true });
}
