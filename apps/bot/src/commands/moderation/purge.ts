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
    .setName('purge')
    .setDescription('Bulk delete messages in this channel')
    .addIntegerOption((o) =>
      o
        .setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addUserOption((o) =>
      o.setName('user').setDescription('Only delete messages from this user'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const amount = interaction.options.getInteger('amount', true);
    const targetUser = interaction.options.getUser('user');

    if (!interaction.channel?.isTextBased()) {
      return void interaction.editReply(err('This command can only be used in text channels.'));
    }
    const channel = interaction.channel as TextChannel;

    const messages = await channel.messages.fetch({ limit: 100 });
    let toDelete = [...messages.values()];

    if (targetUser) {
      toDelete = toDelete.filter((m) => m.author.id === targetUser.id);
    }

    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1_000;
    toDelete = toDelete.filter((m) => m.createdTimestamp > cutoff).slice(0, amount);

    if (toDelete.length === 0) {
      return void interaction.editReply(err('No deletable messages found (messages older than 14 days cannot be bulk deleted).'));
    }

    const deleted = await channel.bulkDelete(toDelete, true);

    const desc = targetUser
      ? `🗑️ Deleted **${deleted.size}** message${deleted.size !== 1 ? 's' : ''} from **${targetUser.username}**`
      : `🗑️ Deleted **${deleted.size}** message${deleted.size !== 1 ? 's' : ''}`;
    const note = deleted.size < amount ? `\n-# Only ${deleted.size} deletable messages found.` : '';

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blurple)
          .setDescription(desc + note)
          .setTimestamp(),
      ],
    });
  },
} satisfies Command;
