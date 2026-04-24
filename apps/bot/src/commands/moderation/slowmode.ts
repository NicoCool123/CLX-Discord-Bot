import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode for this channel')
    .addIntegerOption((o) =>
      o
        .setName('seconds')
        .setDescription('Slowmode in seconds (0 to disable, max 21600)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const seconds = interaction.options.getInteger('seconds', true);
    const channel = interaction.channel as TextChannel;

    if (!('setRateLimitPerUser' in channel)) {
      return void interaction.editReply('Slowmode can only be set in text channels.');
    }

    await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

    if (seconds === 0) {
      await interaction.editReply('Slowmode **disabled** in this channel.');
    } else {
      await interaction.editReply(`Slowmode set to **${seconds}s** in this channel.`);
    }
  },
} satisfies Command;
