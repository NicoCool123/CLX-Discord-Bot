import { getUserGuilds, hasManageGuild } from './discord';

export async function verifyAccess(accessToken: string, guildId: string): Promise<boolean> {
  const guilds = await getUserGuilds(accessToken);
  return guilds.some((g) => g.id === guildId && hasManageGuild(g.permissions));
}
