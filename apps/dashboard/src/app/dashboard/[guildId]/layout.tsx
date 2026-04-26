import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Users, Shield, AlertOctagon,
  Zap, BarChart2, Bug, Settings, ChevronLeft, LogOut, Ticket,
} from 'lucide-react';
import { auth } from '../../../auth';
import { getUserGuilds, hasManageGuild, getGuildIconUrl } from '../../../lib/discord';
import { db } from '../../../lib/db';
import { TabPrefetcher } from '../../../components/TabPrefetcher';

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

  // Ordered: summary → people → events → automation → insights → system
  const navGroups = [
    {
      items: [
        { href: `/dashboard/${guildId}`,              label: 'Overview',      Icon: LayoutDashboard },
      ],
    },
    {
      label: 'Management',
      items: [
        { href: `/dashboard/${guildId}/users`,        label: 'Users',         Icon: Users },
        { href: `/dashboard/${guildId}/moderation`,   label: 'Mod Log',       Icon: Shield },
        { href: `/dashboard/${guildId}/active-cases`, label: 'Active Cases',  Icon: AlertOctagon },
        { href: `/dashboard/${guildId}/tickets`,      label: 'Tickets',       Icon: Ticket },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { href: `/dashboard/${guildId}/automod`,      label: 'Automod',       Icon: Zap },
        { href: `/dashboard/${guildId}/settings`,     label: 'Settings',      Icon: Settings },
      ],
    },
    {
      label: 'Insights',
      items: [
        { href: `/dashboard/${guildId}/analytics`,    label: 'Analytics',     Icon: BarChart2 },
        { href: `/dashboard/${guildId}/debug`,        label: 'Debug',         Icon: Bug },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#0d0d11] border-r border-[#e5e7eb]/10 flex flex-col flex-shrink-0">
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

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label ?? 'root'}>
              {group.label && (
                <p className="px-3 mb-1 text-[10px] font-semibold text-[#e5e7eb]/25 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e5e7eb]/60 hover:text-white hover:bg-[#111116] transition-colors"
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#e5e7eb]/10">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/${guildId}/data`}
              className="flex items-center gap-2 min-w-0 group"
            >
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                  width={26}
                  height={26}
                  className="rounded-full ring-1 ring-[#e5e7eb]/10 flex-shrink-0 group-hover:ring-indigo-500/50 transition-all"
                />
              )}
              <span className="text-xs text-[#e5e7eb]/60 truncate group-hover:text-white transition-colors">
                {session.user?.name}
              </span>
            </Link>
            <Link href="/api/auth/signout" className="text-[#e5e7eb]/30 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <TabPrefetcher urls={[
          `/dashboard/${guildId}`,
          `/dashboard/${guildId}/users`,
          `/dashboard/${guildId}/moderation`,
          `/dashboard/${guildId}/active-cases`,
          `/dashboard/${guildId}/tickets`,
          `/dashboard/${guildId}/automod`,
          `/dashboard/${guildId}/settings`,
          `/dashboard/${guildId}/analytics`,
          `/dashboard/${guildId}/debug`,
        ]} />
        {children}
      </main>
    </div>
  );
}
