import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { db } from '@clx/database';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('delcase')
    .setDescription('Delete/void a moderation case')
    .addStringOption((o) =>
      o.setName('id').setDescription('Case ID to delete (last 6 characters)').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for deletion').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const input = interaction.options.getString('id', true).toUpperCase().replace('#', '');
    const reason = interaction.options.getString('reason', true);
    const guildId = interaction.guildId!;

    const infractions = await db.infraction.findMany({ where: { guildId } });
    const infraction = infractions.find((i) => i.id.slice(-6).toUpperCase() === input);

    if (!infraction) {
      return void interaction.editReply(`No case found with ID \`#${input}\`.`);
    }

    await db.infraction.delete({ where: { id: infraction.id } });

    await interaction.editReply(
      `Case \`#${input}\` (${infraction.type}) has been deleted.\n**Reason:** ${reason}`,
    );
  },
} satisfies Command;
