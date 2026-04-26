import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
  MessageFlags,
  TextChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
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
    )

    .addSubcommand((sub) =>
      sub
        .setName('panel')
        .setDescription('Send a ticket panel to a channel')
        .addStringOption((o) =>
          o.setName('title').setDescription('Panel embed title').setRequired(false),
        )
        .addStringOption((o) =>
          o.setName('description').setDescription('Panel embed description').setRequired(false),
        )
        .addStringOption((o) =>
          o.setName('button').setDescription('Button/placeholder label (default: 🎫 Open Ticket)').setRequired(false),
        )
        .addStringOption((o) =>
          o
            .setName('categories')
            .setDescription('Comma-separated support types for the dropdown, e.g. Technical,Billing,General')
            .setRequired(false),
        )
        .addStringOption((o) =>
          o
            .setName('open-message')
            .setDescription('Message sent when a ticket opens. Use {member} to ping the user.')
            .setRequired(false),
        )
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel to send the panel to (defaults to current channel)').setRequired(false),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const guild = interaction.guild!;

    // ── /ticket close ─────────────────────────────────────────────────
    if (sub === 'close') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const reason = interaction.options.getString('reason') ?? 'No reason provided';
      const channel = interaction.channel;

      if (!channel?.isThread()) {
        return void interaction.editReply(err('This command can only be used inside a ticket thread.'));
      }

      const ticket = await db.ticket.findUnique({ where: { threadId: channel.id } });
      if (!ticket) return void interaction.editReply(err('This thread is not a registered ticket.'));
      if (ticket.status === 'CLOSED') return void interaction.editReply(err('This ticket is already closed.'));

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
      if (!ticket) return void interaction.editReply(err('This thread is not a registered ticket.'));

      const target = interaction.options.getUser('user', true);
      await channel.members.add(target.id);

      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(Colors.Green).setDescription(`✅ Added <@${target.id}> to Ticket #${ticket.ticketNumber}.`)],
      });
    }

    // ── /ticket panel ─────────────────────────────────────────────────
    if (sub === 'panel') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const member = await guild.members.fetch(interaction.user.id);
      if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return void interaction.editReply(err('You need **Manage Server** permission to send a ticket panel.'));
      }

      const title = interaction.options.getString('title') ?? 'Support Tickets';
      const description =
        interaction.options.getString('description') ??
        'Select your support type below to open a ticket. Our staff will assist you as soon as possible.';
      const label = interaction.options.getString('button') ?? '🎫 Open Ticket';
      const openMessage = interaction.options.getString('open-message');
      const categoriesInput = interaction.options.getString('categories');
      const targetChannel = (interaction.options.getChannel('channel') ?? interaction.channel) as TextChannel;

      await db.guild.upsert({
        where: { guildId },
        update: {},
        create: { guildId, name: guild.name },
      });

      const updateData: Record<string, unknown> = {};
      if (openMessage) updateData.ticketOpenMessage = openMessage;
      if (categoriesInput !== null) {
        updateData.ticketCategories = categoriesInput
          ? categoriesInput.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 25)
          : [];
      }

      if (Object.keys(updateData).length > 0) {
        await db.guildSettings.upsert({
          where: { guildId },
          update: updateData,
          create: { guildId, ...updateData },
        });
      }

      const settings = await db.guildSettings.findUnique({ where: { guildId } });
      const categories = settings?.ticketCategories ?? [];

      const panelEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined })
        .setTimestamp();

      let row: ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>;

      if (categories.length > 0) {
        const menu = new StringSelectMenuBuilder()
          .setCustomId('ticket:category')
          .setPlaceholder(label)
          .addOptions(categories.map((cat) => ({ label: cat, value: cat })));
        row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
      } else {
        const button = new ButtonBuilder()
          .setCustomId('ticket:open')
          .setLabel(label)
          .setStyle(ButtonStyle.Primary);
        row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
      }

      await targetChannel.send({ embeds: [panelEmbed], components: [row] });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(
              `✅ Ticket panel sent to <#${targetChannel.id}>.${categories.length > 0 ? `\n**${categories.length} support type${categories.length > 1 ? 's' : ''}** in the dropdown.` : ''}`,
            ),
        ],
      });
    }
  },
} satisfies Command;
