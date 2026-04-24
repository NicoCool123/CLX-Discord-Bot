import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import type { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel so members can send messages again')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channel = interaction.channel as TextChannel;
    const guild = interaction.guild!;

    if (!channel.isTextBased() || channel.isDMBased()) {
      return void interaction.editReply('This command can only be used in server text channels.');
    }

    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: null, // Resets to default (inherit)
    });

    await channel.send({
      embeds: [
        {
          color: 0x22c55e,
          description: `🔓 **Channel unlocked** — members can send messages again.`,
          footer: { text: `Unlocked by ${interaction.user.tag}` },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    await interaction.editReply('Channel unlocked.');
  },
} satisfies Command;
