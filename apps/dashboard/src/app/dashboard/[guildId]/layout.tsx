import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../auth';
import { getUserGuilds, hasManageGuild } from '../../../lib/discord';
import { db } from '../../../lib/db';

export default async function GuildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Verify user manages this guild
  const guilds = await getUserGuilds(session.accessToken);
  const guild = guilds.find((g) => g.id === guildId && hasManageGuild(g.permissions));

  if (!guild) {
    notFound();
  }

  // Ensure guild exists in DB
  await db.guild.upsert({
    where: { guildId },
    create: { guildId, name: guild.name },
    update: { name: guild.name },
  });

  const navItems = [
    { href: `/dashboard/${guildId}`, label: '📊 Overview' },
    { href: `/dashboard/${guildId}/moderation`, label: '🔨 Moderation' },
    { href: `/dashboard/${guildId}/users`, label: '👥 Users' },
    { href: `/dashboard/${guildId}/automod`, label: '🤖 Automod' },
    { href: `/dashboard/${guildId}/settings`, label: '⚙️ Settings' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-2">
        <div className="mb-4">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">
            ← All Servers
          </Link>
          <p className="font-semibold mt-2 truncate">{guild.name}</p>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto text-xs text-gray-600">
          <Link href="/api/auth/signout" className="hover:text-gray-400">
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
