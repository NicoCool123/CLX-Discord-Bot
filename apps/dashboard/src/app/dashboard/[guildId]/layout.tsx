import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Shield, Users, Zap, Settings, BarChart2, ChevronLeft, LogOut } from 'lucide-react';
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

  if (!session) redirect('/api/auth/signin');

  const guilds = await getUserGuilds(session.accessToken);
  const guild = guilds.find((g) => g.id === guildId && hasManageGuild(g.permissions));

  if (!guild) notFound();

  await db.guild.upsert({
    where: { guildId },
    create: { guildId, name: guild.name },
    update: { name: guild.name },
  });

  const navItems = [
    { href: `/dashboard/${guildId}`,            label: 'Overview',    Icon: LayoutDashboard },
    { href: `/dashboard/${guildId}/moderation`, label: 'Moderation',  Icon: Shield },
    { href: `/dashboard/${guildId}/users`,      label: 'Users',       Icon: Users },
    { href: `/dashboard/${guildId}/automod`,    label: 'Automod',     Icon: Zap },
    { href: `/dashboard/${guildId}/analytics`,  label: 'Analytics',   Icon: BarChart2 },
    { href: `/dashboard/${guildId}/settings`,   label: 'Settings',    Icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#0f172a] border-r border-[#e5e7eb]/10 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-5 py-5 border-b border-[#e5e7eb]/10">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/icons/clx-icon.png" alt="CLX" width={22} height={22} className="rounded-md opacity-90" />
            <span className="text-xs font-semibold text-[#e5e7eb]/40 uppercase tracking-widest">CLX</span>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#e5e7eb]/40 hover:text-[#e5e7eb]/80 transition-colors mb-3">
            <ChevronLeft size={12} /> All Servers
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e5e7eb]/60 hover:text-white hover:bg-[#1f2937] transition-colors"
            >
              <Icon size={15} className="flex-shrink-0" />
              <span>{label}</span>
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
                  width={26}
                  height={26}
                  className="rounded-full ring-1 ring-[#e5e7eb]/10 flex-shrink-0"
                />
              )}
              <span className="text-xs text-[#e5e7eb]/60 truncate">{session.user?.name}</span>
            </div>
            <Link href="/api/auth/signout" className="text-[#e5e7eb]/30 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
