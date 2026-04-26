import Link from 'next/link';
import { MessageSquare, Hash, Shield, Zap, Ticket, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { db } from '../../../../lib/db';
import { ModuleToggle } from '../../../../components/ModuleToggle';

export default async function SettingsHubPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const s = await db.guildSettings.findUnique({ where: { guildId } });

  const modules = [
    {
      href: `/dashboard/${guildId}/settings/welcome`,
      module: 'welcome',
      Icon: MessageSquare,
      title: 'Welcome Messages',
      desc: 'Greet new members with a custom message. Supports {member}, {server} and {count}.',
      configured: !!s?.welcomeChannelId,
      enabled: s?.welcomeEnabled ?? true,
      hasToggle: true,
    },
    {
      href: `/dashboard/${guildId}/settings/logging`,
      module: 'logging',
      Icon: Hash,
      title: 'Logging',
      desc: 'Choose which channel receives moderation action logs.',
      configured: !!s?.logChannelId,
      enabled: s?.loggingEnabled ?? true,
      hasToggle: true,
    },
    {
      href: `/dashboard/${guildId}/settings/roles`,
      module: 'roles',
      Icon: Shield,
      title: 'Roles',
      desc: 'Set the mute role used as fallback when Discord timeout is unavailable.',
      configured: !!s?.muteRoleId,
      enabled: true,
      hasToggle: false,
    },
    {
      href: `/dashboard/${guildId}/automod`,
      module: 'automod',
      Icon: Zap,
      title: 'Automod',
      desc: 'Spam detection, word filter, and link detection rules.',
      configured: s?.automodEnabled ?? false,
      enabled: s?.automodEnabled ?? true,
      hasToggle: true,
    },
    {
      href: `/dashboard/${guildId}/settings/tickets`,
      module: 'tickets',
      Icon: Ticket,
      title: 'Tickets',
      desc: 'Configure the ticket channel, support categories, and the open message.',
      configured: !!s?.ticketChannelId,
      enabled: s?.ticketsEnabled ?? true,
      hasToggle: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#e5e7eb]/50 text-sm mt-1">Configure each module independently. Use the toggle to enable or disable a module instantly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map(({ href, module, Icon, title, desc, configured, enabled, hasToggle }) => (
          <div
            key={module}
            className={`group relative bg-[#111116] border rounded-xl overflow-hidden transition-all duration-200 hover:bg-[#16161e] ${
              enabled
                ? 'border-[#e5e7eb]/10 hover:border-indigo-500/40'
                : 'border-[#e5e7eb]/5 opacity-60'
            }`}
          >
            {/* Overlay link — clicking anywhere navigates */}
            <Link href={href} className="absolute inset-0 z-0 rounded-xl" aria-label={`Configure ${title}`} />

            {/* Content — pointer-events-none so clicks pass through to the link */}
            <div className="relative p-6 flex flex-col gap-3 pointer-events-none">
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${enabled ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' : 'bg-[#e5e7eb]/5'}`}>
                  <Icon size={16} className={enabled ? 'text-indigo-400' : 'text-[#e5e7eb]/30'} />
                </div>
                <div className="flex items-center gap-2">
                  {configured ? (
                    <CheckCircle2 size={13} className="text-emerald-400/70" />
                  ) : (
                    <Circle size={13} className="text-[#e5e7eb]/15" />
                  )}
                  {/* Toggle re-enables pointer events */}
                  {hasToggle && (
                    <div className="pointer-events-auto relative z-10">
                      <ModuleToggle guildId={guildId} module={module} defaultEnabled={enabled} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className={`font-semibold text-sm transition-colors duration-200 ${enabled ? 'text-white group-hover:text-indigo-200' : 'text-[#e5e7eb]/40'}`}>
                  {title}
                </p>
                <p className="text-xs text-[#e5e7eb]/35 mt-1 leading-relaxed">{desc}</p>
              </div>

              <div className="flex items-center justify-end">
                <ChevronRight
                  size={13}
                  className={`transition-all duration-200 ${enabled ? 'text-[#e5e7eb]/20 group-hover:text-indigo-400 group-hover:translate-x-0.5' : 'text-[#e5e7eb]/10'}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
