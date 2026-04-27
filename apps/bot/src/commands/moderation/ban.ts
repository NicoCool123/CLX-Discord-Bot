import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
} from 'discord.js';
import { db, InfractionType } from '@clx/database';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

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
      return void interaction.editReply(err('You cannot ban yourself.'));
    }
    if (target.id === interaction.client.user?.id) {
      return void interaction.editReply(err('I cannot ban myself.'));
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      return void interaction.editReply(err('I cannot ban this member (missing permissions or higher role).'));
    }

    if (member) {
      const executor = await guild.members.fetch(interaction.user.id).catch(() => null);
      if (executor && member.roles.highest.position >= executor.roles.highest.position) {
        return void interaction.editReply(err('You cannot ban a member with an equal or higher role.'));
      }
    }

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

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`🔨 Banned **${target.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Messages deleted', value: `${deleteMessageDays}d`, inline: true },
          )
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
