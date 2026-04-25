import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

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
      return void interaction.editReply(err('This command can only be used in server text channels.'));
    }

    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: null,
    });

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('🔓 **Channel unlocked** — members can send messages again.')
          .setFooter({ text: `Unlocked by ${interaction.user.tag}` })
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('🔓 Channel unlocked.'),
      ],
    });
  },
} satisfies Command;
