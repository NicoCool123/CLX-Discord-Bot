import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel so members cannot send messages')
    .addStringOption((o) =>
      o.setName('reason').setDescription('Reason for locking'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const channel = interaction.channel as TextChannel;
    const guild = interaction.guild!;

    if (!channel.isTextBased() || channel.isDMBased()) {
      return void interaction.editReply('This command can only be used in server text channels.');
    }

    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
    });

    await channel.send({
      embeds: [
        {
          color: 0xef4444,
          description: `🔒 **Channel locked** — ${reason}`,
          footer: { text: `Locked by ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    await interaction.editReply('Channel locked.');
  },
} satisfies Command;
