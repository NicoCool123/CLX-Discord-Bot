import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { db, InfractionType } from '@clx/database';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption((o) =>
      o
        .setName('user_id')
        .setDescription('Discord user ID to unban')
        .setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the unban').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.options.getString('user_id', true).trim();
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    // Validate ID format
    if (!/^\d{17,20}$/.test(userId)) {
      return void interaction.editReply('Invalid user ID format.');
    }

    const ban = await guild.bans.fetch(userId).catch(() => null);
    if (!ban) {
      return void interaction.editReply('That user is not banned in this server.');
    }

    await guild.members.unban(userId, reason);

    await db.user.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, username: ban.user.username },
      update: { username: ban.user.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId,
        guildId,
        type: InfractionType.UNBAN,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    const caseId = infraction.id.slice(-6).toUpperCase();

    await interaction.editReply(
      `Unbanned **${ban.user.username}** — Case \`#${caseId}\``,
    );
  },
} satisfies Command;
