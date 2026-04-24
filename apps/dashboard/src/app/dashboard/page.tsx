import Link from 'next/link';
import { auth } from '../../auth';
import { getUserGuilds, hasManageGuild, getGuildIconUrl } from '../../lib/discord';
import Image from 'next/image';

export default async function GuildSelectorPage() {
  const session = await auth();
  const guilds = await getUserGuilds(session!.accessToken);
  const manageableGuilds = guilds.filter((g) => hasManageGuild(g.permissions));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Select a Server</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>Logged in as {session?.user?.name}</span>
            <Link href="/api/auth/signout" className="text-red-400 hover:text-red-300">
              Sign out
            </Link>
          </div>
        </div>

        {manageableGuilds.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p>You don&apos;t manage any servers with CLX installed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {manageableGuilds.map((guild) => (
              <Link
                key={guild.id}
                href={`/dashboard/${guild.id}`}
                className="flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Image
                  src={getGuildIconUrl(guild.id, guild.icon)}
                  alt={guild.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{guild.name}</p>
                  <p className="text-xs text-gray-400">{guild.owner ? 'Owner' : 'Admin'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
