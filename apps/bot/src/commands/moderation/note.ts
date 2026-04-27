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
    .setName('note')
    .setDescription('Add a private staff note to a user\'s record')
    .addUserOption((o) =>
      o.setName('user').setDescription('User to attach the note to').setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName('note')
        .setDescription('Note content (visible to staff only)')
        .setRequired(true)
        .setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const target = interaction.options.getUser('user', true);
    const note = interaction.options.getString('note', true);
    const guildId = interaction.guildId!;

    if (target.bot) {
      return void interaction.editReply(err('You cannot add notes to bots.'));
    }

    await db.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, username: target.username },
      update: { username: target.username },
    });

    const infraction = await db.infraction.create({
      data: {
        userId: target.id,
        guildId,
        type: InfractionType.NOTE,
        reason: note,
        moderatorId: interaction.user.id,
      },
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Grey)
          .setDescription(`📝 Note added to **${target.username}** — Case \`#${infraction.caseNumber}\``)
          .addFields({ name: 'Note', value: note })
          .setFooter({ text: 'This note is not visible to the user.' })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
