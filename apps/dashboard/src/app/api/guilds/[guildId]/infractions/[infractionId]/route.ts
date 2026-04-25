import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../../../../lib/discord';
import { db } from '../../../../../../lib/db';

async function verifyAccess(accessToken: string, guildId: string) {
  const guilds = await getUserGuilds(accessToken);
  return guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ guildId: string; infractionId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId, infractionId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const infraction = await db.infraction.findFirst({ where: { id: infractionId, guildId } });
  if (!infraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.infraction.delete({ where: { id: infractionId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string; infractionId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId, infractionId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const infraction = await db.infraction.findFirst({ where: { id: infractionId, guildId } });
  if (!infraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Accept both form and JSON
  let reason: string | null = null;
  let redirectTo: string | null = null;

  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const body = await req.formData();
    reason = (body.get('reason') as string)?.trim() ?? null;
    redirectTo = (body.get('_redirect') as string) ?? null;
  } else {
    const json = await req.json().catch(() => ({}));
    reason = json.reason ?? null;
  }

  if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 });

  await db.infraction.update({ where: { id: infractionId }, data: { reason } });

  if (redirectTo) return NextResponse.redirect(new URL(redirectTo, req.url));
  return NextResponse.json({ success: true });
}

// Handle form-based method overrides
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string; infractionId: string }> },
) {
  const body = await req.formData().catch(() => null);
  const method = body?.get('_method') as string | null;

  if (method === 'DELETE') return DELETE(req, { params });
  if (method === 'PATCH')  return PATCH(req, { params });

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
