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
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to kick').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for the kick').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    if (target.id === interaction.user.id) {
      return void interaction.editReply('You cannot kick yourself.');
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return void interaction.editReply('That member is not in this server.');
    }
    if (!member.kickable) {
      return void interaction.editReply(
        'I cannot kick this member (missing permissions or higher role).',
      );
    }

    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle('You have been kicked')
      .addFields(
        { name: 'Server', value: guild.name },
        { name: 'Reason', value: reason },
      )
      .setTimestamp();

    await target.send({ embeds: [dmEmbed] }).catch(() => null);
    await member.kick(reason);

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.KICK,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    const caseId = infraction.id.slice(-6).toUpperCase();
    await interaction.editReply(`Kicked **${target.username}** — Case \`#${caseId}\``);
  },
} satisfies Command;
