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

    if (!/^\d{17,20}$/.test(userId)) {
      return void interaction.editReply(err('Invalid user ID format.'));
    }

    const ban = await guild.bans.fetch(userId).catch(() => null);
    if (!ban) {
      return void interaction.editReply(err('That user is not banned in this server.'));
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

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Unbanned **${ban.user.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
