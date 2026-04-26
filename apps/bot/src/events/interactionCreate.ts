import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  Collection,
  Colors,
  EmbedBuilder,
  Interaction,
  MessageFlags,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { db } from '@clx/database';
import type { BotClient } from '../client';
import type { Event } from '../types';

const err = (msg: string) => ({
  embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`❌ ${msg}`)],
});

async function createTicket(
  interaction: { deferReply: Function; editReply: Function; user: any; guildId: string | null; guild: any; fields?: any },
  subject: string,
) {
  const guildId = interaction.guildId!;
  const guild = interaction.guild!;

  const settings = await db.guildSettings.findUnique({ where: { guildId } });
  if (settings?.ticketsEnabled === false) {
    return void (interaction as any).editReply(err('The ticket system is currently disabled.'));
  }
  if (!settings?.ticketChannelId) {
    return void (interaction as any).editReply(err('No ticket channel configured. An admin must set it in the dashboard → Settings → Tickets.'));
  }

  const ticketChannel = guild.channels.cache.get(settings.ticketChannelId) as TextChannel | null;
  if (!ticketChannel?.isTextBased()) {
    return void (interaction as any).editReply(err('The configured ticket channel no longer exists. Please reconfigure it in the dashboard.'));
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

  const openMsg = (settings.ticketOpenMessage ?? '{member}')
    .replace('{member}', `<@${interaction.user.id}>`);

  await thread.send({
    content: openMsg,
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

  await (interaction as any).editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x4ade80)
        .setDescription(`🎫 Ticket **#${ticket.ticketNumber}** opened → <#${thread.id}>`),
    ],
  });
}

function ticketModal(customId: string, title: string, placeholder: string): ModalBuilder {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('subject')
        .setLabel('Subject')
        .setPlaceholder(placeholder)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100),
    ),
  );
  return modal;
}

export default {
  name: 'interactionCreate',
  async execute(...args: unknown[]) {
    const interaction = args[0] as Interaction;

    if (interaction.isAutocomplete()) {
      const client = interaction.client as BotClient;
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        await command.autocomplete(interaction).catch(console.error);
      }
      return;
    }

    // ── Ticket panel button ────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'ticket:open') {
      await interaction.showModal(
        ticketModal('ticket:modal', 'Open a Ticket', 'Brief description of your issue'),
      );
      return;
    }

    // ── Ticket category select menu ────────────────────────────────────
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket:category') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const category = interaction.values[0];
      await createTicket(interaction as any, category);
      return;
    }

    // ── Ticket modal submit ────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket:modal')) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const rest = interaction.customId.slice('ticket:modal'.length);
      const category = rest.startsWith(':') ? decodeURIComponent(rest.slice(1)) : null;
      const rawSubject = interaction.fields.getTextInputValue('subject');
      const subject = category ? `[${category}] ${rawSubject}` : rawSubject;

      await createTicket(interaction as any, subject);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as BotClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`[Interaction] Unknown command: ${interaction.commandName}`);
      return;
    }

    // Cooldown check
    if (command.cooldown) {
      const now = Date.now();
      const cooldownAmount = command.cooldown * 1_000;

      if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection());
      }
      const timestamps = client.cooldowns.get(command.data.name)!;
      const userId = interaction.user.id;

      if (timestamps.has(userId)) {
        const expiry = timestamps.get(userId)! + cooldownAmount;
        if (now < expiry) {
          const remaining = ((expiry - now) / 1_000).toFixed(1);
          await (interaction as ChatInputCommandInteraction).reply({
            content: `Please wait ${remaining}s before using \`/${command.data.name}\` again.`,
            flags: [MessageFlags.Ephemeral],
          });
          return;
        }
      }

      timestamps.set(userId, now);
      setTimeout(() => timestamps.delete(userId), cooldownAmount);
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (e) {
      console.error(`[Command Error] /${interaction.commandName}:`, e);
      const errEmbed = {
        embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription('❌ An error occurred while running this command.')],
        flags: [MessageFlags.Ephemeral] as const,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errEmbed).catch(() => null);
      } else {
        await interaction.reply(errEmbed).catch(() => null);
      }
    }
  },
} satisfies Event;
