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
      return void interaction.editReply(err('This command can only be used in server text channels.'));
    }

    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
    });

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`🔒 **Channel locked** — ${reason}`)
          .setFooter({ text: `Locked by ${interaction.user.tag}` })
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Red)
          .setDescription(`🔒 Channel locked.`)
          .addFields({ name: 'Reason', value: reason }),
      ],
    });
  },
} satisfies Command;
