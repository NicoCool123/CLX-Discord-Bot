export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

const MANAGE_GUILD = BigInt(0x20);
const ADMINISTRATOR = BigInt(0x8);

export function hasManageGuild(permissions: string): boolean {
  const perms = BigInt(permissions);
  return (perms & ADMINISTRATOR) !== 0n || (perms & MANAGE_GUILD) !== 0n;
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

export function getGuildIconUrl(guildId: string, icon: string | null): string {
  if (!icon) return `https://cdn.discordapp.com/embed/avatars/0.png`;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png`;
}
