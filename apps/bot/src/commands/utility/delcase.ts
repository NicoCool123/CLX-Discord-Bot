import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
} from 'discord.js';
import { db } from '@clx/database';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

export default {
  data: new SlashCommandBuilder()
    .setName('delcase')
    .setDescription('Delete/void a moderation case')
    .addIntegerOption((o) =>
      o.setName('id').setDescription('Case number to delete').setRequired(true).setMinValue(1),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for deletion').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const caseNumber = interaction.options.getInteger('id', true);
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;

    const infraction = await db.infraction.findFirst({ where: { guildId, caseNumber } });

    if (!infraction) {
      return void interaction.editReply(err(`No case found with ID \`#${caseNumber}\`.`));
    }

    await db.infraction.delete({ where: { id: infraction.id } });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`🗑️ Case \`#${caseNumber}\` (**${infraction.type}**) has been deleted.`)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
