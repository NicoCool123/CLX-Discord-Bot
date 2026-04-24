import { GuildMember } from 'discord.js';
import { db } from '@clx/database';
import type { Event } from '../types';

export default {
  name: 'guildMemberAdd',
  async execute(...args: unknown[]) {
    const member = args[0] as GuildMember;

    await db.user.upsert({
      where: {
        userId_guildId: {
          userId: member.id,
          guildId: member.guild.id,
        },
      },
      create: {
        userId: member.id,
        guildId: member.guild.id,
        username: member.user.username,
      },
      update: {
        username: member.user.username,
      },
    });
  },
} satisfies Event;
