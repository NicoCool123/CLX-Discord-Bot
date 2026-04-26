import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../../auth';
import { verifyAccess } from '../../../../../../../lib/api';
import { db } from '../../../../../../../lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { guildId } = await params;
  if (!(await verifyAccess(session.accessToken, guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const s = await db.guildSettings.findUnique({ where: { guildId } });
  if (!s?.ticketChannelId) {
    return NextResponse.json({ error: 'No ticket channel configured' }, { status: 400 });
  }

  const categories = s.ticketCategories ?? [];

  const embed = {
    title: 'Support Tickets',
    description: 'Select your support type below to open a ticket. Our staff will assist you as soon as possible.',
    color: 0x5865f2,
    footer: { text: 'Select a category to open a ticket' },
    timestamp: new Date().toISOString(),
  };

  const components =
    categories.length > 0
      ? [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: 'ticket:category',
                placeholder: '🎫 Select a category to open a ticket',
                options: categories.map((cat) => ({ label: cat, value: cat })),
              },
            ],
          },
        ]
      : [
          {
            type: 1,
            components: [
              {
                type: 2,
                custom_id: 'ticket:open',
                style: 1,
                label: '🎫 Open Ticket',
              },
            ],
          },
        ];

  const res = await fetch(`https://discord.com/api/v10/channels/${s.ticketChannelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ embeds: [embed], components }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    return NextResponse.json({ error: 'Discord API error', detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
