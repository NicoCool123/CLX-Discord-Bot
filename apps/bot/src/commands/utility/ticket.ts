import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { db } from '@clx/database';
import type { Command } from '../../types';

const err = (msg: string) => ({ embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)] });

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system')

    .addSubcommand((sub) =>
      sub
        .setName('open')
        .setDescription('Open a new support ticket')
        .addStringOption((o) =>
          o.setName('subject').setDescription('Brief description of your issue').setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName('close')
        .setDescription('Close this ticket thread')
        .addStringOption((o) =>
          o.setName('reason').setDescription('Reason for closing'),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a user to this ticket thread')
        .addUserOption((o) =>
          o.setName('user').setDescription('User to add').setRequired(true),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    // ── /ticket open ──────────────────────────────────────────────────
    if (sub === 'open') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const subject = interaction.options.getString('subject', true);

      const settings = await db.guildSettings.findUnique({ where: { guildId } });
      if (!settings?.ticketChannelId) {
        return void interaction.editReply(err('No ticket channel configured. An admin must set it in the dashboard → Settings.'));
      }

      const ticketChannel = guild.channels.cache.get(settings.ticketChannelId) as TextChannel | null;
      if (!ticketChannel?.isTextBased()) {
        return void interaction.editReply(err('The configured ticket channel no longer exists. Please reconfigure it in the dashboard.'));
      }

      const thread = await ticketChannel.threads.create({
        name: `🎫 ${interaction.user.username} — ${subject.slice(0, 40)}`,
        type: ChannelType.PublicThread,
        reason: `Ticket by ${interaction.user.tag}: ${subject}`,
      });

      await thread.members.add(interaction.user.id);

      const ticket = await db.ticket.create({
        data: { guildId, threadId: thread.id, creatorId: interaction.user.id, subject },
      });

      await thread.send({
        content: `<@${interaction.user.id}>`,
        embeds: [
          new EmbedBuilder()
            .setColor(0x4ade80)
            .setTitle(`🎫 Ticket #${ticket.ticketNumber}`)
            .setDescription(`**${subject}**`)
            .addFields(
              { name: 'Opened by', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Status', value: '🟢 Open', inline: true },
            )
            .setFooter({ text: 'Use /ticket close to close · /ticket add to add a user' })
            .setTimestamp(),
        ],
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x4ade80)
            .setDescription(`🎫 Ticket **#${ticket.ticketNumber}** opened → <#${thread.id}>`),
        ],
      });
    }

    // ── /ticket close ─────────────────────────────────────────────────
    if (sub === 'close') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const reason = interaction.options.getString('reason') ?? 'No reason provided';
      const channel = interaction.channel;

      if (!channel?.isThread()) {
        return void interaction.editReply(err('This command can only be used inside a ticket thread.'));
      }

      const ticket = await db.ticket.findUnique({ where: { threadId: channel.id } });
      if (!ticket) {
        return void interaction.editReply(err('This thread is not a registered ticket.'));
      }
      if (ticket.status === 'CLOSED') {
        return void interaction.editReply(err('This ticket is already closed.'));
      }

      const member = await guild.members.fetch(interaction.user.id);
      const isCreator = ticket.creatorId === interaction.user.id;
      const isMod = member.permissions.has(PermissionFlagsBits.ManageGuild);

      if (!isCreator && !isMod) {
        return void interaction.editReply(err('Only the ticket creator or a moderator can close this ticket.'));
      }

      await db.ticket.update({
        where: { id: ticket.id },
        data: { status: 'CLOSED', closedReason: reason, closedAt: new Date() },
      });

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`🔒 Ticket #${ticket.ticketNumber} Closed`)
            .addFields(
              { name: 'Closed by', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Reason', value: reason },
            )
            .setTimestamp(),
        ],
      });

      await channel.setArchived(true, reason).catch(() => null);

      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(Colors.Green).setDescription('✅ Ticket closed and archived.')],
      });
    }

    // ── /ticket add ───────────────────────────────────────────────────
    if (sub === 'add') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const channel = interaction.channel;
      if (!channel?.isThread()) {
        return void interaction.editReply(err('This command can only be used inside a ticket thread.'));
      }

      const ticket = await db.ticket.findUnique({ where: { threadId: channel.id } });
      if (!ticket) {
        return void interaction.editReply(err('This thread is not a registered ticket.'));
      }

      const target = interaction.options.getUser('user', true);
      await channel.members.add(target.id);

      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(Colors.Green).setDescription(`✅ Added <@${target.id}> to Ticket #${ticket.ticketNumber}.`)],
      });
    }
  },
} satisfies Command;
