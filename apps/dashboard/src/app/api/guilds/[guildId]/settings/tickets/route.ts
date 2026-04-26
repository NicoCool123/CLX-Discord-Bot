import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { verifyAccess } from '../../../../../../lib/api';
import { db } from '../../../../../../lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.formData();

  const ticketCategories = (body.get('ticketCategories') as string ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    ticketChannelId: (body.get('ticketChannelId') as string)?.trim() || null,
    ticketOpenMessage: (body.get('ticketOpenMessage') as string)?.trim() || null,
    ticketCategories,
  };

  await db.guildSettings.upsert({
    where: { guildId },
    update: data,
    create: { guildId, ...data },
  });

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/settings/tickets`, req.url));
}
