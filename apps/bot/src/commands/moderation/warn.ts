import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
} from 'discord.js';
import { db, InfractionType } from '@clx/database';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to warn').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the warning').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    if (target.bot) {
      return void interaction.editReply('You cannot warn a bot.');
    }
    if (target.id === interaction.user.id) {
      return void interaction.editReply('You cannot warn yourself.');
    }

    // Ensure user exists in DB
    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.WARN,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    const caseId = infraction.id.slice(-6).toUpperCase();

    // DM the target
    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle('You have been warned')
      .addFields(
        { name: 'Server', value: guild.name },
        { name: 'Reason', value: reason },
        { name: 'Case', value: `#${caseId}` },
      )
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => null);

    await interaction.editReply(
      `Warned **${target.username}** — Case \`#${caseId}\``,
    );
  },
} satisfies Command;
