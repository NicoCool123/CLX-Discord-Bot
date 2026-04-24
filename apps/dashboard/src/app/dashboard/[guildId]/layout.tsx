import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '../../../auth';
import { getUserGuilds, hasManageGuild, getGuildIconUrl } from '../../../lib/discord';
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
    { href: `/dashboard/${guildId}`, label: 'Overview', icon: '📊' },
    { href: `/dashboard/${guildId}/moderation`, label: 'Moderation', icon: '🔨' },
    { href: `/dashboard/${guildId}/users`, label: 'Users', icon: '👥' },
    { href: `/dashboard/${guildId}/automod`, label: 'Automod', icon: '🤖' },
    { href: `/dashboard/${guildId}/settings`, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-[#e5e7eb]/10 flex flex-col flex-shrink-0">
        {/* Logo + guild header */}
        <div className="px-5 py-5 border-b border-[#e5e7eb]/10">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/icons/clx-icon.png" alt="CLX" width={24} height={24} className="rounded-md opacity-90" />
            <span className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-widest">CLX</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/80 transition-colors mb-3">
            ← All Servers
          </Link>
          <div className="flex items-center gap-3">
            <Image
              src={getGuildIconUrl(guild.id, guild.icon)}
              alt={guild.name}
              width={32}
              height={32}
              className="rounded-full ring-1 ring-[#e5e7eb]/10 flex-shrink-0"
            />
            <p className="font-semibold text-white text-sm truncate">{guild.name}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e5e7eb]/60 hover:text-white hover:bg-[#1f2937] transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#e5e7eb]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-[#e5e7eb]/10 flex-shrink-0"
                />
              )}
              <span className="text-xs text-[#e5e7eb]/60 truncate">{session.user?.name}</span>
            </div>
            <Link href="/api/auth/signout" className="text-xs text-[#e5e7eb]/30 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
