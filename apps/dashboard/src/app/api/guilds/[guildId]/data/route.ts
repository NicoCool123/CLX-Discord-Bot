import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db } from '../../../../../lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  const body = await req.formData();
  if (body.get('_method') !== 'DELETE') {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const userId = session.user.id;

  await db.$transaction([
    db.infraction.deleteMany({ where: { userId, guildId } }),
    db.ticket.deleteMany({ where: { creatorId: userId, guildId } }),
  ]);

  await db.user.deleteMany({ where: { userId, guildId } });

  return NextResponse.redirect(new URL(`/dashboard/${guildId}/data?deleted=1`, req.url));
}
