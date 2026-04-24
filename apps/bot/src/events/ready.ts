import { Client } from 'discord.js';
import { db } from '@clx/database';
import type { Event } from '../types';

export default {
  name: 'clientReady',
  once: true,
  async execute(...args: unknown[]) {
    const c = args[0] as Client<true>;
    console.log(`[Ready] Logged in as ${c.user.tag}`);
    console.log(`[Ready] Serving ${c.guilds.cache.size} guild(s)`);

    // Upsert all current guilds into the database
    const guilds = c.guilds.cache.values();
    for (const guild of guilds) {
      await db.guild.upsert({
        where: { guildId: guild.id },
        create: { guildId: guild.id, name: guild.name },
        update: { name: guild.name },
      });
    }

    console.log(`[Ready] Guild records synced.`);
  },
} satisfies Event;
