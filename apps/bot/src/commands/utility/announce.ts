import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
  ChannelType,
  TextChannel,
} from 'discord.js';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

const COLOR_MAP: Record<string, number> = {
  blue: Colors.Blurple,
  red: Colors.Red,
  green: Colors.Green,
  yellow: Colors.Yellow,
};

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a formatted announcement to a channel')
    .addChannelOption((o) =>
      o
        .setName('channel')
        .setDescription('Channel to send the announcement to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('title').setDescription('Announcement title').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('message').setDescription('Announcement content').setRequired(true).setMaxLength(2000),
    )
    .addStringOption((o) =>
      o
        .setName('color')
        .setDescription('Embed color (default: blue)')
        .addChoices(
          { name: 'Blue', value: 'blue' },
          { name: 'Red', value: 'red' },
          { name: 'Green', value: 'green' },
          { name: 'Yellow', value: 'yellow' },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channel = interaction.options.getChannel('channel', true) as TextChannel;
    const title = interaction.options.getString('title', true);
    const message = interaction.options.getString('message', true);
    const colorKey = interaction.options.getString('color') ?? 'blue';
    const color = COLOR_MAP[colorKey] ?? Colors.Blurple;

    if (!channel.isTextBased()) {
      return void interaction.editReply(err('That channel is not a text channel.'));
    }

    const me = interaction.guild?.members.me;
    if (!me?.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) {
      return void interaction.editReply(err(`I don't have permission to send messages in <#${channel.id}>.`));
    }

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setDescription(message)
          .setFooter({ text: `Announced by ${interaction.user.username}` })
          .setTimestamp(),
      ],
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ Announcement sent to <#${channel.id}>.`),
      ],
    });
  },
} satisfies Command;
