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
      return void interaction.editReply(err('You cannot kick yourself.'));
    }
    if (target.id === interaction.client.user?.id) {
      return void interaction.editReply(err('I cannot kick myself.'));
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return void interaction.editReply(err('That member is not in this server.'));
    }
    if (!member.kickable) {
      return void interaction.editReply(err('I cannot kick this member (missing permissions or higher role).'));
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

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Orange)
          .setDescription(`👢 Kicked **${target.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
