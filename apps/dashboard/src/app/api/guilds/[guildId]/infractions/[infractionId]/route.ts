import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../../lib/discord';
import { db } from '../../../../../../lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ guildId: string; infractionId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId, infractionId } = await params;

  const guilds = await getUserGuilds(session.accessToken);
  if (!guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const infraction = await db.infraction.findFirst({
    where: { id: infractionId, guildId },
  });

  if (!infraction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.infraction.delete({ where: { id: infractionId } });
  return NextResponse.json({ success: true });
}

// Handle form-based DELETE (POST with _method=DELETE)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string; infractionId: string }> },
) {
  const body = await req.formData().catch(() => null);
  if (body?.get('_method') === 'DELETE') {
    return DELETE(req, { params });
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
