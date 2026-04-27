import { GuildMember, EmbedBuilder, Colors, Role } from 'discord.js';
import type { Event } from '../types';

export default {
  name: 'guildMemberUpdate',
  async execute(...args: unknown[]) {
    const oldMember = args[0] as GuildMember;
    const newMember = args[1] as GuildMember;

    const added: Role[] = [];
    const removed: Role[] = [];

    for (const [id, role] of newMember.roles.cache) {
      if (!oldMember.roles.cache.has(id)) added.push(role);
    }
    for (const [id, role] of oldMember.roles.cache) {
      if (!newMember.roles.cache.has(id)) removed.push(role);
    }

    if (added.length === 0 && removed.length === 0) return;

    const fields = [];
    if (added.length > 0) {
      fields.push({ name: '✅ Added', value: added.map((r) => `\`${r.name}\``).join(', ') });
    }
    if (removed.length > 0) {
      fields.push({ name: '❌ Removed', value: removed.map((r) => `\`${r.name}\``).join(', ') });
    }

    const embed = new EmbedBuilder()
      .setColor(added.length > 0 ? Colors.Green : Colors.Red)
      .setTitle('Your roles were updated')
      .setDescription(`Your roles in **[${newMember.guild.name}](https://discord.com/channels/${newMember.guild.id})** have changed.`)
      .addFields(fields)
      .setTimestamp();

    await newMember.user.send({ embeds: [embed] }).catch(() => null);
  },
} satisfies Event;
