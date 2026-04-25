import { SlashCommandBuilder, EmbedBuilder, Colors } from 'discord.js';
import { db } from '@clx/database';
import { formatDuration } from '@clx/shared';
import type { Command } from '../../types';

const TYPE_EMOJI: Record<string, string> = {
  WARN: '⚠️',
  MUTE: '🔇',
  BAN: '🔨',
  KICK: '👢',
  UNBAN: '✅',
  AUTOMOD: '🤖',
};

export default {
  data: new SlashCommandBuilder()
    .setName('infractions')
    .setDescription("View a user's infraction history")
    .addUserOption((o) =>
      o.setName('user').setDescription('User to look up').setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('user', true);
    const guildId = interaction.guildId!;

    const [infractions, total] = await Promise.all([
      db.infraction.findMany({
        where: { userId: target.id, guildId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.infraction.count({ where: { userId: target.id, guildId } }),
    ]);

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setAuthor({ name: `Infractions for ${target.tag}`, iconURL: target.displayAvatarURL() })
      .setFooter({ text: `Showing ${infractions.length} of ${total} infractions` });

    if (infractions.length === 0) {
      embed.setDescription('✅ No infractions on record.');
    } else {
      const lines = infractions.map((inf) => {
        const emoji = TYPE_EMOJI[inf.type] ?? '•';
        const timestamp = Math.floor(inf.createdAt.getTime() / 1000);
        const duration = inf.duration ? ` (${formatDuration(inf.duration)})` : '';
        return `${emoji} \`#${inf.caseNumber}\` **${inf.type}**${duration} — ${inf.reason.slice(0, 60)}\n  <t:${timestamp}:R> by <@${inf.moderatorId}>`;
      });
      embed.setDescription(lines.join('\n\n'));
    }

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
