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
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to ban').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the ban').setRequired(true),
    )
    .addIntegerOption((o) =>
      o
        .setName('delete_messages')
        .setDescription('Delete messages from the past N days (0-7)')
        .setMinValue(0)
        .setMaxValue(7),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const deleteMessageDays = interaction.options.getInteger('delete_messages') ?? 0;
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    if (target.id === interaction.user.id) {
      return void interaction.editReply('You cannot ban yourself.');
    }
    if (target.id === interaction.client.user?.id) {
      return void interaction.editReply('I cannot ban myself.');
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      return void interaction.editReply(
        'I cannot ban this member (missing permissions or higher role).',
      );
    }

    // DM before ban (will fail after)
    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('You have been banned')
      .addFields(
        { name: 'Server', value: guild.name },
        { name: 'Reason', value: reason },
      )
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => null);

    await guild.members.ban(target, {
      reason,
      deleteMessageSeconds: deleteMessageDays * 86_400,
    });

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.BAN,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    const caseId = infraction.id.slice(-6).toUpperCase();

    await interaction.editReply(
      `Banned **${target.username}** — Case \`#${caseId}\``,
    );
  },
} satisfies Command;
