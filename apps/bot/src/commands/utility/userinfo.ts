import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  GuildMember,
} from 'discord.js';
import { db } from '@clx/database';
import { formatDuration } from '@clx/shared';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show information and moderation history for a user')
    .addUserOption((o) =>
      o.setName('user').setDescription('User to look up (defaults to yourself)'),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('user') ?? interaction.user;
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    const member = await guild.members.fetch(target.id).catch(() => null);

    // DB lookup
    const infractions = await db.infraction.findMany({
      where: { userId: target.id, guildId },
      orderBy: { createdAt: 'desc' },
    });

    const counts = infractions.reduce(
      (acc, inf) => {
        acc[inf.type] = (acc[inf.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const embed = new EmbedBuilder()
      .setColor(member ? Colors.Blurple : Colors.Grey)
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'User ID', value: target.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
      );

    if (member) {
      embed.addFields(
        {
          name: 'Joined Server',
          value: member.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : 'Unknown',
          inline: true,
        },
        {
          name: 'Roles',
          value:
            member.roles.cache
              .filter((r) => r.id !== guild.id)
              .sort((a, b) => b.position - a.position)
              .map((r) => `<@&${r.id}>`)
              .slice(0, 10)
              .join(' ') || 'None',
        },
      );

      if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) {
        embed.addFields({
          name: '⚠️ Currently Timed Out',
          value: `Until <t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:R>`,
        });
      }
    } else {
      embed.addFields({ name: 'Status', value: '❌ Not in server', inline: true });
    }

    // Infraction summary
    const infractionSummary =
      infractions.length === 0
        ? 'No infractions'
        : [
            counts.WARN ? `${counts.WARN} warn${counts.WARN > 1 ? 's' : ''}` : null,
            counts.MUTE ? `${counts.MUTE} mute${counts.MUTE > 1 ? 's' : ''}` : null,
            counts.KICK ? `${counts.KICK} kick${counts.KICK > 1 ? 's' : ''}` : null,
            counts.BAN ? `${counts.BAN} ban${counts.BAN > 1 ? 's' : ''}` : null,
            counts.AUTOMOD ? `${counts.AUTOMOD} automod` : null,
          ]
            .filter(Boolean)
            .join(' · ');

    embed.addFields({ name: `Infractions (${infractions.length})`, value: infractionSummary });

    // Last 3 infractions
    if (infractions.length > 0) {
      const recent = infractions.slice(0, 3).map((inf) => {
        const caseId = inf.id.slice(-6).toUpperCase();
        return `\`#${caseId}\` **${inf.type}** — ${inf.reason.slice(0, 60)}`;
      });
      embed.addFields({ name: 'Recent Cases', value: recent.join('\n') });
    }

    embed.setFooter({ text: `${infractions.length} total infraction${infractions.length !== 1 ? 's' : ''}` });

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
