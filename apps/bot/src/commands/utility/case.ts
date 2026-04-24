import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { db } from '@clx/database';
import { formatDuration } from '@clx/shared';
import type { Command } from '../../types';

const TYPE_COLOR: Record<string, number> = {
  WARN: 0xfbbf24,
  MUTE: 0xf97316,
  BAN: 0xef4444,
  KICK: 0xfca5a5,
  UNBAN: 0x22c55e,
  AUTOMOD: 0xa855f7,
};

export default {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Look up a specific moderation case by ID')
    .addStringOption((o) =>
      o.setName('id').setDescription('Case ID (last 6 characters)').setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const input = interaction.options.getString('id', true).toUpperCase().replace('#', '');
    const guildId = interaction.guildId!;

    // Find by suffix match
    const infractions = await db.infraction.findMany({
      where: { guildId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const infraction = infractions.find((i) => i.id.slice(-6).toUpperCase() === input);

    if (!infraction) {
      return void interaction.editReply(`No case found with ID \`#${input}\`.`);
    }

    const moderator = await interaction.client.users.fetch(infraction.moderatorId).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(TYPE_COLOR[infraction.type] ?? Colors.Grey)
      .setTitle(`Case #${input} — ${infraction.type}`)
      .addFields(
        { name: 'User', value: `${infraction.user.username} (${infraction.userId})`, inline: true },
        { name: 'Moderator', value: moderator ? moderator.tag : infraction.moderatorId, inline: true },
        { name: 'Date', value: `<t:${Math.floor(infraction.createdAt.getTime() / 1000)}:F>`, inline: true },
        { name: 'Reason', value: infraction.reason },
      );

    if (infraction.duration) {
      embed.addFields({ name: 'Duration', value: formatDuration(infraction.duration), inline: true });
    }

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
