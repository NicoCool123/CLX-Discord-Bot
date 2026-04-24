import { ChatInputCommandInteraction, Interaction, MessageFlags } from 'discord.js';
import type { BotClient } from '../client';
import type { Event } from '../types';

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
        const { Collection } = await import('discord.js');
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
    } catch (err) {
      console.error(`[Command Error] /${interaction.commandName}:`, err);
      const errContent = 'An error occurred while running this command.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errContent, flags: [MessageFlags.Ephemeral] }).catch(() => null);
      } else {
        await interaction.reply({ content: errContent, flags: [MessageFlags.Ephemeral] }).catch(() => null);
      }
    }
  },
} satisfies Event;
