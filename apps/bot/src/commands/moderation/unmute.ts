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
    .setName('unmute')
    .setDescription('Remove a timeout from a member')
    .addUserOption((o) =>
      o.setName('user').setDescription('Member to unmute').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for removing the timeout').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return void interaction.editReply(err('That member is not in this server.'));
    }

    const timedOutUntil = member.communicationDisabledUntilTimestamp;
    if (!timedOutUntil || timedOutUntil <= Date.now()) {
      return void interaction.editReply(err('That member is not currently timed out.'));
    }

    await member.timeout(null, reason);

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.UNMUTE,
        reason,
        moderatorId: interaction.user.id,
      },
    });

    await target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('Your timeout has been removed')
          .addFields(
            { name: 'Server', value: guild.name },
            { name: 'Reason', value: reason },
            { name: 'Case', value: `#${infraction.caseNumber}` },
          )
          .setTimestamp(),
      ],
    }).catch(() => null);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`🔊 Removed timeout from **${target.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
