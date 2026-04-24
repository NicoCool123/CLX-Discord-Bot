import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import type { Command } from '../../types';

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
    const channel = interaction.channel as TextChannel;

    if (!channel.isTextBased()) {
      return void interaction.editReply('This command can only be used in text channels.');
    }

    // Fetch messages (bulk delete only works on messages < 14 days old)
    const messages = await channel.messages.fetch({ limit: 100 });

    let toDelete = [...messages.values()];

    // Filter by user if specified
    if (targetUser) {
      toDelete = toDelete.filter((m) => m.author.id === targetUser.id);
    }

    // Only keep the requested amount and messages < 14 days old
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1_000;
    toDelete = toDelete
      .filter((m) => m.createdTimestamp > cutoff)
      .slice(0, amount);

    if (toDelete.length === 0) {
      return void interaction.editReply('No deletable messages found (messages older than 14 days cannot be bulk deleted).');
    }

    const deleted = await channel.bulkDelete(toDelete, true);

    await interaction.editReply(
      `Deleted **${deleted.size}** message${deleted.size !== 1 ? 's' : ''}${targetUser ? ` from **${targetUser.username}**` : ''}.`,
    );
  },
} satisfies Command;
