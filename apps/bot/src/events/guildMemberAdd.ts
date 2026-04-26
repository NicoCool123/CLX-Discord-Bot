import { GuildMember, EmbedBuilder, Colors, TextChannel } from 'discord.js';
import { db } from '@clx/database';
import type { Event } from '../types';

export default {
  name: 'guildMemberAdd',
  async execute(...args: unknown[]) {
    const member = args[0] as GuildMember;
    const { guild } = member;

    await db.user.upsert({
      where: {
        userId_guildId: {
          userId: member.id,
          guildId: guild.id,
        },
      },
      create: {
        userId: member.id,
        guildId: guild.id,
        username: member.user.username,
      },
      update: {
        username: member.user.username,
      },
    });

    const settings = await db.guildSettings.findUnique({ where: { guildId: guild.id } });
    if (!settings?.welcomeChannelId || settings.welcomeEnabled === false) return;

    const channel = guild.channels.cache.get(settings.welcomeChannelId) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    const memberCount = guild.memberCount;

    const description = settings.welcomeMessage
      ? settings.welcomeMessage
          .replace(/\{member\}/g, `${member}`)
          .replace(/\{server\}/g, guild.name)
          .replace(/\{count\}/g, String(memberCount))
      : `Hey ${member}, glad to have you here. You're member **#${memberCount}**.`;

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
      .setTitle(`Welcome to ${guild.name}!`)
      .setDescription(description)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => null);
  },
} satisfies Event;
