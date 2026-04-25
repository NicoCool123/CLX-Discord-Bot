import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
} from 'discord.js';
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
    .addIntegerOption((o) =>
      o.setName('id').setDescription('Case number').setRequired(true).setMinValue(1),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const caseNumber = interaction.options.getInteger('id', true);
    const guildId = interaction.guildId!;

    const infraction = await db.infraction.findFirst({
      where: { guildId, caseNumber },
      include: { user: true },
    });

    if (!infraction) {
      return void interaction.editReply({
        embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ No case found with ID \`#${caseNumber}\`.`)],
      });
    }

    const moderator = await interaction.client.users.fetch(infraction.moderatorId).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(TYPE_COLOR[infraction.type] ?? Colors.Grey)
      .setTitle(`Case #${caseNumber} — ${infraction.type}`)
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
