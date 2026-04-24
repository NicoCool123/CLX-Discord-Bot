import Link from 'next/link';
import Image from 'next/image';
import { auth } from '../../auth';
import { getUserGuilds, hasManageGuild, getGuildIconUrl } from '../../lib/discord';

export default async function GuildSelectorPage() {
  const session = await auth();
  const guilds = await getUserGuilds(session!.accessToken);
  const manageableGuilds = guilds.filter((g) => hasManageGuild(g.permissions));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#e5e7eb]/10 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <Image src="/icons/clx-icon.png" alt="CLX" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-white">CLX Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#e5e7eb]/60">
          <span>Logged in as <span className="text-white font-medium">{session?.user?.name}</span></span>
          <Link href="/api/auth/signout" className="text-red-400 hover:text-red-300 transition-colors">
            Sign out
          </Link>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Select a Server</h1>
          <p className="text-[#e5e7eb]/50 text-sm mt-1">
            {manageableGuilds.length} server{manageableGuilds.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {manageableGuilds.length === 0 ? (
          <div className="text-center py-20 border border-[#e5e7eb]/10 rounded-2xl bg-[#1f2937]">
            <p className="text-[#e5e7eb]/50">You don&apos;t manage any servers with CLX installed.</p>
            {process.env.NEXT_PUBLIC_BOT_INVITE_URL && (
              <a
                href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                Invite CLX to a Server
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {manageableGuilds.map((guild) => (
              <Link
                key={guild.id}
                href={`/dashboard/${guild.id}`}
                className="flex items-center gap-4 p-5 bg-[#1f2937] border border-[#e5e7eb]/10 hover:border-[#e5e7eb]/30 rounded-xl transition-all hover:bg-[#263348]"
              >
                <Image
                  src={getGuildIconUrl(guild.id, guild.icon)}
                  alt={guild.name}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-[#e5e7eb]/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{guild.name}</p>
                  <p className="text-xs text-[#e5e7eb]/50 mt-0.5">{guild.owner ? 'Owner' : 'Admin'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
